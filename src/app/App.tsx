import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/useAppStore';
import { assetFromLocation, layerUrl } from '../lib/manifest';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { BottomSheet } from '../components/BottomSheet';
import { ChevronIcon, FocusIcon, ResetIcon } from '../components/icons';
import { LayerControls, SystemFilter } from '../features/anatomy/LayerControls';
import { InfoPanel } from '../features/anatomy/InfoPanel';
import { BrowsePanel } from '../features/anatomy/BrowsePanel';
import { AboutSection } from '../features/anatomy/AboutSection';
import { useStructureName } from '../features/anatomy/useNames';
import { SearchBox } from '../features/search/SearchBox';
import { TourBar } from '../features/learning/TourBar';
import { INTRO_TOUR } from '../data/tours/tours';

// three.js and React Three Fiber load separately, after the first paint.
const Viewer = lazy(() => import('../features/viewer/Viewer'));
const HierarchyPanel = lazy(() => import('../debug/HierarchyPanel').then((m) => ({ default: m.HierarchyPanel })));

const MOBILE_QUERY = '(max-width: 900px)';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const on = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}

export default function App() {
  const { t } = useTranslation();
  const view = useAppStore((s) => s.view);
  const asset = useAppStore((s) => s.asset);
  const leftOpen = useAppStore((s) => s.leftOpen);
  const rightOpen = useAppStore((s) => s.rightOpen);
  const tour = useAppStore((s) => s.tour);
  const loadAsset = useAppStore((s) => s.loadAsset);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const isMobile = useIsMobile();
  const entry = useMemo(() => assetFromLocation(location.search), []);
  const debug = useMemo(() => new URLSearchParams(location.search).has('debug'), []);
  const mode = view === 'home' ? 'home' : isMobile ? 'mobile' : 'explore';

  useEffect(() => {
    void loadAsset(entry);
  }, [entry, loadAsset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && clearSelection();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clearSelection]);

  useEffect(() => {
    document.title = t('app.pageTitle');
  }, [t]);

  const hasFiles = asset.status === 'ready' && asset.manifest.layers.some((l) => layerUrl(asset.manifest, l.id));

  const noWebGL = (
    <div className="state">
      <h2>{t('state.noWebglTitle')}</h2>
      <p>{t('state.noWebglBody')}</p>
    </div>
  );

  const stage = (
    <main className="stage" id="main">
      {asset.status === 'loading' && <div className="state" role="status">{t('state.loading')}</div>}
      {asset.status === 'error' && (
        <div className="state" role="alert">
          <h2>{t('state.unavailableTitle')}</h2>
          <p>{t('state.unavailableBody')}</p>
          <p className="state-detail">{asset.error}</p>
          <button type="button" className="primary-button" onClick={() => void loadAsset(entry)}>{t('state.retry')}</button>
        </div>
      )}
      {hasFiles && (
        <ErrorBoundary
          fallback={(err) => (
            <div className="state" role="alert">
              <h2>{t('state.crashedTitle')}</h2>
              <p className="state-detail">{err.message}</p>
              <button type="button" className="primary-button" onClick={() => location.reload()}>{t('state.reload')}</button>
            </div>
          )}
        >
          <Suspense fallback={<div className="state" role="status">{t('state.loading')}</div>}>
            <Viewer fallback={noWebGL} />
          </Suspense>
          {view === 'explore' && <ViewerControls />}
        </ErrorBoundary>
      )}
      {mode === 'explore' && <PanelToggles />}
      {mode === 'explore' && <TourBar />}
    </main>
  );

  const goHome = () => useAppStore.getState().setView('home');

  // One tree for every mode, with the stage in a fixed slot: the 3D canvas stays alive
  // when moving between the start page and the explorer, so the model never reloads.
  return (
    <div className={`app ${mode}`} data-left={leftOpen} data-right={rightOpen}>
      {mode === 'home' && <Home />}
      {mode === 'mobile' && (
        <header className="mobile-top">
          <button type="button" className="brand-button" onClick={goHome} aria-label={t('app.home')}>
            <Mark />
          </button>
          <SearchBox />
          <LanguageSwitch />
        </header>
      )}
      {mode === 'explore' && leftOpen && (
        <aside className="panel left" aria-label={t('app.controlsLabel')}>
          <header className="panel-head">
            <button type="button" className="brand-button" onClick={goHome} aria-label={t('app.home')}>
              <Mark />
              <span>{t('app.name')}</span>
            </button>
            <LanguageSwitch />
          </header>
          <SearchBox />
          <LayerControls />
          <SystemFilter />
          <TourLink />
          <BrowsePanel />
          <AboutSection />
          {debug && <Suspense fallback={null}><HierarchyPanel /></Suspense>}
        </aside>
      )}
      {stage}
      {mode === 'explore' && rightOpen && (
        <aside className="panel right" aria-label={t('app.infoLabel')}>
          <InfoPanel />
        </aside>
      )}
      {/* On mobile the tour takes the sheet's place, so the structure stays visible above it. */}
      {mode === 'mobile' && tour && <TourBar />}
      {mode === 'mobile' && !tour && (
        <BottomSheet
          peek={<SheetPeek />}
          tabs={{
            info: <InfoPanel />,
            layers: (
              <>
                <LayerControls />
                <SystemFilter />
              </>
            ),
            browse: (
              <>
                <BrowsePanel />
                <TourLink />
                <AboutSection />
                {debug && <Suspense fallback={null}><HierarchyPanel /></Suspense>}
              </>
            ),
          }}
        />
      )}
    </div>
  );
}

function Mark() {
  // Sphere and axis: the model turning in space.
  return (
    <svg className="mark" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </svg>
  );
}

function Home() {
  const { t } = useTranslation();
  const setView = useAppStore((s) => s.setView);
  const startTour = useAppStore((s) => s.startTour);
  const catalog = useAppStore((s) => s.catalog);
  const ready = !!catalog;
  return (
    <section className="home-copy">
      <header className="home-head">
        <span className="wordmark"><Mark /> {t('app.name')}</span>
        <LanguageSwitch />
      </header>
      <div className="home-main">
        <h1>{t('home.title')}</h1>
        <p className="lede">{t('home.body')}</p>
        <div className="home-actions">
          <button type="button" className="primary-button large" onClick={() => setView('explore')}>{t('home.explore')}</button>
          <button type="button" className="quiet-button large" disabled={!ready} onClick={() => startTour(INTRO_TOUR)}>{t('home.tour')}</button>
        </div>
      </div>
      <p className="home-note">{t('home.note')}</p>
    </section>
  );
}

function TourLink() {
  const { t } = useTranslation();
  const startTour = useAppStore((s) => s.startTour);
  const catalog = useAppStore((s) => s.catalog);
  const tour = useAppStore((s) => s.tour);
  if (!catalog || !INTRO_TOUR.steps.every((s) => catalog.recordById.has(s.recordId))) return null;
  return (
    <section className="block">
      <h2>{t('tour.linkTitle')}</h2>
      <p className="hint">{t('tour.linkBody')}</p>
      <button type="button" className="quiet-button" disabled={!!tour} onClick={() => startTour(INTRO_TOUR)}>{t('tour.start')}</button>
    </section>
  );
}

function ViewerControls() {
  const { t } = useTranslation();
  const sendCamera = useAppStore((s) => s.sendCamera);
  const hasSelection = useAppStore((s) => s.selection.ids.length > 0);
  return (
    <div className="viewer-controls">
      <button type="button" className="icon-button" onClick={() => sendCamera('reset')} aria-label={t('viewer.reset')} title={t('viewer.reset')}><ResetIcon /></button>
      <button type="button" className="icon-button" disabled={!hasSelection} onClick={() => sendCamera('focus')} aria-label={t('viewer.focus')} title={t('viewer.focus')}><FocusIcon /></button>
    </div>
  );
}

function PanelToggles() {
  const { t } = useTranslation();
  const leftOpen = useAppStore((s) => s.leftOpen);
  const rightOpen = useAppStore((s) => s.rightOpen);
  const togglePanel = useAppStore((s) => s.togglePanel);
  return (
    <>
      <button type="button" className="panel-toggle left" aria-expanded={leftOpen} aria-label={leftOpen ? t('viewer.hideControls') : t('viewer.showControls')} onClick={() => togglePanel('left')}>
        <ChevronIcon direction={leftOpen ? 'left' : 'right'} />
      </button>
      <button type="button" className="panel-toggle right" aria-expanded={rightOpen} aria-label={rightOpen ? t('viewer.hideInfo') : t('viewer.showInfo')} onClick={() => togglePanel('right')}>
        <ChevronIcon direction={rightOpen ? 'right' : 'left'} />
      </button>
    </>
  );
}

function SheetPeek() {
  const { t, i18n } = useTranslation();
  const selection = useAppStore((s) => s.selection);
  const catalog = useAppStore((s) => s.catalog);
  const openSheetTab = useAppStore((s) => s.openSheetTab);
  const partName = useStructureName(selection.primaryId);
  const record = selection.recordId ? catalog?.recordById.get(selection.recordId) : undefined;
  const lang = i18n.language === 'id' ? 'id' : 'en';
  const name = record ? record.name[lang] : partName;
  if (!name) return <p className="peek-hint">{t('sheet.hint')}</p>;
  return (
    <button type="button" className="peek-name" onClick={() => openSheetTab('info')}>
      <strong>{name}</strong>
      <span>{t('sheet.readMore')}</span>
    </button>
  );
}

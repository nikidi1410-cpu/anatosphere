import { useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, type SheetState, type SheetTab } from '../stores/useAppStore';

const ORDER: SheetState[] = ['peek', 'half', 'full'];

/** Mobile information surface. Tap or drag the handle to move between its three heights. */
export function BottomSheet({ peek, tabs }: { peek: ReactNode; tabs: Record<SheetTab, ReactNode> }) {
  const { t } = useTranslation();
  const sheet = useAppStore((s) => s.sheet);
  const sheetTab = useAppStore((s) => s.sheetTab);
  const setSheet = useAppStore((s) => s.setSheet);
  const openSheetTab = useAppStore((s) => s.openSheetTab);
  const drag = useRef<{ y: number; moved: boolean } | null>(null);
  const index = ORDER.indexOf(sheet);

  const handleLabel = sheet === 'full' ? t('sheet.collapse') : t('sheet.expand');

  return (
    <section className="sheet" data-state={sheet} aria-label={t('sheet.label')}>
      <button
        type="button"
        className="sheet-handle"
        aria-label={handleLabel}
        aria-expanded={sheet !== 'peek'}
        onPointerDown={(e) => {
          drag.current = { y: e.clientY, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drag.current || drag.current.moved) return;
          const dy = e.clientY - drag.current.y;
          if (Math.abs(dy) < 24) return;
          drag.current.moved = true;
          setSheet(ORDER[Math.min(ORDER.length - 1, Math.max(0, index + (dy < 0 ? 1 : -1)))]);
        }}
        onClick={() => {
          if (!drag.current?.moved) setSheet(ORDER[(index + 1) % ORDER.length]);
          drag.current = null;
        }}
      >
        <span />
      </button>
      <div className="sheet-peek">{peek}</div>
      <div className="sheet-tabs" role="tablist" aria-label={t('sheet.tabs')}>
        {(['info', 'layers', 'browse'] as SheetTab[]).map((tab) => (
          <button key={tab} type="button" role="tab" aria-selected={sheetTab === tab} className={sheetTab === tab ? 'on' : undefined} onClick={() => openSheetTab(tab)}>
            {t(`sheet.${tab}`)}
          </button>
        ))}
      </div>
      <div className="sheet-body" role="tabpanel">
        {sheet !== 'peek' && tabs[sheetTab]}
      </div>
    </section>
  );
}

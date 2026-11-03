import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { REFERENCE_BY_ID } from '../../data/references/references';

export function TourBar() {
  const { t, i18n } = useTranslation();
  const tour = useAppStore((s) => s.tour);
  const catalog = useAppStore((s) => s.catalog);
  const goToTourStep = useAppStore((s) => s.goToTourStep);
  const exitTour = useAppStore((s) => s.exitTour);

  useEffect(() => {
    if (!tour) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && exitTour();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tour, exitTour]);

  if (!tour) return null;
  const lang = i18n.language === 'id' ? 'id' : 'en';
  const total = tour.tour.steps.length;

  if (tour.done) {
    return (
      <aside className="tour" aria-label={t('tour.label')}>
        <h2>{t('tour.doneTitle')}</h2>
        <p>{t('tour.doneBody')}</p>
        <div className="tour-actions">
          <button type="button" className="quiet-button" onClick={() => goToTourStep(0)}>{t('tour.restart')}</button>
          <button type="button" className="primary-button" onClick={exitTour}>{t('tour.keepExploring')}</button>
        </div>
      </aside>
    );
  }

  const record = catalog?.recordById.get(tour.tour.steps[tour.step].recordId);
  const reference = record ? REFERENCE_BY_ID.get(record.referenceIds[0]) : undefined;

  return (
    <aside className="tour" aria-label={t('tour.label')}>
      <div className="tour-progress" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={tour.step + 1} aria-label={t('tour.progress', { step: tour.step + 1, total })}>
        {tour.tour.steps.map((_, i) => (
          <span key={i} className={i <= tour.step ? 'on' : undefined} />
        ))}
      </div>
      <p className="tour-count">{t('tour.progress', { step: tour.step + 1, total })}</p>
      <h2>{record?.name[lang]}</h2>
      <p>{record?.location[lang]}</p>
      {reference && (
        <p className="tour-source">
          {t('tour.source')} <a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a>
        </p>
      )}
      <div className="tour-actions">
        <button type="button" className="text-button" onClick={exitTour}>{t('tour.exit')}</button>
        <span className="spacer" />
        <button type="button" className="quiet-button" disabled={tour.step === 0} onClick={() => goToTourStep(tour.step - 1)}>{t('tour.previous')}</button>
        <button type="button" className="primary-button" onClick={() => goToTourStep(tour.step + 1)}>
          {tour.step === total - 1 ? t('tour.finish') : t('tour.next')}
        </button>
      </div>
    </aside>
  );
}

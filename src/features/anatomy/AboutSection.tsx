import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';

/** Model credits, licenses and the educational-use notice. */
export function AboutSection() {
  const { t } = useTranslation();
  const asset = useAppStore((s) => s.asset);
  if (asset.status !== 'ready') return null;
  const m = asset.manifest;
  return (
    <details className="about">
      <summary>{t('about.title')}</summary>
      {m.notice && <p>{m.notice}</p>}
      <p>{t('about.disclaimer')}</p>
      {m.kind === 'anatomical' && <p>{t('about.limits')}</p>}
      {m.attribution && <p>{m.attribution}</p>}
      {m.modifications && <p>{m.modifications}</p>}
      {m.sourceLicense && (
        <p>{t('about.sourceLicense')} <a href={m.sourceLicense.url} target="_blank" rel="noreferrer">{m.sourceLicense.name}</a></p>
      )}
      {m.license && (
        <p>{t('about.modelLicense')} <a href={m.license.url} target="_blank" rel="noreferrer">{m.license.name}</a></p>
      )}
      {m.sourceUrl && <p><a href={m.sourceUrl} target="_blank" rel="noreferrer">{t('about.source')}</a></p>}
    </details>
  );
}

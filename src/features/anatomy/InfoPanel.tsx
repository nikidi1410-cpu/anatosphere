import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { REFERENCE_BY_ID } from '../../data/references/references';
import { useStructureName } from './useNames';

export function InfoPanel() {
  const { t, i18n } = useTranslation();
  const selection = useAppStore((s) => s.selection);
  const catalog = useAppStore((s) => s.catalog);
  const selectRecord = useAppStore((s) => s.selectRecord);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const sendCamera = useAppStore((s) => s.sendCamera);
  const partName = useStructureName(selection.primaryId);
  const lang = i18n.language === 'id' ? 'id' : 'en';

  const part = selection.primaryId ? catalog?.byId.get(selection.primaryId) : undefined;
  const record = selection.recordId ? catalog?.recordById.get(selection.recordId) : undefined;

  if (!part && !record) {
    return (
      <section className="block info-empty">
        <h2>{t('info.emptyTitle')}</h2>
        <p>{t('info.emptyBody')}</p>
      </section>
    );
  }

  const other = lang === 'id' ? 'en' : 'id';
  const mainName = record ? record.name[lang] : partName;
  const otherName = record ? record.name[other] : lang === 'id' ? part?.label : part?.nameId;
  const same = (a?: string, b?: string) => a?.toLowerCase() === b?.toLowerCase();
  // Many anatomical names are the same in English, Indonesian and Latin: say each only once.
  const latin = record?.name.latin && !same(record.name.latin, mainName) ? record.name.latin : null;
  const showOther = otherName && !same(otherName, mainName) && !same(otherName, latin ?? undefined);
  const showPart = record && selection.ids.length === 1 && part && !same(partName, mainName);

  return (
    <article className="info" aria-live="polite">
      <header className="info-head">
        <h2 className="info-name">{mainName}</h2>
        {latin && <p className="latin" lang="la">{latin}</p>}
        {showOther && <p className="other-name" lang={other}>{otherName}</p>}
        {showPart && <p className="part-note">{t('info.selectedPart', { part: partName })}</p>}
      </header>

      <div className="info-actions">
        <button type="button" className="quiet-button" onClick={() => sendCamera('focus')}>{t('info.focus')}</button>
        <button type="button" className="quiet-button" onClick={clearSelection}>{t('info.clear')}</button>
      </div>

      {record ? (
        <>
          <dl className="facts">
            <dt>{t('info.system')}</dt>
            <dd>{t(`systems.${record.systemId}`)}</dd>
            <dt>{t('info.region')}</dt>
            <dd>{t(`regions.${record.regionId}`)}</dd>
          </dl>
          <section className="prose">
            <p>{record.description[lang]}</p>
            <h3>{t('info.location')}</h3>
            <p>{record.location[lang]}</p>
            <h3>{t('info.function')}</h3>
            <p>{record.function[lang]}</p>
          </section>
          {record.modelNote && <p className="model-note">{record.modelNote[lang]}</p>}

          {record.relatedStructures.length > 0 && (
            <section className="related">
              <h3>{t('info.related')}</h3>
              <ul>
                {record.relatedStructures
                  .map((id) => catalog?.recordById.get(id))
                  .filter((r) => r !== undefined)
                  .map((r) => (
                    <li key={r.id}>
                      <button type="button" className="text-button" onClick={() => selectRecord(r.id)}>{r.name[lang]}</button>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          <section className="sources">
            <h3>{t('info.references')}</h3>
            <ul>
              {record.referenceIds.map((id) => {
                const ref = REFERENCE_BY_ID.get(id);
                if (!ref) return null;
                return (
                  <li key={id}>
                    <a href={ref.url} target="_blank" rel="noreferrer">{ref.title}</a>
                    <span>{ref.work}, {ref.publisher}. {t('info.accessed', { date: ref.accessed })}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {record.reviewStatus === 'draft' && <p className="status-note">{t('info.draft')}</p>}
        </>
      ) : (
        <>
          <p className="prose-plain">{t('info.noContent')}</p>
          {part && !part.nameIdTranslated && lang === 'id' && <p className="hint">{t('info.noTranslation')}</p>}
        </>
      )}

      {part?.conceptId && <p className="dataset-id">{t('info.datasetId', { id: part.conceptId })}</p>}
    </article>
  );
}

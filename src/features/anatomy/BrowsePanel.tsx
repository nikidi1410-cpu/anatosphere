import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { SYSTEM_IDS } from '../../data/systems/systems';
import { useLayerLabel } from './useNames';

/** The non-3D way to reach everything: documented structures, then every model part. */
export function BrowsePanel() {
  const { t, i18n } = useTranslation();
  const asset = useAppStore((s) => s.asset);
  const catalog = useAppStore((s) => s.catalog);
  const selection = useAppStore((s) => s.selection);
  const selectRecord = useAppStore((s) => s.selectRecord);
  const selectStructure = useAppStore((s) => s.selectStructure);
  const layerLabel = useLayerLabel();
  const [openLayers, setOpenLayers] = useState<Record<string, boolean>>({});
  if (!catalog || asset.status !== 'ready') return null;
  const lang = i18n.language === 'id' ? 'id' : 'en';

  const groups = SYSTEM_IDS.map((sys) => ({
    sys,
    records: catalog.records
      .filter((r) => r.systemId === sys)
      .sort((a, b) => a.name[lang].localeCompare(b.name[lang])),
  })).filter((g) => g.records.length > 0);

  return (
    <section className="block browse">
      {groups.length > 0 && (
        <>
          <h2>{t('browse.documented', { count: catalog.records.length })}</h2>
          {groups.map(({ sys, records }) => (
            <div key={sys} className="browse-group">
              <h3>{t(`systems.${sys}`)}</h3>
              <ul>
                {records.map((r) => (
                  <li key={r.id}>
                    <button type="button" className={selection.recordId === r.id ? 'row on' : 'row'} aria-pressed={selection.recordId === r.id} onClick={() => selectRecord(r.id)}>
                      {r.name[lang]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      <h2 className="browse-all">{t('browse.allParts', { count: catalog.structures.length })}</h2>
      {asset.manifest.layers.map((l) => {
        const items = catalog.structures.filter((s) => s.layerId === l.id);
        return (
          <details key={l.id} open={!!openLayers[l.id]} onToggle={(e) => {
            const open = (e.target as HTMLDetailsElement).open;
            setOpenLayers((o) => (o[l.id] === open ? o : { ...o, [l.id]: open }));
          }}>
            <summary>{layerLabel(l)} ({items.length})</summary>
            {/* Long lists render only when opened. */}
            {openLayers[l.id] && (
              <ul>
                {items
                  .map((s) => ({ s, name: lang === 'id' ? s.nameId : s.label }))
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ s, name }) => (
                    <li key={s.id}>
                      <button type="button" className={selection.primaryId === s.id ? 'row on' : 'row'} aria-pressed={selection.primaryId === s.id} onClick={() => selectStructure(s.id, { reveal: true })}>
                        {name}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </details>
        );
      })}
    </section>
  );
}

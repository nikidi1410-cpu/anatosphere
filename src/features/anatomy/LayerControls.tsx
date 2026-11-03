import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { layerUrl } from '../../lib/manifest';
import { useLayerLabel } from './useNames';
import { SYSTEM_IDS } from '../../data/systems/systems';

export function LayerControls() {
  const { t } = useTranslation();
  const asset = useAppStore((s) => s.asset);
  const layerVisible = useAppStore((s) => s.layerVisible);
  const files = useAppStore((s) => s.files);
  const setLayer = useAppStore((s) => s.setLayer);
  const isolateLayer = useAppStore((s) => s.isolateLayer);
  const showAllLayers = useAppStore((s) => s.showAllLayers);
  const retryFile = useAppStore((s) => s.retryFile);
  const layerLabel = useLayerLabel();
  if (asset.status !== 'ready') return null;
  const { manifest } = asset;
  const allOn = manifest.layers.every((l) => layerVisible[l.id]);

  return (
    <section className="block">
      <h2>{t('layers.title')}</h2>
      <ul className="layer-list">
        {manifest.layers.map((l) => {
          const url = layerUrl(manifest, l.id);
          const file = url ? files[url] : undefined;
          const on = layerVisible[l.id] ?? false;
          return (
            <li key={l.id} className={on ? 'layer on' : 'layer'}>
              <label>
                <input type="checkbox" checked={on} onChange={(e) => setLayer(l.id, e.target.checked)} />
                <span>{layerLabel(l)}</span>
              </label>
              {file?.state === 'loading' && on && <span className="layer-state">{t('layers.loading')}</span>}
              {file?.state === 'error' ? (
                <button type="button" className="text-button danger" onClick={() => retryFile(url!)}>
                  {t('layers.retry')}
                </button>
              ) : (
                <button type="button" className="text-button" onClick={() => isolateLayer(l.id)} aria-label={t('layers.isolateNamed', { layer: layerLabel(l) })}>
                  {t('layers.isolate')}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <button type="button" className="quiet-button" disabled={allOn} onClick={showAllLayers}>
        {t('layers.showAll')}
      </button>
      {manifest.layers.some((l) => {
        const url = layerUrl(manifest, l.id);
        return url && files[url]?.state === 'error';
      }) && <p className="hint danger" role="alert">{t('layers.failed')}</p>}
    </section>
  );
}

export function SystemFilter() {
  const { t } = useTranslation();
  const catalog = useAppStore((s) => s.catalog);
  const activeSystem = useAppStore((s) => s.activeSystem);
  const setSystem = useAppStore((s) => s.setSystem);
  if (!catalog) return null;
  const available = SYSTEM_IDS.filter((id) => catalog.structures.some((s) => s.systemId === id));
  if (available.length === 0) return null;

  return (
    <section className="block">
      <h2 id="system-heading">{t('systems.title')}</h2>
      <div className="system-list" role="radiogroup" aria-labelledby="system-heading">
        <button type="button" role="radio" aria-checked={!activeSystem} className={!activeSystem ? 'system on' : 'system'} onClick={() => setSystem(null)}>
          {t('systems.all')}
        </button>
        {available.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={activeSystem === id} className={activeSystem === id ? 'system on' : 'system'} onClick={() => setSystem(id)}>
            {t(`systems.${id}`)}
          </button>
        ))}
      </div>
    </section>
  );
}

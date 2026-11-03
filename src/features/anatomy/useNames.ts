import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';

/** Name of one model part in the current language. */
export function useStructureName(id: string | null): string {
  const { i18n } = useTranslation();
  const structure = useAppStore((s) => (id ? s.catalog?.byId.get(id) : undefined));
  if (!structure) return '';
  return i18n.language === 'id' ? structure.nameId : structure.label;
}

export function useLayerLabel() {
  const { t } = useTranslation();
  return (layer: { id: string; label?: string }) => layer.label ?? t(`layers.${layer.id}`);
}

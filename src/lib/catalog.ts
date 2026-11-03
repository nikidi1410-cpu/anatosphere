import type { AssetManifest, ManifestStructure } from './manifest';
import { translateName } from './translateName';
import { RECORDS, type AnatomyRecord } from '../data/anatomy/records';

export interface CatalogStructure extends ManifestStructure {
  /** Indonesian name; falls back to the English dataset name when a term is unknown. */
  nameId: string;
  nameIdTranslated: boolean;
  recordId: string | null;
}

export interface ResolvedRecord extends AnatomyRecord {
  structureIds: string[];
}

export interface Catalog {
  structures: CatalogStructure[];
  byId: Map<string, CatalogStructure>;
  /** Only records with at least one mesh in this model. */
  records: ResolvedRecord[];
  recordById: Map<string, ResolvedRecord>;
}

const key = (s: string) => s.trim().toLowerCase();

/** Joins the model (what exists in 3D) with the documented content. */
export function buildCatalog(manifest: AssetManifest, records: AnatomyRecord[] = RECORDS): Catalog {
  const byLabel = new Map<string, ManifestStructure[]>();
  for (const s of manifest.structures) {
    const k = key(s.label);
    byLabel.set(k, [...(byLabel.get(k) ?? []), s]);
  }

  const recordOf = new Map<string, string>();
  const resolved: ResolvedRecord[] = [];
  for (const r of records) {
    const structureIds = r.meshNames.flatMap((n) => byLabel.get(key(n)) ?? []).map((s) => s.id);
    if (structureIds.length === 0) continue;
    for (const id of structureIds) recordOf.set(id, r.id);
    resolved.push({ ...r, structureIds });
  }

  const structures: CatalogStructure[] = manifest.structures.map((s) => {
    const t = translateName(s.label);
    return { ...s, nameId: t.text, nameIdTranslated: t.complete, recordId: recordOf.get(s.id) ?? null };
  });

  return {
    structures,
    byId: new Map(structures.map((s) => [s.id, s])),
    records: resolved,
    recordById: new Map(resolved.map((r) => [r.id, r])),
  };
}

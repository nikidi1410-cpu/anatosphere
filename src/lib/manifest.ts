/**
 * An asset manifest describes which GLB files make up a model, which nodes are
 * layers and which are selectable structures. Manifests are GENERATED from the
 * real file contents (scripts/build-body.mjs, scripts/make-fixture.mjs).
 *
 * Matching to the loaded scene uses glTF `extras` (`object.userData` in three.js)
 * because three.js rewrites node names on load. `nodeName` is the raw glTF name,
 * kept for diagnostics.
 */
export interface ManifestLayer {
  id: string;
  nodeName: string;
  /** Display label for assets without translated layer names (test fixture). */
  label?: string;
  /** GLB holding this layer. Falls back to the manifest-level glbUrl. */
  glbUrl?: string;
  defaultVisible?: boolean;
  bytes?: number;
  triangles?: number;
}

export interface ManifestStructure {
  id: string;
  layerId: string;
  systemId?: string;
  nodeName: string;
  /** English name exactly as published by the dataset. */
  label: string;
  conceptId?: string;
  elementFileIds?: string[];
}

export interface AssetManifest {
  assetId: string;
  kind: 'test-fixture' | 'anatomical';
  label?: string;
  glbUrl?: string;
  notice?: string;
  attribution?: string;
  /** What was changed from the source (required by CC licenses when adapting). */
  modifications?: string;
  sourceLicense?: { name: string; url: string };
  /** License of this derived asset. */
  license?: { name: string; url: string };
  sourceUrl?: string;
  layers: ManifestLayer[];
  structures: ManifestStructure[];
}

export function layerUrl(manifest: AssetManifest, layerId: string): string | null {
  const layer = manifest.layers.find((l) => l.id === layerId);
  return layer?.glbUrl ?? manifest.glbUrl ?? null;
}

export async function fetchManifest(url: string): Promise<AssetManifest> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request for ${url} failed with status ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  // Vite's dev server answers unknown paths with index.html; catch that explicitly.
  if (!type.includes('json')) throw new Error(`${url} did not return JSON (content type "${type}")`);
  return (await res.json()) as AssetManifest;
}

export interface AssetEntry {
  id: string;
  manifestUrl: string;
}

/** The app shows `body`; the others are reached with ?asset=<id> for testing. */
export const ASSETS: AssetEntry[] = [
  { id: 'body', manifestUrl: '/models/body/body.manifest.json' },
  { id: 'fixture', manifestUrl: '/models/fixture/fixture.manifest.json' },
  { id: 'missing', manifestUrl: '/models/does-not-exist/missing.manifest.json' },
];

export function assetFromLocation(search: string): AssetEntry {
  const id = new URLSearchParams(search).get('asset');
  return ASSETS.find((a) => a.id === id) ?? ASSETS[0];
}

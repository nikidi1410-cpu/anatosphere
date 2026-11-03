import { create } from 'zustand';
import { fetchManifest, layerUrl, type AssetEntry, type AssetManifest } from '../lib/manifest';
import { buildCatalog, type Catalog } from '../lib/catalog';
import type { Tour } from '../data/tours/tours';

export type View = 'home' | 'explore';
export type CameraCommand = { kind: 'reset' | 'focus' | 'system'; nonce: number };
export type SheetState = 'peek' | 'half' | 'full';
export type SheetTab = 'info' | 'layers' | 'browse';
export type LoadState = 'loading' | 'ready' | 'error';

export interface Selection {
  /** Everything highlighted: one part, or all parts of a documented structure. */
  ids: string[];
  /** The part the atlas label points at. */
  primaryId: string | null;
  recordId: string | null;
}

const EMPTY_SELECTION: Selection = { ids: [], primaryId: null, recordId: null };

interface AppState {
  view: View;
  asset: { status: 'loading' } | { status: 'error'; error: string } | { status: 'ready'; manifest: AssetManifest };
  catalog: Catalog | null;
  layerVisible: Record<string, boolean>;
  /** Per GLB url. A url appears here once its layer has been shown at least once. */
  files: Record<string, { state: LoadState; attempt: number }>;
  sceneVersion: number;
  activeSystem: string | null;
  selection: Selection;
  camera: CameraCommand | null;
  tour: { tour: Tour; step: number; done: boolean } | null;
  leftOpen: boolean;
  rightOpen: boolean;
  sheet: SheetState;
  sheetTab: SheetTab;

  loadAsset: (entry: AssetEntry) => Promise<void>;
  setView: (view: View) => void;
  setLayer: (id: string, visible: boolean) => void;
  isolateLayer: (id: string) => void;
  showAllLayers: () => void;
  setFileState: (url: string, state: LoadState) => void;
  retryFile: (url: string) => void;
  bumpScene: () => void;
  setSystem: (id: string | null) => void;
  selectStructure: (id: string, opts?: { reveal?: boolean }) => void;
  selectRecord: (id: string, opts?: { reveal?: boolean }) => void;
  clearSelection: () => void;
  sendCamera: (kind: CameraCommand['kind']) => void;
  startTour: (tour: Tour) => void;
  goToTourStep: (step: number) => void;
  exitTour: () => void;
  togglePanel: (side: 'left' | 'right') => void;
  setSheet: (state: SheetState) => void;
  openSheetTab: (tab: SheetTab) => void;
}

/** Marks a layer's file as requested, which is what triggers its lazy load. */
function requestFiles(files: AppState['files'], manifest: AssetManifest, visible: Record<string, boolean>) {
  const next = { ...files };
  for (const layer of manifest.layers) {
    if (!visible[layer.id]) continue;
    const url = layerUrl(manifest, layer.id);
    if (url && !next[url]) next[url] = { state: 'loading', attempt: 0 };
  }
  return next;
}

export const useAppStore = create<AppState>((set, get) => {
  /**
   * Turns on the layer holding a structure and hides layers that would cover it.
   * Layers are ordered outside-in in the anatomical manifest.
   */
  const revealed = (manifest: AssetManifest, layerIds: string[], current: Record<string, boolean>) => {
    const next = { ...current };
    for (const id of layerIds) next[id] = true;
    if (manifest.kind === 'anatomical') {
      const order = manifest.layers.map((l) => l.id);
      const outermost = Math.min(...layerIds.map((id) => order.indexOf(id)));
      for (let i = 0; i < outermost; i++) next[order[i]] = false;
    }
    return next;
  };

  const applySelection = (selection: Selection, reveal: boolean) => {
    const { asset, catalog, layerVisible, files, activeSystem, camera, sheet } = get();
    if (asset.status !== 'ready' || !catalog) return;
    const structures = selection.ids.map((id) => catalog.byId.get(id)).filter((s) => s !== undefined);
    const nextVisible = reveal ? revealed(asset.manifest, [...new Set(structures.map((s) => s.layerId))], layerVisible) : layerVisible;
    const keepSystem = !reveal || !activeSystem || structures.every((s) => s.systemId === activeSystem);
    set({
      selection,
      view: 'explore',
      layerVisible: nextVisible,
      files: requestFiles(files, asset.manifest, nextVisible),
      activeSystem: keepSystem ? activeSystem : null,
      camera: reveal ? { kind: 'focus', nonce: (camera?.nonce ?? 0) + 1 } : camera,
      sheet: reveal && sheet === 'full' ? 'peek' : sheet,
    });
  };

  return {
    view: 'home',
    asset: { status: 'loading' },
    catalog: null,
    layerVisible: {},
    files: {},
    sceneVersion: 0,
    activeSystem: null,
    selection: EMPTY_SELECTION,
    camera: null,
    tour: null,
    leftOpen: true,
    rightOpen: true,
    sheet: 'peek',
    sheetTab: 'info',

    loadAsset: async (entry) => {
      set({ asset: { status: 'loading' }, catalog: null, selection: EMPTY_SELECTION, files: {}, activeSystem: null });
      try {
        const manifest = await fetchManifest(entry.manifestUrl);
        const layerVisible = Object.fromEntries(manifest.layers.map((l) => [l.id, l.defaultVisible ?? true]));
        set({
          asset: { status: 'ready', manifest },
          catalog: buildCatalog(manifest),
          layerVisible,
          files: requestFiles({}, manifest, layerVisible),
          view: manifest.kind === 'anatomical' ? get().view : 'explore',
        });
      } catch (e) {
        set({ asset: { status: 'error', error: e instanceof Error ? e.message : String(e) }, view: 'explore' });
      }
    },

    setView: (view) => set({ view }),

    setLayer: (id, visible) => {
      const { asset, layerVisible, files } = get();
      if (asset.status !== 'ready') return;
      const next = { ...layerVisible, [id]: visible };
      set({ layerVisible: next, files: requestFiles(files, asset.manifest, next) });
    },

    isolateLayer: (id) => {
      const { asset, files } = get();
      if (asset.status !== 'ready') return;
      const next = Object.fromEntries(asset.manifest.layers.map((l) => [l.id, l.id === id]));
      set({ layerVisible: next, files: requestFiles(files, asset.manifest, next), activeSystem: null });
    },

    showAllLayers: () => {
      const { asset, files } = get();
      if (asset.status !== 'ready') return;
      const next = Object.fromEntries(asset.manifest.layers.map((l) => [l.id, true]));
      set({ layerVisible: next, files: requestFiles(files, asset.manifest, next), activeSystem: null });
    },

    setFileState: (url, state) =>
      set((s) => (s.files[url] ? { files: { ...s.files, [url]: { ...s.files[url], state } } } : s)),

    retryFile: (url) =>
      set((s) => ({ files: { ...s.files, [url]: { state: 'loading', attempt: (s.files[url]?.attempt ?? 0) + 1 } } })),

    bumpScene: () => set((s) => ({ sceneVersion: s.sceneVersion + 1 })),

    setSystem: (id) => {
      const { asset, catalog, layerVisible, files, selection, camera } = get();
      if (asset.status !== 'ready' || !catalog) return;
      const nonce = (camera?.nonce ?? 0) + 1;
      if (!id) {
        set({ activeSystem: null, camera: { kind: 'reset', nonce } });
        return;
      }
      // Turn on every layer that holds parts of this system, and hide the others.
      const layers = new Set(catalog.structures.filter((s) => s.systemId === id).map((s) => s.layerId));
      const next = { ...layerVisible };
      for (const l of asset.manifest.layers) next[l.id] = layers.has(l.id);
      const selectionFits = selection.ids.every((sid) => catalog.byId.get(sid)?.systemId === id);
      set({
        activeSystem: id,
        layerVisible: next,
        files: requestFiles(files, asset.manifest, next),
        selection: selectionFits ? selection : EMPTY_SELECTION,
        camera: { kind: 'system', nonce },
      });
    },

    selectStructure: (id, opts) => {
      const { catalog } = get();
      const structure = catalog?.byId.get(id);
      if (!structure) return;
      applySelection({ ids: [id], primaryId: id, recordId: structure.recordId }, !!opts?.reveal);
    },

    selectRecord: (id, opts) => {
      const record = get().catalog?.recordById.get(id);
      if (!record) return;
      applySelection({ ids: record.structureIds, primaryId: record.structureIds[0], recordId: id }, opts?.reveal ?? true);
    },

    clearSelection: () => set({ selection: EMPTY_SELECTION }),

    sendCamera: (kind) => set((s) => ({ camera: { kind, nonce: (s.camera?.nonce ?? 0) + 1 } })),

    startTour: (tour) => {
      set({ tour: { tour, step: 0, done: false }, view: 'explore', activeSystem: null });
      get().selectRecord(tour.steps[0].recordId);
    },

    goToTourStep: (step) => {
      const { tour } = get();
      if (!tour) return;
      if (step >= tour.tour.steps.length) {
        set({ tour: { ...tour, done: true } });
        return;
      }
      if (step < 0) return;
      set({ tour: { ...tour, step, done: false } });
      get().selectRecord(tour.tour.steps[step].recordId);
    },

    exitTour: () => set({ tour: null }),

    togglePanel: (side) => set((s) => (side === 'left' ? { leftOpen: !s.leftOpen } : { rightOpen: !s.rightOpen })),

    setSheet: (sheet) => set({ sheet }),

    openSheetTab: (sheetTab) => set((s) => ({ sheetTab, sheet: s.sheet === 'peek' ? 'half' : s.sheet })),
  };
});

import * as THREE from 'three';
import type { AssetManifest } from '../../lib/manifest';

export interface SceneReport {
  meshes: number;
  triangles: number;
  materials: number;
  sharedMaterials: number;
  /** Manifest entries of loaded layers whose node was not found in the scene. */
  missingStructures: string[];
  missingLayers: string[];
  /** Raw glTF name -> name after three.js loading, where they differ. */
  renamedNodes: { raw: string; loaded: string }[];
}

/**
 * Lookups from manifest ids to the loaded three.js objects, across all GLB files
 * loaded so far. Scene objects live here, outside React state: components only
 * hold ids, and re-render on the store's `sceneVersion`.
 */
class SceneRegistry {
  structures = new Map<string, THREE.Object3D>();
  layers = new Map<string, THREE.Object3D>();
  roots = new Map<string, THREE.Object3D>();

  add(url: string, root: THREE.Object3D) {
    this.roots.set(url, root);
    root.traverse((obj) => {
      const sid = obj.userData?.structureId;
      const lid = obj.userData?.layerId;
      if (typeof sid === 'string') this.structures.set(sid, obj);
      if (typeof lid === 'string') this.layers.set(lid, obj);
    });
  }

  /** Frees GPU memory for a file that is no longer shown. */
  release(url: string) {
    const root = this.roots.get(url);
    root?.traverse((o) => {
      const sid = o.userData?.structureId;
      const lid = o.userData?.layerId;
      if (typeof sid === 'string') this.structures.delete(sid);
      if (typeof lid === 'string') this.layers.delete(lid);
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry.dispose();
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) mat.dispose();
    });
    this.roots.delete(url);
  }

  report(manifest: AssetManifest): SceneReport {
    const materialUse = new Map<THREE.Material, number>();
    let meshes = 0;
    let triangles = 0;
    for (const root of this.roots.values()) {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        meshes++;
        const g = mesh.geometry;
        triangles += (g.index ? g.index.count : g.attributes.position.count) / 3;
        for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          materialUse.set(m, (materialUse.get(m) ?? 0) + 1);
        }
      });
    }
    const loadedLayers = new Set(this.layers.keys());
    const renamedNodes: SceneReport['renamedNodes'] = [];
    for (const s of manifest.structures) {
      const obj = this.structures.get(s.id);
      if (obj && obj.name !== s.nodeName) renamedNodes.push({ raw: s.nodeName, loaded: obj.name });
    }
    return {
      meshes,
      triangles,
      materials: materialUse.size,
      sharedMaterials: [...materialUse.values()].filter((n) => n > 1).length,
      missingStructures: manifest.structures.filter((s) => loadedLayers.has(s.layerId) && !this.structures.has(s.id)).map((s) => s.id),
      missingLayers: manifest.layers
        .filter((l) => {
          const url = l.glbUrl ?? manifest.glbUrl;
          return !!url && this.roots.has(url) && !this.layers.has(l.id);
        })
        .map((l) => l.id),
      renamedNodes,
    };
  }

  /** Union bounding box of the given structures, or null if none are loaded. */
  boxOf(ids: string[]): THREE.Box3 | null {
    const box = new THREE.Box3();
    let found = false;
    for (const id of ids) {
      const obj = this.structures.get(id);
      if (obj) {
        box.expandByObject(obj);
        found = true;
      }
    }
    return found ? box : null;
  }
}

export const sceneRegistry = new SceneRegistry();

/** True when the object and every ancestor is visible. */
export function isEffectivelyVisible(obj: THREE.Object3D): boolean {
  for (let o: THREE.Object3D | null = obj; o; o = o.parent) if (!o.visible) return false;
  return true;
}

/** Walks up from a hit mesh to the nearest node that is a manifest structure. */
export function findStructureId(obj: THREE.Object3D): string | null {
  for (let o: THREE.Object3D | null = obj; o; o = o.parent) {
    const sid = o.userData?.structureId;
    if (typeof sid === 'string') return sid;
  }
  return null;
}

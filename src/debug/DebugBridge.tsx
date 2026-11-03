import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../stores/useAppStore';
import { isEffectivelyVisible, sceneRegistry } from '../features/viewer/sceneRegistry';

/**
 * DEV-ONLY test hook (window.__anato) so automated browser tests can verify real
 * scene state (visibility, materials, camera) instead of trusting the UI. It is
 * mounted behind import.meta.env.DEV, so it is not in production builds.
 */
export function DebugBridge() {
  const { camera, size, gl, controls } = useThree();
  const sceneVersion = useAppStore((s) => s.sceneVersion);
  const selection = useAppStore((s) => s.selection);
  const asset = useAppStore((s) => s.asset);

  useEffect(() => {
    const w = window as unknown as { __anato?: unknown };
    w.__anato = {
      ready: sceneRegistry.roots.size > 0,
      selectedId: selection.primaryId,
      selectedIds: selection.ids,
      recordId: selection.recordId,
      report: asset.status === 'ready' ? sceneRegistry.report(asset.manifest) : null,
      structureIds: [...sceneRegistry.structures.keys()],
      loadedLayers: [...sceneRegistry.layers.keys()],
      project(id: string) {
        const obj = sceneRegistry.structures.get(id);
        if (!obj) return null;
        const c = new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3()).project(camera);
        const rect = gl.domElement.getBoundingClientRect();
        return { x: rect.left + ((c.x + 1) / 2) * size.width, y: rect.top + ((1 - c.y) / 2) * size.height };
      },
      visible(id: string) {
        const obj = sceneRegistry.structures.get(id) ?? sceneRegistry.layers.get(id);
        return obj ? isEffectivelyVisible(obj) : null;
      },
      materials(id: string) {
        const out: { uuid: string; emissive: string | null; color: string | null }[] = [];
        sceneRegistry.structures.get(id)?.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
            const s = mat as THREE.MeshStandardMaterial;
            out.push({ uuid: s.uuid, emissive: s.emissive?.getHexString() ?? null, color: s.color?.getHexString() ?? null });
          }
        });
        return out;
      },
      setSheet: useAppStore.getState().setSheet,
      camera() {
        const target = (controls as unknown as { target?: THREE.Vector3 } | null)?.target;
        return { position: camera.position.toArray(), quaternion: camera.quaternion.toArray(), target: target?.toArray() ?? null };
      },
    };
  }, [sceneVersion, selection, asset, camera, size, gl, controls]);
  return null;
}

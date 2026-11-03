import * as THREE from 'three';

const HIGHLIGHT = new THREE.Color('#2563EB');

type Saved = THREE.Material | THREE.Material[];

/**
 * Highlights structures without touching materials that other meshes share:
 * each mesh under a target gets its own cloned material, and the original is
 * restored (and the clone disposed) on clear().
 */
export class Highlighter {
  private saved = new Map<THREE.Mesh, Saved>();

  apply(targets: THREE.Object3D[]) {
    this.clear();
    for (const target of targets) {
      target.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh || this.saved.has(mesh)) return;
        this.saved.set(mesh, mesh.material);
        const tint = (m: THREE.Material) => {
          const c = m.clone();
          const std = c as THREE.MeshStandardMaterial;
          if ('emissive' in std && std.emissive) {
            std.emissive = HIGHLIGHT.clone();
            std.emissiveIntensity = 0.4;
            // Emissive blue alone turns red organs purple, so pull the base colour toward blue too.
            std.color?.lerp(HIGHLIGHT, 0.55);
          } else if ('color' in std && std.color) {
            std.color = HIGHLIGHT.clone();
          }
          return c;
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(tint) : tint(mesh.material);
      });
    }
  }

  clear() {
    for (const [mesh, original] of this.saved) {
      const current = mesh.material;
      for (const m of Array.isArray(current) ? current : [current]) m.dispose();
      mesh.material = original;
    }
    this.saved.clear();
  }
}

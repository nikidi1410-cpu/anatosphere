// Prints the REAL node hierarchy of a GLB file, read directly from the file.
// Used so that no mesh/node names are ever assumed.
//
// Usage: node scripts/inspect-glb.mjs <file.glb> [--json out.json] [--depth N]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Usage: node scripts/inspect-glb.mjs <file.glb> [--json out.json] [--depth N]');
  process.exit(1);
}
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const maxDepth = args.includes('--depth') ? Number(args[args.indexOf('--depth') + 1]) : Infinity;

await MeshoptDecoder.ready;
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder }).read(file);
const root = doc.getRoot();

function triCount(mesh) {
  let t = 0;
  for (const p of mesh.listPrimitives()) {
    const idx = p.getIndices();
    const n = idx ? idx.getCount() : p.getAttribute('POSITION')?.getCount() ?? 0;
    t += n / 3;
  }
  return t;
}

function walk(node, depth) {
  const mesh = node.getMesh();
  return {
    name: node.getName(),
    extras: node.getExtras(),
    mesh: mesh
      ? {
          name: mesh.getName(),
          primitives: mesh.listPrimitives().length,
          triangles: triCount(mesh),
          materials: mesh.listPrimitives().map((p) => p.getMaterial()?.getName() ?? null),
        }
      : null,
    children: depth < maxDepth ? node.listChildren().map((c) => walk(c, depth + 1)) : [],
    childCount: node.listChildren().length,
  };
}

const report = {
  file,
  scenes: root.listScenes().map((s) => ({ name: s.getName(), nodes: s.listChildren().map((n) => walk(n, 1)) })),
  totals: {
    nodes: root.listNodes().length,
    meshes: root.listMeshes().length,
    primitives: root.listMeshes().reduce((a, m) => a + m.listPrimitives().length, 0),
    triangles: root.listMeshes().reduce((a, m) => a + triCount(m), 0),
    materials: root.listMaterials().length,
    textures: root.listTextures().length,
  },
};

// Name problems that matter for selection mapping.
const names = root.listNodes().map((n) => n.getName());
const dupes = [...new Set(names.filter((n, i) => names.indexOf(n) !== i))];
const unsafe = names.filter((n) => /[\s.:/[\]]/.test(n));
const empty = names.filter((n) => !n).length;
report.nameIssues = { duplicates: dupes, containsCharsThreeSanitizes: unsafe, emptyNames: empty };

function print(n, indent) {
  const m = n.mesh ? `  [mesh ${n.mesh.primitives}p ${n.mesh.triangles}t mat=${n.mesh.materials.join('|')}]` : '';
  const ex = Object.keys(n.extras ?? {}).length ? `  extras=${JSON.stringify(n.extras)}` : '';
  console.log(`${indent}${n.name || '(unnamed)'}${m}${ex}`);
  n.children.forEach((c) => print(c, indent + '  '));
  if (n.children.length === 0 && n.childCount > 0) console.log(`${indent}  … ${n.childCount} children (depth limit)`);
}
for (const s of report.scenes) {
  console.log(`Scene: ${s.name || '(unnamed)'}`);
  s.nodes.forEach((n) => print(n, '  '));
}
console.log('\nTotals:', report.totals);
console.log('Name issues:', {
  duplicates: dupes.length,
  sanitizable: unsafe.length,
  empty,
  examples: { duplicates: dupes.slice(0, 5), sanitizable: unsafe.slice(0, 5) },
});
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify(report, null, 2));
  console.log(`JSON report written to ${jsonOut}`);
}

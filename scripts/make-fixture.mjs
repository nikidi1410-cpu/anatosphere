// Generates a NON-ANATOMICAL test fixture GLB used to exercise the viewer pipeline.
// It deliberately contains the edge cases listed in docs/phase0-report.md:
//   - nested layer groups
//   - a material shared by several nodes (highlight must not bleed)
//   - a mesh with two primitives / two materials (loads as a Group in three.js)
//   - two nodes with the same name (three.js renames duplicates)
//   - node names containing "." and spaces (three.js sanitizes these)
//   - an outer "shell" layer that encloses inner objects (click occlusion test)
//
// Usage: node scripts/make-fixture.mjs [outDir]
import { Document, NodeIO } from '@gltf-transform/core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const outDir = resolve(process.argv[2] ?? 'public/models/fixture');
mkdirSync(outDir, { recursive: true });

const doc = new Document();
const buffer = doc.createBuffer();
const scene = doc.createScene('FixtureScene');

/** Axis-aligned box primitive with flat normals. */
function boxPrimitive(sx, sy, sz, material) {
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  const faces = [
    [[1, 0, 0], [[hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz], [hx, -hy, hz]]],
    [[-1, 0, 0], [[-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz], [-hx, -hy, -hz]]],
    [[0, 1, 0], [[-hx, hy, -hz], [-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz]]],
    [[0, -1, 0], [[-hx, -hy, hz], [-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz]]],
    [[0, 0, 1], [[hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz], [-hx, -hy, hz]]],
    [[0, 0, -1], [[-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz], [hx, -hy, -hz]]],
  ];
  const pos = [], nor = [], idx = [];
  faces.forEach(([n, quad], f) => {
    quad.forEach((p) => { pos.push(...p); nor.push(...n); });
    const b = f * 4;
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });
  return primitive(pos, nor, idx, material);
}

/** UV sphere primitive (inward-facing when `inside` is true is NOT used; spheres face outward). */
function spherePrimitive(r, material, seg = 24, rings = 16) {
  const pos = [], nor = [], idx = [];
  for (let i = 0; i <= rings; i++) {
    const v = i / rings, th = v * Math.PI;
    for (let j = 0; j <= seg; j++) {
      const u = j / seg, ph = u * Math.PI * 2;
      const n = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
      nor.push(...n); pos.push(n[0] * r, n[1] * r, n[2] * r);
    }
  }
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const a = i * (seg + 1) + j, b = a + seg + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  return primitive(pos, nor, idx, material);
}

function primitive(pos, nor, idx, material) {
  const p = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nor)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer));
  if (material) p.setMaterial(material);
  return p;
}

const mat = (name, rgba) => doc.createMaterial(name).setBaseColorFactor(rgba).setRoughnessFactor(0.6).setMetallicFactor(0);
const sharedGrey = mat('Fixture_SharedGrey', [0.75, 0.75, 0.78, 1]);
const blue = mat('Fixture_Blue', [0.3, 0.5, 0.9, 1]);
const orange = mat('Fixture_Orange', [0.95, 0.6, 0.25, 1]);
const shell = mat('Fixture_Shell', [0.9, 0.85, 0.8, 1]);

const manifest = {
  assetId: 'fixture',
  label: 'Test fixture (non-anatomical)',
  kind: 'test-fixture',
  glbUrl: '/models/fixture/fixture.glb',
  notice: 'Generated geometric test fixture. Contains NO anatomical data.',
  layers: [],
  structures: [],
};

function layer(id, label, rawName) {
  const node = doc.createNode(rawName).setExtras({ layerId: id });
  scene.addChild(node);
  manifest.layers.push({ id, label, nodeName: rawName });
  return node;
}

function structure(parent, layerId, id, rawName, mesh, translation) {
  const node = doc.createNode(rawName).setMesh(mesh).setTranslation(translation).setExtras({ structureId: id });
  parent.addChild(node);
  manifest.structures.push({ id, layerId, nodeName: rawName, label: rawName });
  return node;
}

const meshOf = (name, ...prims) => { const m = doc.createMesh(name); prims.forEach((p) => m.addPrimitive(p)); return m; };

// Layer A: three boxes that SHARE one material.
const layerA = layer('layer-a', 'Layer A (shared material)', 'Fixture_LayerA');
structure(layerA, 'layer-a', 'box-1', 'Fixture_Box1', meshOf('Box1', boxPrimitive(0.2, 0.2, 0.2, sharedGrey)), [-0.3, 0.1, 0]);
structure(layerA, 'layer-a', 'box-2', 'Fixture_Box2', meshOf('Box2', boxPrimitive(0.2, 0.3, 0.2, sharedGrey)), [0, 0.15, 0]);
structure(layerA, 'layer-a', 'box-3', 'Fixture_Box3', meshOf('Box3', boxPrimitive(0.2, 0.15, 0.2, sharedGrey)), [0.3, 0.075, 0]);

// Layer B: edge-case names and a two-primitive mesh, nested one level deeper.
const layerB = layer('layer-b', 'Layer B (edge cases)', 'Fixture_LayerB');
const nested = doc.createNode('Fixture_LayerB_SubGroup');
nested.setTranslation([0, 0.5, 0]);
layerB.addChild(nested);
structure(nested, 'layer-b', 'dotted', 'Fixture.Dotted Name', meshOf('Dotted', spherePrimitive(0.08, blue)), [-0.3, 0, 0]);
structure(nested, 'layer-b', 'dup-1', 'Fixture_Duplicate', meshOf('Dup1', spherePrimitive(0.08, blue)), [0, 0, 0]);
structure(nested, 'layer-b', 'dup-2', 'Fixture_Duplicate', meshOf('Dup2', spherePrimitive(0.08, blue)), [0.3, 0, 0]);
structure(nested, 'layer-b', 'two-mat', 'Fixture_TwoMaterialMesh',
  meshOf('TwoMat', boxPrimitive(0.12, 0.12, 0.12, orange), spherePrimitive(0.07, blue).setMaterial(sharedGrey)), [0, 0.25, 0]);

// Layer C: an outer shell enclosing everything -> tests click-through when hidden.
const layerC = layer('layer-c', 'Layer C (outer shell)', 'Fixture_LayerC_Shell');
const shellMesh = meshOf('Shell', boxPrimitive(1.0, 1.2, 0.5, shell));
structure(layerC, 'layer-c', 'shell', 'Fixture_Shell', shellMesh, [0, 0.4, 0]);
// Draw back faces too, so the inner objects are hidden behind it from any angle.
shell.setDoubleSided(true);

const io = new NodeIO();
const glb = await io.writeBinary(doc);
writeFileSync(join(outDir, 'fixture.glb'), glb);
writeFileSync(join(outDir, 'fixture.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${join(outDir, 'fixture.glb')} (${glb.byteLength} bytes), ${manifest.structures.length} structures, ${manifest.layers.length} layers`);

// Builds the AnatoSphere body model from BodyParts3D 4.0 (IS-A and PART-OF trees).
// Output: one GLB per layer (so layers can be lazy-loaded) plus one manifest,
// all sharing a single coordinate space so the layers stay aligned.
//
// Source license: CC BY 4.0, "BodyParts3D, © The Database Center for Life Science
// licensed under CC Attribution 4.0 International". See public/models/body/PROVENANCE.md.
//
// Every structure name comes from the dataset (OBJ headers / tables). Nothing is
// named by hand: the concept lists below only reference FMA IDs, and each ID is
// checked against the name expected for it, so a wrong ID fails loudly.
//
// Usage: node scripts/build-body.mjs [sourceDir] [outDir]
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, normals, prune, simplify, meshopt } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const srcDir = resolve(process.argv[2] ?? '.asset-cache/bodyparts3d-4.0');
const outDir = resolve(process.argv[3] ?? 'public/models/body');
const objDirs = { isa: join(srcDir, 'isa_BP3D_4.0_obj_99'), partof: join(srcDir, 'partof_BP3D_4.0_obj_99') };
for (const d of Object.values(objDirs)) if (!existsSync(d)) throw new Error(`Missing OBJ folder: ${d}`);

// ---------------------------------------------------------------- configuration
const ORGANS = [
  // [concept, expected dataset name, source tree, body system, base colour]
  ['FMA50801', 'brain', 'partof', 'nervous', [0.86, 0.66, 0.68, 1]],
  ['FMA7647', 'spinal cord', 'partof', 'nervous', [0.9, 0.82, 0.62, 1]],
  ['FMA7088', 'heart', 'partof', 'cardiovascular', [0.72, 0.18, 0.2, 1]],
  ['FMA7394', 'trachea', 'partof', 'respiratory', [0.8, 0.76, 0.7, 1]],
  ['FMA7309', 'right lung', 'partof', 'respiratory', [0.86, 0.5, 0.52, 1]],
  ['FMA7310', 'left lung', 'partof', 'respiratory', [0.86, 0.5, 0.52, 1]],
  ['FMA7131', 'esophagus', 'partof', 'digestive', [0.82, 0.55, 0.5, 1]],
  ['FMA7148', 'stomach', 'partof', 'digestive', [0.84, 0.56, 0.42, 1]],
  ['FMA7197', 'liver', 'partof', 'digestive', [0.5, 0.2, 0.16, 1]],
  ['FMA7196', 'spleen', 'isa', 'lymphatic', [0.45, 0.16, 0.22, 1]],
  ['FMA7202', 'gallbladder', 'partof', 'digestive', [0.45, 0.6, 0.3, 1]],
  ['FMA7198', 'pancreas', 'partof', 'digestive', [0.9, 0.74, 0.5, 1]],
  ['FMA7200', 'small intestine', 'partof', 'digestive', [0.88, 0.62, 0.55, 1]],
  ['FMA7201', 'large intestine', 'partof', 'digestive', [0.76, 0.5, 0.42, 1]],
  ['FMA7204', 'right kidney', 'partof', 'urinary', [0.6, 0.26, 0.24, 1]],
  ['FMA7205', 'left kidney', 'partof', 'urinary', [0.6, 0.26, 0.24, 1]],
  ['FMA15571', 'right ureter', 'partof', 'urinary', [0.9, 0.8, 0.5, 1]],
  ['FMA15572', 'left ureter', 'partof', 'urinary', [0.9, 0.8, 0.5, 1]],
  ['FMA15900', 'urinary bladder', 'partof', 'urinary', [0.86, 0.72, 0.42, 1]],
];

const LAYERS = [
  {
    id: 'skin', mode: 'concepts', tree: 'partof', system: 'integumentary',
    concepts: [['FMA7163', 'skin']], color: [0.87, 0.72, 0.62, 1], doubleSided: true, ratio: 0.2, error: 0.002,
    defaultVisible: false,
  },
  {
    id: 'muscles', mode: 'elements', tree: 'isa', system: 'muscular',
    // Major muscles (biceps, deltoid, ...) are published as heads and zones, not as muscle organs.
    concepts: [['FMA5022', 'muscle organ'], ['FMA85453', 'head of muscle organ'], ['FMA10474', 'zone of muscle organ'],
      ['FMA32555', 'ascending part of trapezius'], ['FMA32557', 'descending part of trapezius'],
      ['FMA42398', 'set of lumbricals of right hand'], ['FMA42399', 'set of lumbricals of left hand'],
      ['FMA42402', 'set of palmar interossei of right hand'], ['FMA42403', 'set of palmar interossei of left hand'],
      ['FMA42404', 'set of dorsal interossei of right hand'], ['FMA42405', 'set of dorsal interossei of left hand'],
      ['FMA74075', 'set of right levatores costarum longi'], ['FMA74076', 'set of left levatores costarum longi'],
      ['FMA74077', 'set of right levatores costarum breves'], ['FMA74078', 'set of left levatores costarum breves'],
    ], color: [0.67, 0.25, 0.22, 1], ratio: 0.2, error: 0.008,
    defaultVisible: false,
  },
  {
    id: 'skeleton', mode: 'elements', tree: 'isa', system: 'skeletal',
    concepts: [
      ['FMA5018', 'bone organ'], ['FMA7486', 'manubrium'], ['FMA7487', 'body of sternum'], ['FMA7488', 'xiphoid process'],
      ['FMA7591', 'costal cartilage'], ['FMA10446', 'intervertebral disk'],
    ], color: [0.93, 0.9, 0.82, 1], ratio: 0.25, error: 0.005,
    defaultVisible: true,
  },
  { id: 'organs', mode: 'organs', ratio: 0.2, error: 0.003, defaultVisible: true },
];

// ---------------------------------------------------------------- tables
function readTable(name) {
  return readFileSync(join(srcDir, name), 'utf8').split(/\r?\n/).filter(Boolean).slice(1).map((l) => l.split('\t'));
}
const tables = {};
for (const tree of ['isa', 'partof']) {
  const name = new Map();
  const elements = new Map();
  for (const [cid, n, fj] of readTable(`${tree}_element_parts.txt`)) {
    name.set(cid, n);
    (elements.get(cid) ?? elements.set(cid, []).get(cid)).push(fj);
  }
  tables[tree] = { name, elements };
}
function conceptElements(tree, cid, expected) {
  const actual = tables[tree].name.get(cid);
  if (actual !== expected) throw new Error(`${tree} ${cid} is "${actual}", expected "${expected}"`);
  return tables[tree].elements.get(cid);
}

// ---------------------------------------------------------------- OBJ reader
const objCache = new Map();
function readObj(tree, fj) {
  const key = `${tree}/${fj}`;
  if (objCache.has(key)) return objCache.get(key);
  const text = readFileSync(join(objDirs[tree], `${fj}.obj`), 'utf8');
  const positions = [];
  const indices = [];
  const header = {};
  for (const line of text.split('\n')) {
    if (line.startsWith('# ')) {
      const m = line.match(/^# (Concept ID|English name|File ID) : (.+?)\s*$/);
      if (m) header[m[1]] = m[2];
    } else if (line.startsWith('v ')) {
      const [, x, y, z] = line.trim().split(/\s+/);
      positions.push(+x, +y, +z);
    } else if (line.startsWith('f ')) {
      const refs = line.trim().split(/\s+/).slice(1).map((r) => {
        const i = parseInt(r.split('/')[0], 10);
        return i < 0 ? positions.length / 3 + i : i - 1;
      });
      for (let k = 1; k + 1 < refs.length; k++) indices.push(refs[0], refs[k], refs[k + 1]);
    }
  }
  const g = { positions, indices, header, tree, fj };
  objCache.set(key, g);
  return g;
}

const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The dataset's name for one mesh file: its own OBJ header. A few files have empty
 * headers; their mirrored twin (same id + "M") names them, or else the smallest
 * concept in the dataset's table that lists the file.
 */
function nameOf(tree, fj) {
  const h = readObj(tree, fj).header;
  if (h['File ID'] && h['File ID'] !== fj) throw new Error(`${fj}.obj header says File ID ${h['File ID']}`);
  if (h['Concept ID'] && h['English name']) return { conceptId: h['Concept ID'], name: h['English name'] };
  if (existsSync(join(objDirs[tree], `${fj}M.obj`))) {
    const m = readObj(tree, `${fj}M`).header;
    if (m['Concept ID'] && m['English name']) return { conceptId: m['Concept ID'], name: m['English name'] };
  }
  const owners = [...tables[tree].elements].filter(([, els]) => els.includes(fj)).sort((a, b) => a[1].length - b[1].length);
  return owners.length ? { conceptId: owners[0][0], name: tables[tree].name.get(owners[0][0]) } : null;
}
const sanitize = (s) => s.replace(/[^A-Za-z0-9]+/g, '_').replace(/^_|_$/g, '');

// ---------------------------------------------------------------- plan structures
const usedElements = new Map(); // "fj" -> layer id; an element belongs to exactly one layer
const conflicts = [];
const unnamed = [];

function planLayer(layer) {
  const structures = [];
  const claim = (fj) => {
    if (usedElements.has(fj)) {
      // The same element listed under two concepts of one layer is normal; across layers it is reported.
      if (usedElements.get(fj) !== layer.id) conflicts.push({ fj, kept: usedElements.get(fj), dropped: layer.id });
      return false;
    }
    usedElements.set(fj, layer.id);
    return true;
  };

  if (layer.mode === 'elements') {
    // One structure per dataset concept; elements of the same concept are merged.
    const byConcept = new Map();
    for (const [cid, expected] of layer.concepts) {
      for (const fj of conceptElements(layer.tree, cid, expected)) {
        if (!claim(fj)) continue;
        const n = nameOf(layer.tree, fj);
        if (!n) {
          unnamed.push(fj);
          continue; // never invent a name
        }
        const entry = byConcept.get(n.conceptId) ?? { conceptId: n.conceptId, label: sentence(n.name), elements: [] };
        entry.elements.push({ tree: layer.tree, fj });
        byConcept.set(n.conceptId, entry);
      }
    }
    for (const e of byConcept.values()) structures.push({ ...e, system: layer.system });
  } else if (layer.mode === 'concepts') {
    for (const [cid, expected] of layer.concepts) {
      const elements = conceptElements(layer.tree, cid, expected).filter(claim).map((fj) => ({ tree: layer.tree, fj }));
      structures.push({ conceptId: cid, label: sentence(expected), elements, system: layer.system });
    }
  } else {
    for (const [cid, expected, tree, system, color] of ORGANS) {
      const elements = conceptElements(tree, cid, expected).filter(claim).map((fj) => ({ tree, fj }));
      structures.push({ conceptId: cid, label: sentence(expected), elements, system, color });
    }
  }
  return structures.filter((s) => s.elements.length);
}

// Claim organs first: their element lists are the most specific and must stay whole.
const organLayer = LAYERS.find((l) => l.mode === 'organs');
const plans = new Map([[organLayer.id, planLayer(organLayer)]]);
for (const layer of LAYERS) if (layer !== organLayer) plans.set(layer.id, planLayer(layer));

// ---------------------------------------------------------------- shared coordinate frame
const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
for (const structures of plans.values()) {
  for (const s of structures) {
    for (const { tree, fj } of s.elements) {
      const { positions: p } = readObj(tree, fj);
      for (let i = 0; i < p.length; i += 3)
        for (let a = 0; a < 3; a++) {
          bbox.min[a] = Math.min(bbox.min[a], p[i + a]);
          bbox.max[a] = Math.max(bbox.max[a], p[i + a]);
        }
    }
  }
}
const extent = bbox.max.map((m, i) => m - bbox.min[i]);
const center = bbox.max.map((m, i) => (m + bbox.min[i]) / 2);

function centroid(tree, cid, expected) {
  const s = [0, 0, 0];
  let n = 0;
  for (const fj of conceptElements(tree, cid, expected)) {
    const { positions: p } = readObj(tree, fj);
    for (let i = 0; i < p.length; i += 3) {
      s[0] += p[i]; s[1] += p[i + 1]; s[2] += p[i + 2]; n++;
    }
  }
  return s.map((x) => x / n);
}
// Up = longest extent; anterior = vertebral column -> sternum. Measured, not assumed.
const upAxis = extent.indexOf(Math.max(...extent));
const ant = centroid('partof', 'FMA7485', 'sternum').map((v, i) => v - centroid('partof', 'FMA13478', 'vertebral column')[i]);
ant[upAxis] = 0;
const antAxis = ant.map(Math.abs).indexOf(Math.max(...ant.map(Math.abs)));
const upSign = Math.sign(centroid('partof', 'FMA50801', 'brain')[upAxis] - center[upAxis]) || 1;
const antSign = Math.sign(ant[antAxis]);
const basisY = [0, 0, 0]; basisY[upAxis] = upSign;
const basisZ = [0, 0, 0]; basisZ[antAxis] = antSign;
const basisX = [
  basisY[1] * basisZ[2] - basisY[2] * basisZ[1],
  basisY[2] * basisZ[0] - basisY[0] * basisZ[2],
  basisY[0] * basisZ[1] - basisY[1] * basisZ[0],
];
const MM_TO_M = 0.001;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function toModel(x, y, z) {
  const c = [x - center[0], y - center[1], z - center[2]];
  return [dot(c, basisX) * MM_TO_M, dot(c, basisY) * MM_TO_M, dot(c, basisZ) * MM_TO_M];
}
const leftLung = centroid('partof', 'FMA7310', 'left lung');
const leftLungX = toModel(...leftLung)[0];
if (leftLungX <= 0) throw new Error('Left lung is on -X: the source would be mirrored by this transform');

// ---------------------------------------------------------------- build one GLB per layer
await MeshoptSimplifier.ready;
await MeshoptEncoder.ready;
mkdirSync(outDir, { recursive: true });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

const primTris = (p) => (p.getIndices() ? p.getIndices().getCount() : p.getAttribute('POSITION').getCount()) / 3;
const manifest = {
  assetId: 'body',
  kind: 'anatomical',
  attribution: 'BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International',
  modifications: 'Modified for AnatoSphere 3D: subset selected, meshes merged, converted to GLB, geometry simplified.',
  sourceLicense: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  license: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  sourceUrl: 'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html',
  layers: [],
  structures: [],
};
const report = { layers: [], conflicts, unnamedElements: unnamed, orientation: { up: 'xyz'[upAxis], upSign, anterior: 'xyz'[antAxis], antSign, leftLungX: +leftLungX.toFixed(4) } };

for (const layer of LAYERS) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene(`Layer_${layer.id}`);
  const layerNode = doc.createNode(`Layer_${layer.id}`).setExtras({
    layerId: layer.id,
    source: 'BodyParts3D 4.0',
    sourceLicense: 'CC BY 4.0',
    license: 'CC BY-SA 4.0',
  });
  scene.addChild(layerNode);
  const shared = layer.color
    ? doc.createMaterial(layer.id).setBaseColorFactor(layer.color).setRoughnessFactor(0.7).setMetallicFactor(0).setDoubleSided(!!layer.doubleSided)
    : null;

  const structures = plans.get(layer.id);
  for (const s of structures) {
    const material = shared ?? doc.createMaterial(sanitize(s.label)).setBaseColorFactor(s.color).setRoughnessFactor(0.6).setMetallicFactor(0);
    const pos = [];
    const idx = [];
    for (const { tree, fj } of s.elements) {
      const g = readObj(tree, fj);
      const base = pos.length / 3;
      for (let i = 0; i < g.positions.length; i += 3) pos.push(...toModel(g.positions[i], g.positions[i + 1], g.positions[i + 2]));
      for (const i of g.indices) idx.push(base + i);
    }
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer))
      .setMaterial(material);
    const nodeName = `${sanitize(s.label)}_${s.conceptId}`;
    const id = `${layer.id}:${s.conceptId}`;
    layerNode.addChild(doc.createNode(nodeName).setMesh(doc.createMesh(sanitize(s.label)).addPrimitive(prim)).setExtras({ structureId: id, conceptId: s.conceptId }));
    manifest.structures.push({
      id,
      layerId: layer.id,
      systemId: s.system,
      nodeName,
      label: s.label,
      conceptId: s.conceptId,
      elementFileIds: s.elements.map((e) => e.fj),
    });
  }

  await doc.transform(weld(), prune());
  const countTris = () => doc.getRoot().listMeshes().reduce((a, m) => a + m.listPrimitives().reduce((b, p) => b + primTris(p), 0), 0);
  const sourceTriangles = countTris();
  const ratio = Number(process.env.BODY_RATIO ?? layer.ratio);
  await doc.transform(
    simplify({ simplifier: MeshoptSimplifier, ratio, error: Number(process.env.BODY_ERROR ?? layer.error) }),
    normals({ overwrite: true }),
    prune(),
  );
  const triangles = countTris();
  await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
  const glb = await io.writeBinary(doc);
  const file = `${layer.id}.glb`;
  writeFileSync(join(outDir, file), glb);
  manifest.layers.push({
    id: layer.id,
    nodeName: layerNode.getName(),
    glbUrl: `/models/body/${file}`,
    defaultVisible: layer.defaultVisible,
    bytes: glb.byteLength,
    triangles,
  });
  report.layers.push({ id: layer.id, structures: structures.length, sourceTriangles, triangles, bytes: glb.byteLength });
}

writeFileSync(join(outDir, 'body.manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
writeFileSync(join(outDir, 'body.build-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildCatalog } from '../../src/lib/catalog';
import { normalize, search } from '../../src/lib/search';
import { translateName } from '../../src/lib/translateName';
import type { AssetManifest } from '../../src/lib/manifest';

const manifest = JSON.parse(readFileSync('public/models/body/body.manifest.json', 'utf8')) as AssetManifest;
const catalog = buildCatalog(manifest);

describe('search', () => {
  it('finds a structure by its English name', () => {
    expect(search(catalog, 'heart')[0]).toMatchObject({ kind: 'record', id: 'heart' });
  });

  it('finds a structure by its Indonesian name', () => {
    expect(search(catalog, 'jantung')[0]).toMatchObject({ kind: 'record', id: 'heart' });
    expect(search(catalog, 'ginjal')[0]).toMatchObject({ kind: 'record', id: 'kidneys' });
  });

  it('finds a structure by its Latin name', () => {
    expect(search(catalog, 'hepar')[0]).toMatchObject({ kind: 'record', id: 'liver' });
  });

  it('finds a structure by a synonym in either language', () => {
    expect(search(catalog, 'collarbone')[0]).toMatchObject({ kind: 'record', id: 'clavicle' });
    expect(search(catalog, 'tulang selangka')[0]).toMatchObject({ kind: 'record', id: 'clavicle' });
  });

  it('finds individual parts in Indonesian', () => {
    const hits = search(catalog, 'femur kiri');
    expect(hits.some((h) => h.kind === 'structure' && h.en.toLowerCase() === 'left femur')).toBe(true);
  });

  it('ignores case and accents', () => {
    expect(search(catalog, 'JÁNTUNG')[0]).toMatchObject({ id: 'heart' });
    expect(normalize('  Ósso-Frontal ')).toBe('osso frontal');
  });

  it('returns nothing for structures that are not in the model', () => {
    expect(search(catalog, 'latissimus dorsi')).toEqual([]);
  });

  it('only returns things that exist', () => {
    for (const q of ['tulang', 'otot', 'bone', 'left']) {
      for (const h of search(catalog, q, 500)) {
        if (h.kind === 'record') expect(catalog.recordById.has(h.id)).toBe(true);
        else expect(catalog.byId.has(h.id)).toBe(true);
      }
    }
  });

  it('needs at least two characters', () => {
    expect(search(catalog, 'a')).toEqual([]);
  });
});

describe('translateName', () => {
  it.each([
    ['Left femur', 'Femur kiri'],
    ['Right third rib', 'Tulang rusuk ketiga kanan'],
    ['Fifth lumbar vertebra', 'Vertebra lumbal kelima'],
    ['Distal phalanx of right thumb', 'Falang distal ibu jari tangan kanan'],
    ['Long head of left biceps brachii', 'Kepala panjang otot biceps brachii kiri'],
    ['Clavicular part of right deltoid', 'Bagian klavikular otot deltoid kanan'],
    ['Left sartorius', 'Otot sartorius kiri'],
    ['Abductor digiti minimi of right foot', 'Otot abductor digiti minimi kaki kanan'],
    ['Urinary bladder', 'Kandung kemih'],
  ])('%s -> %s', (en, id) => {
    expect(translateName(en)).toEqual({ text: id, complete: true });
  });

  it('does not guess an unknown name', () => {
    expect(translateName('Quantum organelle')).toEqual({ text: 'Quantum organelle', complete: false });
  });
});

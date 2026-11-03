import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RECORDS } from '../../src/data/anatomy/records';
import { REFERENCES, REFERENCE_BY_ID } from '../../src/data/references/references';
import { INTRO_TOUR } from '../../src/data/tours/tours';
import { SYSTEM_IDS } from '../../src/data/systems/systems';
import { buildCatalog } from '../../src/lib/catalog';
import type { AssetManifest } from '../../src/lib/manifest';
import en from '../../src/locales/en/common.json';
import id from '../../src/locales/id/common.json';

const manifest = JSON.parse(readFileSync('public/models/body/body.manifest.json', 'utf8')) as AssetManifest;
const catalog = buildCatalog(manifest);

function keys(o: object, prefix = ''): string[] {
  return Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' && v ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
}

describe('anatomy content', () => {
  it('documents at least 30 structures (PRD Phase 1)', () => {
    expect(RECORDS.length).toBeGreaterThanOrEqual(30);
  });

  it('has unique record ids', () => {
    expect(new Set(RECORDS.map((r) => r.id)).size).toBe(RECORDS.length);
  });

  it.each(RECORDS.map((r) => [r.id, r] as const))('%s: every mesh name exists in the model', (_, r) => {
    const labels = new Set(manifest.structures.map((s) => s.label.toLowerCase()));
    expect(r.meshNames.filter((n) => !labels.has(n.toLowerCase()))).toEqual([]);
  });

  it.each(RECORDS.map((r) => [r.id, r] as const))('%s: complete in both languages', (_, r) => {
    for (const field of [r.name, r.description, r.location, r.function]) {
      expect(field.en.trim().length).toBeGreaterThan(0);
      expect(field.id.trim().length).toBeGreaterThan(0);
    }
    expect(r.description.en).not.toBe(r.description.id);
    expect(r.function.en).not.toBe(r.function.id);
  });

  it.each(RECORDS.map((r) => [r.id, r] as const))('%s: cites at least one known reference', (_, r) => {
    expect(r.referenceIds.length).toBeGreaterThan(0);
    for (const ref of r.referenceIds) expect(REFERENCE_BY_ID.has(ref)).toBe(true);
  });

  it.each(RECORDS.map((r) => [r.id, r] as const))('%s: related structures exist', (_, r) => {
    const ids = new Set(RECORDS.map((x) => x.id));
    expect(r.relatedStructures.filter((x) => !ids.has(x))).toEqual([]);
    expect(r.relatedStructures).not.toContain(r.id);
  });

  it('claims no review that has not happened', () => {
    expect(RECORDS.filter((r) => r.reviewStatus !== 'draft').map((r) => r.id)).toEqual([]);
  });

  it('assigns each model part to at most one record', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const r of catalog.records) {
      for (const s of r.structureIds) {
        if (seen.has(s)) clashes.push(`${s}: ${seen.get(s)} and ${r.id}`);
        seen.set(s, r.id);
      }
    }
    expect(clashes).toEqual([]);
  });

  it('every reference has a direct https URL and an access date', () => {
    for (const r of REFERENCES) {
      expect(r.url).toMatch(/^https:\/\/openstax\.org\/books\/anatomy-and-physiology-2e\/pages\//);
      expect(r.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('the intro tour only visits documented structures in the model', () => {
    for (const step of INTRO_TOUR.steps) expect(catalog.recordById.has(step.recordId)).toBe(true);
  });
});

describe('localization', () => {
  it('English and Indonesian have exactly the same keys', () => {
    expect(keys(id).sort()).toEqual(keys(en).sort());
  });

  it('names every system and layer used by the model', () => {
    for (const sys of new Set(manifest.structures.map((s) => s.systemId))) {
      expect(SYSTEM_IDS).toContain(sys);
      expect((en.systems as Record<string, string>)[sys!]).toBeTruthy();
      expect((id.systems as Record<string, string>)[sys!]).toBeTruthy();
    }
    for (const l of manifest.layers) {
      expect((en.layers as Record<string, string>)[l.id]).toBeTruthy();
      expect((id.layers as Record<string, string>)[l.id]).toBeTruthy();
    }
  });

  it('every model part has an Indonesian name', () => {
    const missing = catalog.structures.filter((s) => !s.nameIdTranslated).map((s) => s.label);
    expect(missing).toEqual([]);
  });
});

describe('model manifest', () => {
  it('has unique structure ids and only known layers', () => {
    expect(new Set(manifest.structures.map((s) => s.id)).size).toBe(manifest.structures.length);
    const layers = new Set(manifest.layers.map((l) => l.id));
    for (const s of manifest.structures) expect(layers.has(s.layerId)).toBe(true);
  });
});

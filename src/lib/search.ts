import type { Catalog } from './catalog';

export interface SearchResult {
  kind: 'record' | 'structure';
  id: string;
  en: string;
  idn: string;
  latin?: string;
  score: number;
}

/** Lowercases, removes diacritics and treats punctuation as spaces. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function scoreTerm(term: string, query: string, tokens: string[]): number {
  if (term === query) return 100;
  if (term.startsWith(query)) return 80;
  if (term.split(' ').some((w) => w.startsWith(query))) return 60;
  if (term.includes(query)) return 40;
  if (tokens.length > 1 && tokens.every((t) => term.includes(t))) return 30;
  return 0;
}

function best(terms: string[], query: string, tokens: string[]): number {
  return Math.max(0, ...terms.map((t) => scoreTerm(normalize(t), query, tokens)));
}

/**
 * Finds structures by English, Indonesian or Latin name and by synonym. Results
 * come only from the catalog, so everything listed exists in the model.
 */
export function search(catalog: Catalog, rawQuery: string, limit = 30): SearchResult[] {
  const query = normalize(rawQuery);
  if (query.length < 2) return [];
  const tokens = query.split(' ');
  const results: SearchResult[] = [];

  for (const r of catalog.records) {
    const terms = [r.name.en, r.name.id, r.name.latin ?? '', ...r.synonyms.en, ...r.synonyms.id];
    const score = best(terms, query, tokens);
    // Documented structures rank above the individual parts they group.
    if (score > 0) results.push({ kind: 'record', id: r.id, en: r.name.en, idn: r.name.id, latin: r.name.latin, score: score + 10 });
  }
  for (const s of catalog.structures) {
    const score = best([s.label, s.nameId], query, tokens);
    if (score > 0) results.push({ kind: 'structure', id: s.id, en: s.label, idn: s.nameId, score });
  }

  return results.sort((a, b) => b.score - a.score || a.en.localeCompare(b.en)).slice(0, limit);
}

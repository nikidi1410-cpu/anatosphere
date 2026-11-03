import { expect, type Page } from '@playwright/test';

export type Anato = {
  ready: boolean;
  selectedId: string | null;
  selectedIds: string[];
  recordId: string | null;
  report: {
    meshes: number;
    triangles: number;
    missingStructures: string[];
    missingLayers: string[];
    renamedNodes: { raw: string; loaded: string }[];
  } | null;
  structureIds: string[];
  loadedLayers: string[];
  project(id: string): { x: number; y: number } | null;
  visible(id: string): boolean | null;
  materials(id: string): { uuid: string; emissive: string | null; color: string | null }[];
  camera(): { position: number[]; quaternion: number[]; target: number[] | null };
  setSheet(state: 'peek' | 'half' | 'full'): void;
};

declare global {
  interface Window {
    __anato?: Anato;
  }
}

export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

export async function waitForScene(page: Page) {
  await page.waitForFunction(() => window.__anato?.ready === true, null, { timeout: 60_000 });
  await page.waitForTimeout(1500); // first camera move
}

export const anato = <T,>(page: Page, fn: () => T) => page.evaluate(fn as never) as Promise<T>;
export const selected = (page: Page) => page.evaluate(() => window.__anato!.selectedId);
export const project = (page: Page, id: string) => page.evaluate((i) => window.__anato!.project(i), id);

export async function pointAt(page: Page, id: string, isMobile: boolean) {
  const p = await project(page, id);
  expect(p, `projection for ${id}`).not.toBeNull();
  if (isMobile) await page.touchscreen.tap(p!.x, p!.y);
  else await page.mouse.click(p!.x, p!.y);
  await page.waitForTimeout(200);
}

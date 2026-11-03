import { test, expect, type Page } from '@playwright/test';
import { anato, pointAt, project, selected, trackErrors, waitForScene } from './helpers';

/* Viewer pipeline checks against the generated NON-ANATOMICAL fixture, which contains
 * the awkward cases on purpose: shared materials, a multi-material mesh, duplicate
 * and sanitized node names, and an outer shell. */

async function openFixture(page: Page) {
  const errors = trackErrors(page);
  await page.goto('/?asset=fixture');
  await waitForScene(page);
  return errors;
}

/** Layer controls live in the bottom sheet on mobile. */
async function layerCheckbox(page: Page, name: string, isMobile: boolean) {
  if (isMobile) await page.getByRole('tab', { name: 'Layers' }).click();
  return page.getByRole('checkbox', { name });
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => localStorage.setItem('anatosphere.language', 'en'));
});

test('load and hierarchy report', async ({ page }) => {
  const errors = await openFixture(page);
  const r = await anato(page, () => window.__anato!.report!);
  expect(r.missingStructures).toEqual([]);
  expect(r.missingLayers).toEqual([]);
  const raw = r.renamedNodes.map((n) => n.raw);
  expect(raw).toContain('Fixture.Dotted Name');
  expect(raw).toContain('Fixture_Duplicate');
  expect(errors).toEqual([]);
});

test('selection respects occlusion and hidden layers', async ({ page, isMobile }) => {
  const errors = await openFixture(page);
  await pointAt(page, 'box-2', isMobile);
  expect(await selected(page)).toBe('shell'); // outer shell is in front
  await (await layerCheckbox(page, 'Layer C (outer shell)', isMobile)).setChecked(false);
  expect(await page.evaluate(() => window.__anato!.visible('shell'))).toBe(false);
  await page.evaluate(() => window.__anato!.setSheet('peek'));
  await page.waitForTimeout(300);
  await pointAt(page, 'box-2', isMobile);
  expect(await selected(page)).toBe('box-2'); // hidden shell no longer catches the click
  await pointAt(page, 'two-mat', isMobile);
  expect(await selected(page)).toBe('two-mat'); // multi-primitive mesh resolves to its node
  await pointAt(page, 'dup-2', isMobile);
  expect(await selected(page)).toBe('dup-2'); // duplicate raw names stay distinct
  expect(errors).toEqual([]);
});

test('highlight stays on the selection and is restored', async ({ page, isMobile }) => {
  await openFixture(page);
  await (await layerCheckbox(page, 'Layer C (outer shell)', isMobile)).setChecked(false);
  await page.evaluate(() => window.__anato!.setSheet('peek'));
  await page.waitForTimeout(300);
  const before = await page.evaluate(() => window.__anato!.materials('box-2'));
  await pointAt(page, 'box-1', isMobile);
  expect(await selected(page)).toBe('box-1');
  const m1 = await page.evaluate(() => window.__anato!.materials('box-1'));
  const m2 = await page.evaluate(() => window.__anato!.materials('box-2'));
  expect(m1[0].emissive).not.toBe('000000');
  expect(m2[0].emissive).toBe('000000');
  expect(m2[0].uuid).toBe(before[0].uuid);
  await pointAt(page, 'two-mat', isMobile);
  const tm = await page.evaluate(() => window.__anato!.materials('two-mat'));
  expect(tm).toHaveLength(2);
  expect(tm.every((m) => m.emissive !== '000000')).toBe(true);
  const after = await page.evaluate(() => window.__anato!.materials('box-1'));
  expect(after[0].uuid).toBe(before[0].uuid);
  expect(after[0].emissive).toBe('000000');
});

test('a drag rotates without selecting; an empty click clears; reset restores the view', async ({ page, isMobile }) => {
  test.skip(isMobile, 'uses a mouse drag; touch gestures were checked on a real phone');
  const errors = await openFixture(page);
  await page.getByRole('checkbox', { name: 'Layer C (outer shell)' }).setChecked(false);
  const cam0 = await page.evaluate(() => window.__anato!.camera());
  await pointAt(page, 'box-2', false);
  expect(await selected(page)).toBe('box-2');
  const p = (await project(page, 'box-1'))!;
  await page.mouse.move(p.x, p.y);
  await page.mouse.down();
  await page.mouse.move(p.x + 200, p.y + 40, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  expect(await selected(page)).toBe('box-2');
  const cam1 = await page.evaluate(() => window.__anato!.camera());
  expect(cam1.position).not.toEqual(cam0.position);
  const box = (await page.locator('.viewer canvas').boundingBox())!;
  await page.mouse.click(box.x + 40, box.y + box.height - 40);
  await page.waitForTimeout(150);
  expect(await selected(page)).toBeNull();
  await page.getByRole('button', { name: 'Reset view' }).click();
  await page.waitForTimeout(1500);
  const cam2 = await page.evaluate(() => window.__anato!.camera());
  cam2.position.forEach((v, i) => expect(Math.abs(v - cam0.position[i])).toBeLessThan(0.02));
  expect(errors).toEqual([]);
});

test('isolate and show-all act on real layer nodes', async ({ page, isMobile }) => {
  await openFixture(page);
  if (isMobile) await page.getByRole('tab', { name: 'Layers' }).click();
  await page.getByRole('button', { name: 'Show only Layer A (shared material)' }).click();
  const vis = () => page.evaluate(() => ['layer-a', 'layer-b', 'layer-c'].map((l) => window.__anato!.visible(l)));
  expect(await vis()).toEqual([true, false, false]);
  await page.getByRole('button', { name: 'Show all layers' }).click();
  expect(await vis()).toEqual([true, true, true]);
});

test('a missing asset shows a recoverable error instead of crashing', async ({ page }) => {
  await page.goto('/?asset=missing');
  await expect(page.getByRole('alert')).toContainText("The model isn't available");
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

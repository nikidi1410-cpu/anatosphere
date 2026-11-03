import { test, expect, type Page } from '@playwright/test';
import { anato, selected, trackErrors, waitForScene } from './helpers';

/* Phase 1 user journeys against the real anatomical model. Assertions read real scene
 * state through the dev-only window.__anato hook where the UI alone can't prove it. */

const HEART = 'organs:FMA7088';
const shot = (page: Page, project: string, name: string) => page.screenshot({ path: `test-results/screens/${project}-${name}.png` });

async function enter(page: Page, lang: 'en' | 'id' = 'en') {
  await page.addInitScript((l) => {
    if (!localStorage.getItem('anatosphere.language')) localStorage.setItem('anatosphere.language', l);
  }, lang);
  const errors = trackErrors(page);
  await page.goto('/');
  await waitForScene(page);
  return errors;
}

async function explore(page: Page) {
  await page.getByRole('button', { name: /Explore the body|Jelajahi tubuh/ }).click();
  await page.waitForTimeout(400);
}

/** On mobile the search box is in the top bar, so this works on both layouts. */
async function searchFor(page: Page, text: string) {
  await page.getByRole('combobox').fill(text);
}

test('start page: shows the model and leads into the explorer', async ({ page }, info) => {
  const errors = await enter(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The human body, layer by layer.');
  expect(await page.evaluate(() => window.__anato!.loadedLayers.sort())).toEqual(['organs', 'skeleton']);
  await shot(page, info.project.name, 'home');
  await explore(page);
  await expect(page.getByRole('combobox')).toBeVisible();
  await page.waitForTimeout(800);
  await shot(page, info.project.name, 'explore');
  expect(errors).toEqual([]);
});

test('layers load only when first shown', async ({ page, isMobile }) => {
  const errors = await enter(page);
  await explore(page);
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.glb')) requests.push(r.url().split('/').pop()!);
  });
  expect(await page.evaluate(() => window.__anato!.loadedLayers)).not.toContain('muscles');
  if (isMobile) await page.getByRole('tab', { name: 'Layers' }).click();
  await page.getByRole('checkbox', { name: 'Muscles' }).check();
  await page.waitForFunction(() => window.__anato!.loadedLayers.includes('muscles'), null, { timeout: 60_000 });
  expect(requests).toEqual(['muscles.glb']);
  const r = await anato(page, () => window.__anato!.report!);
  expect(r.missingStructures).toEqual([]);
  expect(r.missingLayers).toEqual([]);
  expect(errors).toEqual([]);
});

test('every layer maps every structure once loaded', async ({ page, isMobile }, info) => {
  await enter(page);
  await explore(page);
  if (isMobile) await page.getByRole('tab', { name: 'Layers' }).click();
  await page.getByRole('button', { name: 'Show all layers' }).click();
  await page.waitForFunction(() => window.__anato!.loadedLayers.length === 4, null, { timeout: 60_000 });
  await page.waitForTimeout(1500);
  const r = await anato(page, () => window.__anato!.report!);
  console.log(`[${info.project.name}] all layers: meshes=${r.meshes} triangles=${r.triangles}`);
  await page.getByRole('button', { name: 'Show only Muscles' }).click();
  await page.waitForTimeout(400);
  if (isMobile) await page.evaluate(() => window.__anato!.setSheet('peek'));
  await page.waitForTimeout(500);
  await shot(page, info.project.name, 'muscles');
  expect(r.missingStructures).toEqual([]);
  expect(r.missingLayers).toEqual([]);
});

test('search: Indonesian term finds the heart, highlights it and focuses the camera', async ({ page }, info) => {
  const errors = await enter(page, 'id');
  await page.getByRole('button', { name: 'Jelajahi tubuh' }).click();
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => window.__anato!.camera());
  await searchFor(page, 'jantung');
  await page.getByRole('option', { name: /Jantung/ }).first().click();
  await page.waitForTimeout(1200);
  expect(await selected(page)).toBe(HEART);
  const materials = await page.evaluate((id) => window.__anato!.materials(id), HEART);
  expect(materials.every((m) => m.emissive !== '000000')).toBe(true);
  const after = await page.evaluate(() => window.__anato!.camera());
  expect(after.position).not.toEqual(before.position);
  await expect(page.locator('.atlas-label')).toHaveText('Jantung');
  await shot(page, info.project.name, 'heart-id');
  expect(errors).toEqual([]);
});

test('search: a term in a hidden layer turns that layer on, and absent structures say so', async ({ page }) => {
  const errors = await enter(page);
  await explore(page);
  await searchFor(page, 'latissimus');
  await expect(page.getByText('Nothing named "latissimus" in this model')).toBeVisible();
  await searchFor(page, 'biceps brachii');
  await page.getByRole('option', { name: /Biceps brachii/ }).first().click();
  await page.waitForFunction(() => window.__anato!.loadedLayers.includes('muscles'), null, { timeout: 60_000 });
  await page.waitForTimeout(1200);
  const ids = await page.evaluate(() => window.__anato!.selectedIds);
  expect(ids.length).toBe(4); // two heads on each side
  expect(await page.evaluate((id) => window.__anato!.visible(id), ids[0])).toBe(true);
  expect(errors).toEqual([]);
});

test('selecting on the model shows the information and its reference', async ({ page, isMobile }, info) => {
  const errors = await enter(page);
  await explore(page);
  await searchFor(page, 'left femur');
  await page.getByRole('option', { name: /Left femur/ }).first().click();
  await page.waitForTimeout(1000);
  if (isMobile) await page.getByRole('button', { name: /Read more/ }).click();
  await expect(page.getByRole('heading', { name: 'Femur', exact: true })).toBeVisible();
  await expect(page.getByText('The single bone of the thigh')).toBeVisible();
  const ref = page.getByRole('link', { name: '8.4 Bones of the Lower Limb' });
  await expect(ref).toHaveAttribute('href', /openstax\.org.*8-4-bones-of-the-lower-limb/);
  await expect(page.getByText('not yet reviewed by an anatomy educator')).toBeVisible();
  await shot(page, info.project.name, 'femur-info');
  expect(errors).toEqual([]);
});

test('a structure without a description says so plainly', async ({ page, isMobile }) => {
  await enter(page);
  await explore(page);
  await searchFor(page, 'vomer');
  await page.getByRole('option', { name: /Vomer/ }).first().click();
  await page.waitForTimeout(600);
  if (isMobile) await page.getByRole('button', { name: /Read more/ }).click();
  await expect(page.getByText("a description hasn't been written yet")).toBeVisible();
});

test('language: switches content and persists across visits', async ({ page, isMobile }) => {
  await enter(page);
  await explore(page);
  await searchFor(page, 'heart');
  await page.getByRole('option', { name: /Heart/ }).first().click();
  await page.waitForTimeout(800);
  if (isMobile) await page.getByRole('button', { name: /Read more/ }).click();
  await expect(page.getByRole('heading', { name: 'Heart', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Bahasa Indonesia' }).click();
  await expect(page.getByRole('heading', { name: 'Jantung', exact: true })).toBeVisible();
  await expect(page.getByText('Organ berotot dengan empat ruang')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.lang)).toBe('id');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Jelajahi tubuh' })).toBeVisible();
});

test('body system filter acts on real model parts', async ({ page, isMobile }, info) => {
  const errors = await enter(page);
  await explore(page);
  if (isMobile) await page.getByRole('tab', { name: 'Layers' }).click();
  const before = await page.evaluate(() => window.__anato!.camera());
  await page.getByRole('radio', { name: 'Digestive' }).click();
  await page.waitForTimeout(1000);
  const after = await page.evaluate(() => window.__anato!.camera());
  expect(after.position[2]).toBeLessThan(before.position[2]);
  const stomach = 'organs:FMA7148';
  expect(await page.evaluate((id) => window.__anato!.visible(id), stomach)).toBe(true);
  expect(await page.evaluate((id) => window.__anato!.visible(id), HEART)).toBe(false);
  expect(await page.evaluate(() => window.__anato!.visible('skeleton'))).toBe(false);
  await shot(page, info.project.name, 'digestive');
  await page.getByRole('radio', { name: 'All', exact: true }).click();
  expect(await page.evaluate((id) => window.__anato!.visible(id), HEART)).toBe(true);
  expect(errors).toEqual([]);
});

test('intro tour: runs start to finish and can be left at any time', async ({ page }, info) => {
  const errors = await enter(page);
  await page.getByRole('button', { name: 'Take the intro tour' }).click();
  await page.waitForTimeout(1200);
  const tour = page.getByRole('complementary', { name: 'Guided tour' });
  await expect(tour.getByText('Step 1 of 7')).toBeVisible();
  await expect(tour.getByRole('heading', { name: 'Ribs' })).toBeVisible();
  await tour.getByRole('button', { name: 'Next' }).click();
  await page.waitForTimeout(1000);
  await expect(tour.getByRole('heading', { name: 'Heart' })).toBeVisible();
  expect(await selected(page)).toBe(HEART);
  await shot(page, info.project.name, 'tour');
  await tour.getByRole('button', { name: 'Previous' }).click();
  await expect(tour.getByRole('heading', { name: 'Ribs' })).toBeVisible();
  for (let i = 0; i < 6; i++) await tour.getByRole('button', { name: 'Next' }).click();
  await tour.getByRole('button', { name: 'Finish' }).click();
  await expect(tour.getByRole('heading', { name: 'Tour finished' })).toBeVisible();
  await tour.getByRole('button', { name: 'Keep exploring' }).click();
  await expect(tour).toBeHidden();
  expect(errors).toEqual([]);
});

test('a layer that fails to download can be retried, and the rest keeps working', async ({ page, isMobile }) => {
  await enter(page);
  await explore(page);
  let block = true;
  await page.route('**/muscles.glb', (route) => (block ? route.abort() : route.continue()));
  if (isMobile) await page.getByRole('tab', { name: 'Layers' }).click();
  await page.getByRole('checkbox', { name: 'Muscles' }).check();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('alert')).toContainText("couldn't be downloaded");
  expect(await page.evaluate((id) => window.__anato!.visible(id), HEART)).toBe(true);
  block = false;
  await page.getByRole('button', { name: 'Retry' }).click();
  await page.waitForFunction(() => window.__anato!.loadedLayers.includes('muscles'), null, { timeout: 60_000 });
});

test('panels collapse to give the model more room', async ({ page, isMobile }) => {
  test.skip(isMobile, 'mobile uses the bottom sheet');
  await enter(page);
  await explore(page);
  const canvas = page.locator('.viewer canvas');
  const wide = (await canvas.boundingBox())!.width;
  await page.getByRole('button', { name: 'Hide controls' }).click();
  await page.getByRole('button', { name: 'Hide details' }).click();
  await page.waitForTimeout(300);
  expect((await canvas.boundingBox())!.width).toBeGreaterThan(wide + 500);
  await page.getByRole('button', { name: 'Show controls' }).click();
  await expect(page.getByRole('combobox')).toBeVisible();
});

test('bottom sheet moves between its three heights', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'mobile only');
  await enter(page);
  await explore(page);
  const sheet = page.locator('.sheet');
  await expect(sheet).toHaveAttribute('data-state', 'peek');
  await page.getByRole('tab', { name: 'Layers' }).click();
  await expect(sheet).toHaveAttribute('data-state', 'half');
  await expect(page.getByRole('checkbox', { name: 'Skeleton' })).toBeVisible();
  await page.waitForTimeout(300);
  await shot(page, info.project.name, 'sheet-half');
  await page.locator('.sheet-handle').click();
  await expect(sheet).toHaveAttribute('data-state', 'full');
  await page.locator('.sheet-handle').click();
  await expect(sheet).toHaveAttribute('data-state', 'peek');
});

test('keyboard: search results can be used without a pointer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard journey');
  await enter(page);
  await explore(page);
  await page.getByRole('combobox').focus();
  await page.keyboard.type('liver');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.__anato!.recordId)).toBe('liver');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__anato!.recordId)).toBeNull();
});

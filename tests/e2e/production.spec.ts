import { test, expect } from '@playwright/test';
import { trackErrors } from './helpers';

/* Runs only against a production build: E2E_BASE_URL=http://localhost:4173 npx playwright test production
 * The dev-only window.__anato hook is absent there, so this checks what a visitor sees. */
test.skip(!process.env.E2E_BASE_URL, 'set E2E_BASE_URL to a production preview');

test('production build: loads, renders and searches without errors', async ({ page, isMobile }, info) => {
  await page.addInitScript(() => localStorage.setItem('anatosphere.language', 'en'));
  const errors = trackErrors(page);
  const glbs: string[] = [];
  page.on('request', (r) => {
    if (r.url().endsWith('.glb')) glbs.push(r.url().split('/').pop()!);
  });
  await page.goto('/?debug');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.perf')).toContainText(/[1-9]\d* draw calls/, { timeout: 60_000 });
  expect(glbs.sort()).toEqual(['organs.glb', 'skeleton.glb']);
  expect(await page.evaluate(() => 'window.__anato' in globalThis && !!(window as { __anato?: unknown }).__anato)).toBe(false);

  await page.getByRole('button', { name: 'Explore the body' }).click();
  await page.getByRole('combobox').fill('jantung');
  await page.getByRole('option', { name: /Heart/ }).first().click();
  await page.waitForTimeout(1200);
  await expect(page.locator('.atlas-label')).toHaveText('Heart');
  if (isMobile) await page.getByRole('button', { name: /Read more/ }).click();
  await expect(page.getByRole('link', { name: '19.1 Heart Anatomy' })).toBeVisible();
  console.log(`[${info.project.name}] production perf: ${await page.locator('.perf').textContent()}`);
  expect(errors).toEqual([]);
});

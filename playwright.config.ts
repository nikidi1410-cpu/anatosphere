import { defineConfig, devices } from '@playwright/test';

// Uses the locally installed Google Chrome (channel: 'chrome'); no Playwright
// browser download is required.
const PORT = 5199;
const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: external ?? `http://localhost:${PORT}`,
    channel: 'chrome',
    launchOptions: { args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 1024, height: 768 }, hasTouch: true } },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: 'chrome', defaultBrowserType: 'chromium' },
    },
  ],
  webServer: external
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT} --strictPort`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});

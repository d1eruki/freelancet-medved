import { defineConfig } from '@playwright/test'

const basePath = process.env.SITE_BASE || '/freelancet-medved/'
if (!basePath.startsWith('/') || !basePath.endsWith('/')) {
  throw new Error('SITE_BASE должен начинаться и заканчиваться символом /')
}

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 2,
  outputDir: '/tmp/medved-playwright-results',
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: 'list',
  use: {
    channel: 'chromium',
    baseURL: `http://127.0.0.1:4173${basePath}`,
    reducedMotion: 'reduce',
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium-desktop', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: `http://127.0.0.1:4173${basePath}`,
    reuseExistingServer: false,
    timeout: 30000,
  },
})

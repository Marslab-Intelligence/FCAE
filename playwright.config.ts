import { defineConfig } from '@playwright/test';

/**
 * Visual-verification harness only. This project has no functional
 * Playwright suite — the point is to actually see rendered pages at the
 * breakpoints in the responsive audit, which headless `google-chrome
 * --screenshot` could not do for scroll-pinned / whileInView sections.
 */
export default defineConfig({
  testDir: './tests/visual',
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    // No fixed viewport here — each spec sets it per breakpoint.
  },
});

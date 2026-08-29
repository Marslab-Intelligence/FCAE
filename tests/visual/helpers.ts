import type { Page } from '@playwright/test';

/** The six breakpoints from the responsive audit plan. */
export const BREAKPOINTS = {
  '320':  { width: 320,  height: 700 },
  '375':  { width: 375,  height: 812 },
  '768':  { width: 768,  height: 1024 },
  '1024': { width: 1024, height: 800 },
  '1440': { width: 1440, height: 900 },
  '1920': { width: 1920, height: 1080 },
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;

/**
 * Scrolls the full page in steps so every `whileInView` (Framer Motion) and
 * IntersectionObserver-based reveal has fired before a screenshot is taken.
 * The old `google-chrome --screenshot` CLI could not do this — it renders
 * once under a virtual-time budget with no real scroll, so anything gated on
 * scroll position (which is most of this site) came back blank. A real
 * browser under Playwright can actually scroll, which is the point of it.
 */
export async function revealFullPage(page: Page) {
  await page.waitForLoadState('networkidle');
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 400;
  for (let y = 0; y < height; y += step) {
    await page.evaluate((pos) => window.scrollTo(0, pos), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

/** Checks the documented failure mode directly: does the page overflow horizontally? */
export async function hasHorizontalOverflow(page: Page): Promise<{ overflow: boolean; scrollWidth: number; clientWidth: number }> {
  return page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
}

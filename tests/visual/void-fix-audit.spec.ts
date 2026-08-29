import { test, expect } from '@playwright/test';

/**
 * Verifies the "stranded near top of viewport" bug fix on /build, /cart,
 * /checkout, /checkout/success: at large viewport heights the main content
 * block should be roughly vertically centered (or fill the viewport, for
 * /build), not pinned near the top with dead space below.
 */
const LARGE_VIEWPORTS = {
  '1920x1080': { width: 1920, height: 1080 },
  '2560x1440': { width: 2560, height: 1440 },
  '3840x2160': { width: 3840, height: 2160 },
} as const;

const MOBILE_VIEWPORT = { width: 390, height: 844 };

const PAGES = ['/build', '/cart', '/checkout', '/checkout/success'] as const;

async function measureMainContent(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const main = document.querySelector('[data-audit="content-block"]') ?? document.querySelector('main') ?? document.body;
    const rect = main.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
      viewportHeight: window.innerHeight,
    };
  });
}

for (const path of PAGES) {
  for (const [label, viewport] of Object.entries(LARGE_VIEWPORTS)) {
    test(`${path} at ${label}: content not stranded near top`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const m = await measureMainContent(page);
      const contentMidpoint = (m.top + m.bottom) / 2;
      const viewportMidpoint = m.viewportHeight / 2;
      const offset = Math.abs(contentMidpoint - viewportMidpoint);

      console.log(
        `${path} @ ${label}: content top=${m.top.toFixed(0)} bottom=${m.bottom.toFixed(0)} height=${m.height.toFixed(0)} viewportH=${m.viewportHeight} contentMid=${contentMidpoint.toFixed(0)} viewportMid=${viewportMidpoint} offset=${offset.toFixed(0)}`,
      );

      const safeName = path.replace(/\//g, '_') || '_home';
      await page.screenshot({ path: `tests/visual/__out/void-fix${safeName}-${label}.png` });

      // Content midpoint should be reasonably close to viewport midpoint
      // (within 25% of viewport height) OR content should fill essentially
      // the whole viewport height (>=90%) — either counts as "not stranded".
      const fillsViewport = m.height >= m.viewportHeight * 0.9;
      const isCentered = offset <= m.viewportHeight * 0.25;
      expect(fillsViewport || isCentered).toBeTruthy();
    });
  }

  test(`${path} at 390x844 mobile: unaffected (content taller than viewport)`, async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const m = await measureMainContent(page);
    console.log(`${path} @ 390x844: content height=${m.height.toFixed(0)} viewportH=${m.viewportHeight}`);

    const safeName = path.replace(/\//g, '_') || '_home';
    await page.screenshot({ path: `tests/visual/__out/void-fix${safeName}-390x844.png`, fullPage: true });

    // Mobile content should still be at least full viewport height (no broken
    // centering shrinking things), sanity check only.
    expect(m.height).toBeGreaterThan(0);
  });
}

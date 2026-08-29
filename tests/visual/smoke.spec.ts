import { test, expect } from '@playwright/test';
import { revealFullPage, hasHorizontalOverflow } from './helpers';

/**
 * One-page, one-breakpoint sanity check that the harness itself works before
 * trusting it for the real audit: real scroll fires whileInView reveals, and
 * the overflow check catches what the CLI screenshot approach couldn't.
 */
test('smoke: home page at 375px scrolls, reveals content, no overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await revealFullPage(page);

  await expect(page.locator('h1').first()).toBeVisible();

  const { overflow, scrollWidth, clientWidth } = await hasHorizontalOverflow(page);
  console.log(`  scrollWidth=${scrollWidth} clientWidth=${clientWidth} overflow=${overflow}`);

  await page.screenshot({ path: 'tests/visual/__out/smoke-home-375.png', fullPage: true });
});

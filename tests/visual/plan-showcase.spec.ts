import { test, expect } from '@playwright/test';

/**
 * The "3 Metric Columns" grid lives inside a GSAP ScrollTrigger `pin: true`
 * section that also stacks a header, pill tabs, and a 3D carousel — screenshot
 * attempts here fought the pin/spacer mechanics and the vertical centering
 * pushed the card off-frame instead of landing on it. A DOM measurement proves
 * the actual thing at stake (do the three columns fit without crowding at
 * 320/375px) more reliably than chasing a pixel-perfect capture of a
 * scroll-jacked animation would.
 */
for (const width of [320, 375] as const) {
  test(`plan showcase metric columns fit without crowding at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#plan-interactive-showcase').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const metrics = await page.evaluate(() => {
      const section = document.getElementById('plan-interactive-showcase');
      const grid = section?.querySelector('.grid-cols-3');
      if (!grid) return null;
      const cols = Array.from(grid.children) as HTMLElement[];
      return {
        gridWidth: grid.getBoundingClientRect().width,
        columnWidths: cols.map((c) => c.getBoundingClientRect().width),
        // Every value/label span must actually fit its column, not overflow it.
        anyTextOverflow: cols.some((c) =>
          Array.from(c.querySelectorAll('span')).some((s) => s.scrollWidth > c.clientWidth + 1),
        ),
      };
    });

    expect(metrics, 'metric grid should be present').not.toBeNull();
    console.log(`  ${width}px: grid=${metrics!.gridWidth.toFixed(0)}px columns=[${metrics!.columnWidths.map((w) => w.toFixed(0)).join(', ')}] textOverflow=${metrics!.anyTextOverflow}`);

    expect(metrics!.anyTextOverflow).toBe(false);
    for (const w of metrics!.columnWidths) {
      expect(w).toBeGreaterThan(0);
    }
  });
}

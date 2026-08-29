import { execSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { revealFullPage, hasHorizontalOverflow } from './helpers';

/**
 * Issues #2 (Portfolio results tiles) and #3 (Support stats tiles). Element
 * screenshots proved unreliable here — wrong-element matches and blank
 * captures on two different pages — so this uses the same DOM-measurement
 * approach that verified fix #1 cleanly: page-level overflow plus per-grid
 * text-overflow and column-width checks, which is what "responsive is
 * broken" actually cashes out to.
 */

const SESSION_ID = 'pw-audit-support';
const TEST_EMAIL = 'sameerulrahman212002@gmail.com';

/** Runs a query against the dev Postgres container via the same docker-compose service used manually throughout this project. */
function psql(sql: string) {
  // Playwright's config lives at the project root and tests always run from
  // there, so process.cwd() is reliable — __dirname is not defined in this
  // ESM test context and threw silently inside the try/catch below.
  execSync(
    `docker compose exec -T db psql -U mercury -d mercury_landing -c ${JSON.stringify(sql)}`,
    { cwd: process.cwd(), stdio: 'pipe' },
  );
}

async function measureGrid(page: import('@playwright/test').Page, selector: string) {
  return page.evaluate((sel) => {
    const grid = document.querySelector(sel);
    if (!grid) return null;
    const cols = Array.from(grid.children) as HTMLElement[];
    return {
      gridWidth: grid.getBoundingClientRect().width,
      columnWidths: cols.map((c) => c.getBoundingClientRect().width),
      anyTextOverflow: cols.some((c) =>
        Array.from(c.querySelectorAll('p, span')).some((el) => el.scrollWidth > el.clientWidth + 1),
      ),
    };
  }, selector);
}

/**
 * Checks every matching grid on the page, not just the first. The portfolio
 * page repeats this markup once per case study with different label/value
 * text ("Security Score", "Servers Migrated", ...) — a fix verified against
 * only the first instance passed while a later one ("Cost Reduction") was
 * still overflowing by 3px, caught only by widening this check.
 */
async function measureAllGrids(page: import('@playwright/test').Page, selector: string) {
  return page.evaluate((sel) => {
    const grids = Array.from(document.querySelectorAll(sel));
    return grids.map((grid) => {
      const cols = Array.from(grid.children) as HTMLElement[];
      const overflowing = cols.flatMap((c) =>
        Array.from(c.querySelectorAll('p, span'))
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .map((el) => el.textContent?.trim() ?? ''),
      );
      return { overflowing };
    });
  }, selector);
}

for (const width of [320, 375] as const) {
  test(`portfolio results grid fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1400 });
    await page.goto('/portfolio');
    await revealFullPage(page);

    const { overflow } = await hasHorizontalOverflow(page);
    expect(overflow, 'page should not scroll horizontally').toBe(false);

    const grids = await measureAllGrids(page, 'div.grid.grid-cols-3');
    expect(grids.length, 'expect one results grid per case study').toBeGreaterThan(0);
    for (const [i, g] of grids.entries()) {
      console.log(`  portfolio ${width}px case study #${i}: overflowing=[${g.overflowing.join(', ')}]`);
      expect(g.overflowing, `case study #${i} should have no overflowing text`).toEqual([]);
    }
  });
}

/**
 * /account/support is behind auth. Self-provisions a session row for the
 * duration of this describe block instead of relying on one created and
 * cleaned up by hand — the previous version of this test depended on a
 * manually-inserted row and broke the moment that row was cleaned up between
 * runs. Skips cleanly if the DB isn't reachable (e.g. CI without the compose
 * stack) rather than failing the whole suite.
 */
test.describe('support stats grid (authenticated)', () => {
  let dbAvailable = true;

  test.beforeAll(() => {
    try {
      // Single line, deliberately: a multi-line template literal here got
      // JSON.stringify'd into literal "\n" text, which psql -c choked on with
      // "invalid command \n" instead of executing the statements.
      psql(
        `delete from sessions where id='${SESSION_ID}'; ` +
        `insert into sessions (id, user_id, expires_at) select '${SESSION_ID}', id, now() + interval '1 hour' from users where email='${TEST_EMAIL}';`,
      );
    } catch (err) {
      dbAvailable = false;
      // A skip with no explanation reads as "not applicable"; this was
      // actually an error the first time (__dirname undefined in this ESM
      // test context) and skipped silently instead of failing loudly.
      console.error('[support-grid tests] could not provision test session, skipping:', err);
    }
  });

  test.afterAll(() => {
    if (dbAvailable) {
      try { psql(`delete from sessions where id='${SESSION_ID}';`); } catch { /* best effort */ }
    }
  });

  for (const width of [320, 375] as const) {
    test(`support stats grid fits at ${width}px`, async ({ browser }) => {
      test.skip(!dbAvailable, 'dev DB not reachable — cannot provision a test session');

      const context = await browser.newContext();
      await context.addCookies([{ name: 'mercury_session', value: SESSION_ID, domain: '127.0.0.1', path: '/' }]);
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/account/support');
      await page.waitForLoadState('networkidle');

      const { overflow } = await hasHorizontalOverflow(page);
      expect(overflow, 'page should not scroll horizontally').toBe(false);

      const m = await measureGrid(page, 'div.grid.grid-cols-3');
      expect(m, 'stats grid should be present (auth must have worked)').not.toBeNull();
      console.log(`  support ${width}px: grid=${m!.gridWidth.toFixed(0)}px columns=[${m!.columnWidths.map((w) => w.toFixed(0)).join(', ')}] textOverflow=${m!.anyTextOverflow}`);
      expect(m!.anyTextOverflow).toBe(false);

      await context.close();
    });
  }
});

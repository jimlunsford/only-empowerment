import { test, expect } from '@playwright/test';

const anchors = [
  'why-period',
  'reading-ownership-practice',
  'reading-ownership-responses',
  'reading-ownership-follow-through',
  'reading-ownership-connected-code',
  'reading-standard-card',
];

for (const mode of ['disabled', 'failed'] as const) {
  for (const anchor of anchors) {
    test(`native ${anchor} stays in view after settled refresh with scripts ${mode}`, async ({
      browser,
      baseURL,
    }) => {
      // The original reading tests retain each project's device scale. Also
      // exercise the 1x layout used by the reproducing native-refresh probe.
      const context = await browser.newContext({
        javaScriptEnabled: mode !== 'disabled',
        deviceScaleFactor: 1,
      });
      if (mode === 'failed') await context.route('**/*.js', (route) => route.abort());
      // Reproduce a cold font response. This is an adverse network condition,
      // never a delay used to make a click or refresh pass.
      await context.route('**/*.woff2', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await route.continue();
      });
      try {
        const page = await context.newPage();
        await page.goto(baseURL! + '/#' + anchor);
        const target = page.locator('#' + anchor);
        await expect(target).toBeInViewport();
        for (let refresh = 0; refresh < 3; refresh++) {
          await page.reload();
          await expect(page).toHaveURL(new RegExp('#' + anchor + '$'));
          // The old failure can happen AFTER an initially correct fragment jump.
          // Inspect the settled layout as well, without changing its scroll.
          if (mode === 'disabled')
            await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
          else await page.evaluate(() => document.fonts.ready);
          // Browsers suppress animation callbacks when JavaScript is disabled.
          // Keep that mode observable without waiting for page-script callbacks.
          if (mode === 'failed') {
            await page.evaluate(
              () =>
                new Promise<void>((resolve) =>
                  requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
                ),
            );
          }
          // A correct initial jump is not enough: native restoration can run
          // after font readiness. Assert throughout a bounded observation window.
          for (let sample = 0; sample < 10; sample++) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            await expect(target).toBeInViewport();
          }
        }
      } finally {
        await context.close();
      }
    });
  }
}

test('app anchors align after cold font layout on direct entry and refresh', async ({ page }) => {
  await page.route('**/*.woff2', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.continue();
  });
  for (const id of ['/period/first-moment', '/period/why']) {
    await page.goto('/#' + id);
    const target = page.locator(`[id="${id}"]`);
    for (let visit = 0; visit < 3; visit++) {
      if (visit) await page.reload();
      await expect(target).toBeFocused();
      await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
      const box = await target.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y).toBeLessThan(50);
    }
  }
});

test('pending font alignment cannot steal focus after leaving the anchor route', async ({
  page,
}) => {
  let releaseFonts!: () => void;
  const fontsHeld = new Promise<void>((resolve) => {
    releaseFonts = resolve;
  });
  await page.route('**/*.woff2', async (route) => {
    await fontsHeld;
    await route.continue();
  });
  try {
    await page.goto('/#/period/first-moment', { waitUntil: 'domcontentloaded' });
    await page.locator('#app .home-access a').click();
    const heading = page.getByRole('heading', { name: 'Your answers are not ours to collect.' });
    await expect(heading).toBeFocused();
    releaseFonts();
    await page.evaluate(() => document.fonts.ready);
    await expect(heading).toBeFocused();
    await expect(heading).toBeInViewport();
  } finally {
    releaseFonts();
  }
});

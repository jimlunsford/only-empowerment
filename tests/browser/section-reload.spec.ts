import { expect, test } from '@playwright/test';

for (const [name, hash, id] of [
  ['PERIOD first moment', '#/period/first-moment', '/period/first-moment'],
  ['Rebuild return example', '#/rebuild/complete?section=return-example', 'return-example'],
]) {
  test(`${name} aligns on reload when the stylesheet arrives after the module`, async ({
    page,
  }) => {
    await page.addInitScript((id) => {
      document.addEventListener('focusin', ({ target }) => {
        if (target instanceof HTMLElement && target.id === id) {
          const sheet = document.querySelector<HTMLLinkElement>('link[rel="stylesheet"]');
          target.dataset.stylesAtFirstFocus ??= sheet?.sheet ? 'ready' : 'pending';
        }
      });
    }, id);
    const target = page.locator(`[id="${id}"]`);
    await page.goto('/' + hash);
    await expect(target).toBeFocused();

    const moduleReceived = page.waitForEvent('requestfinished', (request) =>
      /\/assets\/[^/]+\.js$/.test(request.url()),
    );
    await page.route('**/assets/*.css', async (route) => {
      await moduleReceived;
      // Simulate a slow stylesheet. All acceptance checks below use browser state.
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.continue();
    });
    await page.reload();
    await expect(page).toHaveURL((url) => url.hash === hash);
    await expect(target).toBeFocused();
    await expect(target).toHaveAttribute('data-styles-at-first-focus', 'ready');
    const top = await target.evaluate(async (element) => {
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
      return element.getBoundingClientRect().top;
    });
    if (id === 'return-example') expect(Math.abs(top)).toBeLessThanOrEqual(2);
    else {
      expect(top).toBeGreaterThanOrEqual(0);
      expect(top).toBeLessThan(50);
    }
  });
}

test('a native reading link chosen during reload survives enhancement and history', async ({
  page,
}) => {
  const first = '/period/first-moment';
  const why = '/period/why';
  await page.goto('/#' + first);
  await expect(page.locator(`[id="${first}"]`)).toBeFocused();

  const css = Promise.withResolvers<void>();
  const requested = page.waitForRequest(/\/assets\/[^/]+\.css$/);
  await page.route('**/assets/*.css', async (route) => {
    await css.promise;
    await route.continue();
  });
  try {
    await page.reload({ waitUntil: 'commit' });
    await requested;
    // Keep the early native navigation test independent of header disclosure layout.
    const link = page
      .locator('#educational-fallback .lesson-practice a[href="#why-period"]')
      .first();
    await link.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL((url) => url.hash === '#why-period', { waitUntil: 'commit' });
  } finally {
    css.resolve();
  }

  async function atSection(id: string) {
    const target = page.locator(`#app [id="${id}"]`);
    await expect(target).toBeFocused();
    const positions = await target.evaluate(async (element) => {
      await document.fonts.ready;
      const samples: number[] = [];
      for (let frame = 0; frame < 4; frame++) {
        await new Promise(requestAnimationFrame);
        samples.push(element.getBoundingClientRect().top);
      }
      return samples;
    });
    expect(Math.min(...positions)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...positions)).toBeLessThan(50);
  }

  await atSection(why);
  await page.goBack();
  await expect(page).toHaveURL((url) => url.hash === '#' + first);
  await atSection(first);
  await page.goForward();
  await expect(page).toHaveURL((url) => url.hash === '#why-period');
  await atSection(why);
});

test('Forward into a section before its fonts settle keeps its intended focus and position', async ({
  page,
}) => {
  const first = '#/period/first-moment';
  const why = '#/period/why';
  await page.goto('/' + first);
  await expect(page.locator('[id="/period/first-moment"]')).toBeFocused();
  const fonts = Promise.withResolvers<void>();
  const requested = page.waitForRequest(/\.woff2$/);
  await page.route('**/*.woff2', async (route) => {
    await fonts.promise;
    await route.continue();
  });
  try {
    await page.reload({ waitUntil: 'commit' });
    await requested;
    // Fonts are deliberately held here, so use native keyboard activation without
    // a pointer action that waits for layout to settle.
    const summary = page.locator('#app .site-menu summary');
    if (await summary.isVisible()) {
      await summary.focus();
      await page.keyboard.press('Enter');
    }
    const link = page.locator(`#app a[href="${why}"]:visible`).first();
    await link.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL((url) => url.hash === why, { waitUntil: 'commit' });
    await page.goBack({ waitUntil: 'commit' });
    await page.waitForURL((url) => url.hash === first, { waitUntil: 'commit' });
    await page.goForward({ waitUntil: 'commit' });
    await page.waitForURL((url) => url.hash === why, { waitUntil: 'commit' });
  } finally {
    fonts.resolve();
  }
  const target = page.locator('[id="/period/why"]');
  await expect(target).toBeFocused();
  const top = await target.evaluate(async (element) => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    return element.getBoundingClientRect().top;
  });
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(50);
});

test('an explicit homepage reading position survives the initial font swap', async ({ page }) => {
  const fonts = Promise.withResolvers<void>();
  const requested = page.waitForRequest(/\.woff2$/);
  await page.route('**/*.woff2', async (route) => {
    await fonts.promise;
    await route.continue();
  });
  try {
    await page.goto('/#/period', { waitUntil: 'commit' });
    await expect(page.locator('#app .homepage')).toBeVisible();
    await requested;
    await page.evaluate(() => scrollTo(0, 500));
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(500);
  } finally {
    fonts.resolve();
  }
  const finalY = await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return scrollY;
  });
  expect(finalY).toBe(500);
});

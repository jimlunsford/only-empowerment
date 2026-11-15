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

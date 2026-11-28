import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { periodCard } from './helpers/period-card';

const stations = ['line', 'structure', 'return', 'trust', 'negotiation', 'help'];
const edges = [
  ...stations.flatMap((station) => [
    [station, 'complete', station + '-example'],
    ['complete', station, 'example'],
    [station, 'index', 'order'],
  ]),
  ['index', 'complete', 'order-links'],
  ['end', 'index', 'destinations'],
];

async function atSection(page: Page, href: string, id: string) {
  await expect(page).toHaveURL((url) => url.hash === href);
  const target = page.locator('.rebuild-guide #' + id);
  await expect(target).toBeFocused();
  await expect
    .poll(() =>
      target.evaluate((element) => {
        // The bottom of a short page may prevent alignment at the viewport's top edge.
        const top = element.getBoundingClientRect().top;
        return (
          Math.abs(top) <= 2 ||
          (top >= 0 &&
            top < innerHeight &&
            scrollY + innerHeight >= document.documentElement.scrollHeight - 2)
        );
      }),
    )
    .toBe(true);
}

for (const [origin, destination, id] of edges) {
  test(`authored link from ${origin} to ${destination} at ${id}`, async ({
    page,
    context,
    baseURL,
  }) => {
    const from = '#/rebuild/' + origin;
    const to = '#/rebuild/' + destination + '?section=' + id;
    await page.goto('/' + from);
    const link = page.locator(`.rebuild-guide a[href="${to}"]`);
    await expect(link).toHaveCount(1);
    await link.focus();
    await link.scrollIntoViewIfNeeded();
    const originY = await page.evaluate(() => scrollY);
    await link.click();
    await atSection(page, to, id);
    await page.goBack();
    await expect(page).toHaveURL((url) => url.hash === from);
    await expect(link).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(originY, -1);
    await page.goForward();
    await atSection(page, to, id);
    await page.goBack();
    await link.press('Enter');
    await atSection(page, to, id);
    await page.reload();
    await atSection(page, to, id);
    await page.goBack();
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    await page.goForward();
    await atSection(page, to, id);
    const fresh = await context.newPage();
    await fresh.goto(baseURL + '/' + to);
    await atSection(fresh, to, id);
    await fresh.close();
  });
}

test('authored sections support a modified click and whole-edition entry starts at the top', async ({
  page,
  context,
}) => {
  await page.goto('/#/rebuild/help');
  const link = page.getByRole('link', { name: 'See every alternative together' });
  const opened = context.waitForEvent('page');
  await link.click({ modifiers: ['ControlOrMeta'] });
  const other = await opened;
  await atSection(other, '#/rebuild/complete?section=help-example', 'help-example');
  await expect(page).toHaveURL(/#\/rebuild\/help$/);
  await other.close();
  await page.getByRole('link', { name: 'Read or print all teaching' }).click();
  await expect(page).toHaveURL(/#\/rebuild\/complete$/);
  await expect(page.locator('h1')).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('Draw the line presents exactly one visually and programmatically current phrase', async ({
  page,
}) => {
  const url = '#/rebuild/line';
  await page.goto('/' + url);
  async function selection(n: number, initial = false) {
    await expect(page.locator('.quotesheet [aria-current="true"]')).toHaveCount(1);
    await expect(page.locator('.quotesheet .q' + n)).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('.linkedpanel:visible')).toHaveCount(1);
    await expect(page.locator('#note-' + n)).toBeVisible();
    expect(
      await page
        .locator('.quotesheet a')
        .evaluateAll((links) =>
          links
            .filter((a) => getComputedStyle(a).boxShadow !== 'none')
            .map((a) => a.getAttribute('href')),
        ),
    ).toEqual(['#/rebuild/line?section=note-' + n]);
    await expect(page).toHaveURL(
      (x) => x.hash === (initial ? url : '#/rebuild/line?section=note-' + n),
    );
  }
  await selection(1, true);
  for (const method of ['click', 'keyboard'])
    for (const n of [1, 2, 3, 4]) {
      const choice = page.locator('.quotesheet .q' + n);
      if (method === 'click') await choice.click();
      else {
        await choice.focus();
        await choice.press('Enter');
      }
      await selection(n);
      await expect(page.locator('#note-' + n)).toBeFocused();
    }
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.flatprint .flatstate:visible')).toHaveCount(4);
});

test('Ownership and unavailable-value returns open the Why PERIOD explanation', async ({
  page,
}) => {
  for (const origin of ['ownership', 'missing'])
    for (const method of ['click', 'keyboard']) {
      await page.goto('/#/period/values/' + origin);
      const link = page.getByRole('link', { name: 'Return to Why PERIOD?', exact: true });
      await expect(link).toHaveAttribute('href', '#/period/why');
      if (method === 'click') await link.click();
      else {
        await link.focus();
        await link.press('Enter');
      }
      const why = page.getByRole('region', { name: 'Why PERIOD?' });
      await expect(why).toBeFocused();
      await expect(why.getByRole('heading', { name: 'Why PERIOD?' })).toBeInViewport();
      await page.goBack();
      await expect(page).toHaveURL((url) => url.hash === '#/period/values/' + origin);
      await expect(link).toBeVisible();
    }
});

test('the visible wordmark matches the keyboard-operable home link name', async ({ page }) => {
  for (const route of ['/', '/period/values/ownership', '/rebuild/line']) {
    await page.goto('/#' + route);
    const mark = page.getByRole('link', { name: 'Only Empowerment home', exact: true });
    await expect(mark).toHaveAttribute('href', '#/');
    const results = await new AxeBuilder({ page })
      .include('.wordmark')
      .withRules(['label-content-name-mismatch'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(results.passes.some((r) => r.id === 'label-content-name-mismatch')).toBe(true);
    await page.keyboard.press('Tab');
    await mark.focus();
    await expect(mark).toBeFocused();
    expect(await mark.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
    await mark.press('Enter');
    await expect(page).toHaveURL((url) => url.hash === '#/');
  }
});

test('print credits follow the reading, including script loss and the optional card', async ({
  page,
  browser,
  baseURL,
}) => {
  const period = 'An educational companion to The PERIOD Code by Jim Lunsford.';
  const rebuild = 'An educational companion to How to Rebuild Yourself by Jim Lunsford.';
  const combined =
    'An educational companion to The PERIOD Code, How to Rebuild Yourself, The Discipline Loop and Pure Execution Mode by Jim Lunsford.';
  await page.emulateMedia({ media: 'print' });
  for (const [route, credit] of [
    ['/period/values/ownership', period],
    ['/rebuild/complete', rebuild],
  ]) {
    await page.goto('/#' + route);
    const notices = page.locator('#app .footer-print-urls');
    await expect(notices.locator('p').first()).toContainText(credit);
    await expect(notices.locator('p').first().getByRole('link')).toHaveCount(
      credit === period ? 1 : 0,
    );
    await expect(notices).toContainText('AGPL-3.0-or-later');
  }
  await page.emulateMedia({ media: 'screen' });
  await periodCard(page, 'I will send the fictional progress update.');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.footer-print-urls')).toContainText(period);
  for (const mode of ['disabled', 'blocked']) {
    const ctx = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode === 'blocked') await ctx.route('**/*.js', (route) => route.abort());
    const p = await ctx.newPage();
    await p.goto(baseURL + '/#line');
    await p.emulateMedia({ media: 'print' });
    await expect(p.locator('#rebuild-reading #line .flatstate:visible')).toHaveCount(4);
    await expect(p.locator('.footer-print-urls p:visible').first()).toHaveText(rebuild);
    await expect(p.locator('.homepage')).toBeHidden();
    await p.goto(baseURL + '/');
    await expect(p.locator('.homepage')).toBeVisible();
    await expect(p.locator('#rebuild-reading #line .flatstate:visible')).toHaveCount(4);
    await expect(p.locator('.footer-print-urls p:visible').first()).toHaveText(combined);
    await ctx.close();
  }
});

test('Standard Card separates the next teaching heading at wide and narrow widths', async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/period/standard');
    await expect(page.locator('#period-standard')).toBeVisible();
    const disclosure = page.locator('.mobile-teaching:not([open])');
    if (await disclosure.isVisible()) await disclosure.locator('summary').click();
    const heading = page.getByRole('heading', { name: 'One behavior. The whole Code.' });
    expect(
      await heading.evaluate((e) =>
        Math.round(
          e.getBoundingClientRect().top - e.previousElementSibling!.getBoundingClientRect().bottom,
        ),
      ),
    ).toBe(width >= 768 ? 16 : 12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { frameworkChoices, frameworkAuthor } from '../../src/framework-navigation';
import { homepage } from '../../src/period-homepage-content';

for (const javaScriptEnabled of [true, false]) {
  test.describe(javaScriptEnabled ? 'interactive Batch 2' : 'script-free Batch 2', () => {
    test.use({ javaScriptEnabled });
    test('orientation gives four immediate working destinations and an author introduction', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      const chooser = page.getByRole('navigation', { name: 'Start here if' });
      await expect(chooser.getByRole('link')).toHaveCount(4);
      for (const author of frameworkAuthor)
        await expect(page.locator('.framework-author')).toContainText(author);
      expect((await chooser.getByRole('link').first().boundingBox())!.y).toBeLessThan(600);
      for (const item of frameworkChoices) {
        const link = chooser.getByRole('link', { name: item.situation + ' ' + item.title });
        await expect(link).toHaveAttribute(
          'href',
          javaScriptEnabled ? '#/' + item.id : item.reading,
        );
      }
      await chooser.getByRole('link').nth(1).click();
      await expect(page).toHaveURL(javaScriptEnabled ? /#\/rebuild$/ : /\/read\/rebuild.html$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
    test('phone headers fit, menu works by keyboard, and desktop links remain exposed', async ({
      page,
    }) => {
      const routes = javaScriptEnabled
        ? ['/#/', '/#/period', '/#/rebuild', '/#/loop', '/#/execution']
        : [
            '/',
            '/read/index.html',
            '/read/rebuild.html',
            '/read/loop.html',
            '/read/execution.html',
          ];
      for (const route of routes) {
        for (const width of [320, 390, 768]) {
          await page.setViewportSize({ width, height: 844 });
          await page.goto(route);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
          const header = page.locator('.site-header');
          expect((await header.boundingBox())!.height).toBeLessThanOrEqual(120);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          const menu = header.locator('summary');
          await menu.focus();
          await expect(menu).toBeFocused();
          expect(await menu.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
          await page.keyboard.press('Enter');
          await expect(header.locator('details')).toHaveAttribute('open', '');
          await page.keyboard.press('Tab');
          await expect(header.getByRole('link').nth(1)).toBeFocused();
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          if (javaScriptEnabled) {
            await page.keyboard.press('Escape');
            await expect(menu).toBeFocused();
            await expect(header.locator('details')).not.toHaveAttribute('open');
          } else {
            await menu.focus();
            await page.keyboard.press('Space');
            await expect(header.locator('details')).not.toHaveAttribute('open');
          }
        }
        await page.setViewportSize({ width: 1024, height: 900 });
        await expect(page.locator('.site-header summary')).not.toBeVisible();
        await expect(page.locator('.site-header').getByRole('link').nth(1)).toBeVisible();
        // Native disclosure must not hide desktop navigation from the accessibility tree.
        expect(await page.locator('.site-header').getByRole('navigation').count()).toBeGreaterThan(
          0,
        );
      }
    });
    test('closing bridges, footer and reading index provide all four frameworks', async ({
      page,
    }) => {
      for (const current of ['period', 'rebuild', 'loop']) {
        const route = javaScriptEnabled
          ? {
              period: '/#/period/values/empowerment',
              rebuild: '/#/rebuild/end',
              loop: '/#/loop?section=source',
            }[current]!
          : {
              period: '/read/empowerment.html',
              rebuild: '/read/rebuild.html',
              loop: '/read/loop.html#source',
            }[current]!;
        await page.goto(route);
        const bridge = page.locator('main').getByRole('region', { name: 'Where to go next' });
        await expect(bridge).toHaveCount(1);
        for (const item of frameworkChoices.filter((item) => item.id !== current)) {
          await expect(bridge.getByRole('link', { name: item.title, exact: true })).toHaveAttribute(
            'href',
            javaScriptEnabled ? '#/' + item.id : item.reading,
          );
        }
        await expect(
          page.getByRole('contentinfo').getByRole('link', { name: 'All reading editions' }),
        ).toHaveAttribute('href', '/read/index.html');
        await expect(
          page
            .getByRole('contentinfo')
            .getByRole('link', { name: 'About The PERIOD Code book', exact: true }),
        ).toHaveCount(1);
      }
      await page.goto('/read/index.html');
      if ((await page.viewportSize())!.width <= 768)
        await page.locator('.site-header summary').click();
      for (const item of frameworkChoices) {
        await expect(
          page.locator('.site-header').getByRole('link', { name: item.title, exact: true }),
        ).toHaveAttribute('href', item.reading);
        await expect(
          page.getByRole('contentinfo').getByRole('link', { name: item.title, exact: true }),
        ).toHaveAttribute('href', item.reading);
      }
      if (javaScriptEnabled)
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
    });
  });
}

test('PERIOD identity and acronym match root reading; Rebuild reading preserves the open app', async ({
  page,
  context,
}) => {
  await page.goto('/#/period');
  await expect(page.locator('main')).toContainText(homepage.lead);
  await expect(page.locator('main')).toContainText(homepage.acronym);
  const copy = await page.locator('main').innerText();
  expect(copy.indexOf(homepage.acronym)).toBeLessThan(copy.indexOf(homepage.order));
  await page.goto('/#/rebuild');
  const popupPromise = page.waitForEvent('popup');
  await page.locator('main a[href="/read/rebuild.html"]').click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(/\/read\/rebuild.html$/);
  expect(await popup.evaluate(() => window.opener)).toBe(null);
  await expect(page).toHaveURL(/#\/rebuild$/);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
});

test('menu route activation closes the disclosure and preserves heading focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.site-header details');
  await menu.locator('summary').click();
  await menu.getByRole('link', { name: 'The PERIOD Code', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/period$/);
  await expect(menu).not.toHaveAttribute('open');
  await expect(page.locator('h1')).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/#/', '/#/period', '/#/rebuild', '/#/loop', '/#/execution'];
const fit = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

test('shared visual system fits desktop, tablet and phones with compact headers and keyboard focus', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      await fit(page);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      if (width <= 768) {
        expect((await page.locator('.site-header').boundingBox())!.height).toBeLessThanOrEqual(74);
        const menu = page.locator('.site-header summary');
        await page.keyboard.press('Tab');
        await menu.focus();
        await expect(menu).toBeFocused();
        expect(await menu.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
      }
      if (route !== '/#/' || width === 1440) {
        const title = page.getByRole('heading', { level: 1 });
        expect(await title.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
          width === 1440 ? '72px' : '40px',
        );
      }
      if (info.project.name === 'chromium') {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath(`${route.split('/').pop() || 'home'}-${width}.png`),
        });
      }
    }
  }
});

test('Loop sections use the editorial columns on desktop and preserve DOM reading order on phones', async ({
  page,
}) => {
  for (const route of ['/#/loop', '/read/loop.html']) {
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const sections = page.locator('.loop-section');
      for (const section of await sections.all()) {
        const heading = (await section.locator(':scope > :first-child').boundingBox())!;
        const prose = (await section.locator(':scope > :nth-child(2)').boundingBox())!;
        if (width === 1440) {
          expect(prose.x).toBeGreaterThan(heading.x + heading.width);
          expect(prose.y).toBeCloseTo(heading.y, 0);
          expect((await section.boundingBox())!.width).toBeGreaterThan(1100);
        } else {
          expect(prose.y).toBeGreaterThanOrEqual(heading.y + heading.height);
        }
      }
      await fit(page);
    }
  }
});

test('shared surfaces and compact two-line workshop actions retain accessible names and contrast', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, surface] of [
    ['/#/', '.framework-options article'],
    ['/#/period', '.home-standard'],
    ['/#/loop', '.loop-cycle'],
    ['/#/execution', '.workshop-facts'],
  ]) {
    await page.goto(route);
    const panel = page.locator(surface).first();
    expect(await panel.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      route === '/#/loop' ? 'rgb(23, 60, 52)' : 'rgb(229, 235, 226)',
    );
    expect(await panel.evaluate((el) => getComputedStyle(el).borderLeftWidth)).toBe('1px');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
  await expect(
    page.locator('.workshop-navigation').getByRole('link', { name: 'All frameworks', exact: true }),
  ).toBeVisible();
  await page.locator('.workshop-continue').click();
  const actions = page.locator('.workshop-navigation a');
  for (const action of await actions.all()) {
    expect((await action.boundingBox())!.width).toBeLessThan(400);
    expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(action.locator('span')).toBeVisible();
    const fullLabel = await action.innerText();
    for (const part of fullLabel.split('\n').filter(Boolean))
      await expect(action).toHaveAccessibleName(
        new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      );
  }
  expect(
    await page.locator('.workshop-guide').evaluate((el) => getComputedStyle(el).borderTopWidth),
  ).toBe('1px');
  await page.goto('/#/rebuild');
  expect(await page.locator('.plate').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    'rgb(23, 60, 52)',
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

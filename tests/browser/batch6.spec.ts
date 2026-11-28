import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { frameworkAuthor, frameworkChoices } from '../../src/framework-navigation';

const fit = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
const bounds = async (page: Page, selector: string) =>
  (await page.locator(selector).boundingBox())!;

test('editorial covers share balanced desktop columns and stack in reading order on phones and tablets', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [route, left, right] of [
      ['', '.framework-home-copy', '.framework-chooser'],
      ['loop', '.loop-hero > div', '.loop-hero > .loop-cycle'],
      ['execution', '.workshop-heading', '.workshop-guide'],
      ['rebuild', '.covertext', '.plate'],
    ]) {
      await page.goto('/#/' + route);
      await page.evaluate(() => document.fonts.ready);
      const copy = await bounds(page, left);
      const panel = await bounds(page, right);
      if (width > 768) {
        expect(panel.x).toBeGreaterThan(copy.x + copy.width);
        expect(panel.width).toBeCloseTo(copy.width, 0);
        expect(panel.y).toBeCloseTo(copy.y, 0);
      } else {
        expect(panel.y).toBeGreaterThanOrEqual(copy.y + copy.height);
        expect((await bounds(page, '.site-header')).height).toBeLessThanOrEqual(74);
      }
      await fit(page);
      if (info.project.name === 'chromium' && route !== 'rebuild') {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: info.outputPath(`${route || 'home'}-${width}.png`) });
      }
    }
  }
});

test('homepage retains the situation links and author, ruled editorial orientation and aligned card actions', async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    for (const line of frameworkAuthor)
      await expect(page.locator('.framework-home-copy')).toContainText(line);
    const chooser = page.getByRole('navigation', { name: 'Start here if' });
    for (const item of frameworkChoices)
      await expect(
        chooser.getByRole('link', { name: item.situation + ' ' + item.title }),
      ).toHaveAttribute('href', '#/' + item.id);
    const heading = await bounds(page, '.framework-orientation h2');
    const prose = await bounds(page, '.framework-orientation > div');
    if (width > 768) {
      expect(prose.x).toBeGreaterThan(heading.x + heading.width);
      expect(prose.y).toBeCloseTo(heading.y, 0);
      const links = await page.locator('.framework-options article > a').all();
      for (const pair of [
        [0, 1],
        [2, 3],
      ]) {
        const first = (await links[pair[0]].boundingBox())!;
        const second = (await links[pair[1]].boundingBox())!;
        expect(first.y + first.height).toBeCloseTo(second.y + second.height, 0);
      }
    } else expect(prose.y).toBeGreaterThanOrEqual(heading.y + heading.height);
    for (const selector of ['.framework-orientation', '.framework-options'])
      expect(
        await page.locator(selector).evaluate((el) => getComputedStyle(el).borderTopWidth),
      ).toBe('1px');
    await fit(page);
  }
});

test('forest anchors keep contrast, visible keyboard focus and section-jump dividers', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [route, panel] of [
      ['/', '.framework-chooser'],
      ['/#/loop', '.loop-hero .loop-cycle'],
    ]) {
      await page.goto(route);
      const anchor = page.locator(panel);
      expect(await anchor.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
        'rgb(23, 60, 52)',
      );
      expect(await anchor.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(247, 243, 235)');
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press('Tab');
      const link = anchor.getByRole('link').first();
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate((el) => getComputedStyle(el).outlineColor)).toBe(
        'rgb(247, 243, 235)',
      );
      await page.emulateMedia({ forcedColors: 'active' });
      expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
      await page.emulateMedia({ forcedColors: 'none' });
    }
    expect(
      await page
        .locator('.loop-section-nav')
        .evaluate((el) => [
          getComputedStyle(el).borderTopWidth,
          getComputedStyle(el).borderBottomWidth,
        ]),
    ).toEqual(['1px', '1px']);
  }
});

test('Execution keeps its landing reading link and compact inner navigation controls', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#/execution');
    await page.evaluate(() => document.fonts.ready);
    const bar = page.locator('.workshop-local-nav');
    await expect(bar).toHaveCount(0);
    await expect(page.locator('.workshop-guide')).toContainText(
      'Complete reading and print edition (new tab)',
    );
    for (const link of await page.locator('.workshop-navigation a').all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect((await link.boundingBox())!.height).toBeLessThanOrEqual(52);
    }
    await expect(page.locator('.workshop-navigation .workshop-continue')).toHaveAccessibleName(
      'Continue Why & The Bargain',
    );
    await expect(
      page
        .locator('.workshop-navigation')
        .getByRole('link', { name: 'All frameworks', exact: true }),
    ).toHaveAttribute('href', '#/');
    await page.keyboard.press('Tab');
    await page.locator('.workshop-navigation .workshop-continue').focus();
    expect(
      await page
        .locator('.workshop-navigation .workshop-continue')
        .evaluate((el) => getComputedStyle(el).outlineStyle),
    ).toBe('solid');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await expect(bar).toContainText('Pure Execution Mode · Guided workshop');
    if (width === 1440) expect((await bar.boundingBox())!.height).toBeLessThanOrEqual(62);
    await expect(page.locator('.workshop-position')).toContainText('Foundation · Before Stage 1');
    await expect(page.locator('.workshop-navigation a').first()).toHaveAccessibleName(
      'Back Pure Execution Mode',
    );
    await fit(page);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

test('editorial layout tolerates enlarged text and keeps print presentation independent', async ({
  page,
}) => {
  for (const route of ['/', '/#/loop', '/#/execution']) {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.goto(route);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await fit(page);
    await page.emulateMedia({ media: 'print' });
    if (route === '/') await expect(page.locator('.framework-hub')).toBeVisible();
    if (route === '/#/loop') {
      await expect(page.locator('.loop-hero .loop-cycle')).toBeHidden();
      expect(
        await page
          .locator('.loop-section')
          .first()
          .evaluate((el) => getComputedStyle(el).display),
      ).toBe('block');
    }
    if (route === '/#/execution') {
      await expect(page.locator('.workshop')).toBeHidden();
      await expect(page.locator('.execution-print')).toBeVisible();
    }
    await page.emulateMedia({ media: 'screen' });
  }
});

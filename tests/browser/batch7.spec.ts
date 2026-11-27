import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/#/period', '/#/rebuild', '/#/loop', '/#/execution'];
const obsolete =
  /development review|development concept|staging review|local preview|not a published book|founding learning experiences/i;

test('five landing pages share the opening rhythm and preserve mobile header, focus and overflow', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const offsets: number[] = [];
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const heading = page.getByRole('heading', { level: 1 });
      const header = (await page.locator('.site-header').boundingBox())!;
      offsets.push((await heading.boundingBox())!.y - header.y - header.height);
      await expect(page.locator('body')).not.toContainText(obsolete);
      await expect(
        page.locator('.workshop-local-nav, .rebuild-approval, .period-local-navigation'),
      ).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width <= 768) expect(header.height).toBeLessThanOrEqual(74);
      await page.keyboard.press('Tab');
      await heading.focus();
      await expect(heading).toBeFocused();
      expect(await heading.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
      if (info.project.name === 'chromium') {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath(`${route.split('/').pop() || 'home'}-${width}.png`),
        });
      }
    }
    expect(
      Math.max(...offsets) - Math.min(...offsets),
      JSON.stringify({ width, offsets }),
    ).toBeLessThanOrEqual(1);
  }
});

test('Execution cover has working actions, forest roadmap and a separate asymmetric body', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/#/execution');
    const hero = page.locator('.workshop-hero');
    const guide = hero.locator('.workshop-guide');
    const body = page.locator('.workshop-layout');
    expect(await guide.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      'rgb(23, 60, 52)',
    );
    expect(await guide.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(247, 243, 235)');
    expect(await hero.evaluate((el) => getComputedStyle(el).borderBottomWidth)).toBe('1px');
    expect((await body.boundingBox())!.y).toBeGreaterThanOrEqual(
      (await hero.boundingBox())!.y + (await hero.boundingBox())!.height,
    );
    const facts = (await body.locator('.workshop-facts').boundingBox())!;
    const prose = (await body.locator('.workshop-main').boundingBox())!;
    if (width > 768) {
      expect(prose.x).toBeGreaterThan(facts.x + facts.width);
      expect(prose.width).toBeGreaterThan(facts.width);
      expect(prose.y).toBeCloseTo(facts.y, 0);
    } else expect(prose.y).toBeGreaterThanOrEqual(facts.y + facts.height);
    await expect(
      guide.getByRole('link', { name: 'Complete reading and print edition (new tab)' }),
    ).toHaveAttribute('href', '/read/execution.html');
    await expect(
      page.locator('.workshop-navigation').getByRole('link', { name: /^Continue/ }),
    ).toHaveAttribute('href', '#/execution/identify');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press('Tab');
    const start = hero.getByRole('link', { name: 'Continue: Identify the Next Move', exact: true });
    await start.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await expect(page.locator('.workshop-local-nav')).toBeVisible();
    await expect(page.locator('.workshop-guide')).toBeVisible();
  }
});

test('chooser arrows keep accessible names and Loop next links align with source prose', async ({
  page,
}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const arrows = page.locator('.framework-chooser-arrow');
    await expect(arrows).toHaveCount(4);
    for (const arrow of await arrows.all()) {
      await expect(arrow).toHaveAttribute('aria-hidden', 'true');
      await expect(arrow).toHaveText('→');
      const parent = (await arrow.locator('..').boundingBox())!;
      const box = (await arrow.boundingBox())!;
      expect(box.x + box.width).toBeCloseTo(parent.x + parent.width, 0);
    }
    for (const route of ['/#/loop', '/read/loop.html']) {
      await page.goto(route);
      const section = page
        .locator('.loop-section')
        .filter({ has: page.getByRole('heading', { name: 'About the source', exact: true }) });
      const paragraph = (await section.locator(':scope > p').first().boundingBox())!;
      const next = (await section.locator('.framework-bridges').boundingBox())!;
      expect(next.x).toBeCloseTo(paragraph.x, 0);
      expect((await section.locator('.framework-bridges h2').boundingBox())!.x).toBeCloseTo(
        paragraph.x,
        0,
      );
    }
  }
});

test('readings omit obsolete notices while preserving privacy disclosures and print content', async ({
  page,
}) => {
  for (const route of [
    '/read/index.html',
    '/read/rebuild.html',
    '/read/loop.html',
    '/read/execution.html',
    '/read/privacy.html',
    '/#/privacy',
  ]) {
    await page.goto(route);
    await expect(page.locator('body')).not.toContainText(obsolete);
    if (route.includes('privacy')) {
      await expect(page.locator('body')).toContainText(
        'No accounts. No tracking is enabled in this build.',
      );
      await expect(page.locator('body')).toContainText('14 rotated logs');
    }
  }
  await page.goto('/#/execution');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.workshop')).toBeHidden();
  await expect(page.locator('.execution-print')).toBeVisible();
});

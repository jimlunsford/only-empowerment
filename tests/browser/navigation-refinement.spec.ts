import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { founderCopyright } from '../../src/site-footer-content';

const values = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
const labels = [
  'Continue to Purpose',
  'Continue to Resilience',
  'Continue to Integrity',
  'Continue to Discipline',
  'Continue to Empowerment',
  'Review all six values',
];
const targets = [...values.slice(1).map((v) => '#/period/values/' + v), '#/period/teaching-order'];
for (const [index, value] of values.entries()) {
  test(`${value} lesson transition supports direct entry, keyboard, Back, Forward and reload`, async ({
    page,
  }, info) => {
    await page.goto('/#/period/values/' + value);
    const navigation = page.getByRole('navigation', { name: 'Lesson progression' });
    const link = navigation.getByRole('link', { name: labels[index], exact: true });
    await expect(link).toHaveText(labels[index]);
    await expect(link).toHaveAttribute('href', targets[index]);
    expect(await navigation.evaluate((el) => el.parentElement?.lastElementChild === el)).toBe(true);
    await expect(page.locator('.value-lesson .lesson-transition')).toHaveCount(1);
    await expect(page.locator('main > .lesson-progression')).toHaveCount(0);
    expect(
      await navigation.evaluate((el) => {
        const section = el.closest('.lesson-transition')!;
        const sections = [...section.parentElement!.children].filter(
          (child) => child.tagName === 'SECTION',
        );
        return sections.indexOf(section) >= sections.length - 2;
      }),
    ).toBe(true);
    await link.scrollIntoViewIfNeeded();
    await link.focus();
    const y = await page.evaluate(() => scrollY);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp(targets[index].replace('#', '#') + '$'));
    const destination =
      index === 5 ? page.locator('[id="/period/teaching-order"]') : page.locator('h1');
    await expect(destination).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp('#/period/values/' + value + '$'));
    await expect
      .poll(() => page.evaluate((position) => Math.abs(scrollY - position), y))
      .toBeLessThanOrEqual(1);
    expect(await page.locator('main').evaluate((el) => el.contains(document.activeElement))).toBe(
      true,
    );
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(targets[index] + '$'));
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
    if (index === 5) await expect(destination).toBeFocused();
    else
      await expect(page.locator('h1')).toContainText(
        values[index + 1][0].toUpperCase() + values[index + 1].slice(1),
      );
    await writeFile(
      info.outputPath(`${value}-progression.json`),
      JSON.stringify(
        {
          value,
          label: labels[index],
          target: targets[index],
          directEntry: true,
          keyboard: true,
          focus: true,
          history: true,
          reload: true,
          atLessonEnd: true,
        },
        null,
        2,
      ),
    );
  });
}

for (const width of [1440, 390, 320])
  test(`all six end actions and footer remain clear at ${width}px`, async ({ page }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 1000 });
    for (const value of values) {
      await page.goto('/#/period/values/' + value);
      await page.evaluate(() => document.fonts.ready);
      await expect(
        page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link'),
      ).toHaveText(['Why PERIOD?', 'Explore the values']);
      await expect(
        page.getByRole('navigation', { name: 'Your practice' }).getByRole('link'),
      ).toHaveAttribute('href', '#/period/standard');
      await expect(page.locator('.founder-copyright')).toHaveText(founderCopyright);
      await expect(
        page.locator('.period-review-notice, .footer-meta, .footer-software, .footer-education'),
      ).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const next = page
        .getByRole('navigation', { name: 'Lesson progression' })
        .locator('.transition-next');
      await next.scrollIntoViewIfNeeded();
      const box = (await next.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.height).toBeGreaterThanOrEqual(44);
      if (info.project.name === 'chromium')
        await page.screenshot({ path: info.outputPath(`work30-${value}-${width}-ending.png`) });
    }
  });

test('footer card entry preserves context, existing drafts and guarded book exits', async ({
  page,
}) => {
  const card = page.getByRole('navigation', { name: 'Your practice' }).getByRole('link');
  for (const value of values) {
    await page.goto('/#/period/values/' + value);
    await page.reload();
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('h1')).toBeFocused();
    // The preserved handler leaves the Ownership lesson unselected; its practice routes preselect Ownership.
    await expect(page.locator('#period-valueId')).toHaveValue(value === 'ownership' ? '' : value);
  }
  await page.goto('/#/period/practice');
  await page.reload();
  await card.press('Enter');
  await expect(page.locator('#period-valueId')).toHaveValue('ownership');
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill('SYNTHETIC WORK30: Preserve my exact draft.');
  for (const value of values) {
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Explore the values' })
      .click();
    await page
      .getByRole('navigation', { name: 'PERIOD teaching order' })
      .getByRole('link', { name: value[0].toUpperCase() + value.slice(1), exact: true })
      .click();
    await card.click();
    await expect(page.locator('#period-valueId')).toHaveValue('integrity');
    await expect(page.locator('#period-standard')).toHaveValue(
      'SYNTHETIC WORK30: Preserve my exact draft.',
    );
  }
  await page.getByRole('contentinfo').getByRole('link', { name: 'About the book' }).click();
  await page.locator('main a[href="https://jimlunsford.com/period-code/"]').click();
  await expect(page.getByRole('dialog')).toContainText('Your card is only in this tab');
  await page.getByRole('button', { name: 'Stay here' }).click();
  await card.click();
  await expect(page.locator('#period-standard')).toHaveValue(
    'SYNTHETIC WORK30: Preserve my exact draft.',
  );
});

test('end navigation and footer retain focus, contrast, enlarged text and accessibility', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const value of values) {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/#/period/values/' + value);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.emulateMedia({ forcedColors: 'active' });
    for (const link of [
      page.getByRole('navigation', { name: 'Lesson progression' }).locator('.transition-next'),
      page.getByRole('navigation', { name: 'Your practice' }).getByRole('link'),
    ]) {
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    }
    await page.emulateMedia({ forcedColors: 'none' });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

test('every script-free footer leads to working license and exact source without JavaScript', async ({
  browser,
  baseURL,
  request,
}, info) => {
  const build = await (await request.get('/build.json')).json();
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const path of ['/', ...values.slice(2).map((v) => '/read/' + v + '.html')]) {
      await page.goto(baseURL + path);
      await expect(page.locator('body')).not.toContainText('Internal review');
      await expect(page.locator('body')).not.toContainText('Not a production release');
      await page
        .getByRole('contentinfo')
        .getByRole('link', { name: 'Privacy & source', exact: true })
        .click();
      await expect(page.locator('h1')).toHaveText('Privacy & source');
      await expect(page.locator('.source-information')).toContainText('No warranty');
      await expect(page.locator('.source-information a[href="/LICENSE.txt"]')).toBeVisible();
      if (!build.dirty)
        await expect(
          page.getByRole('link', { name: 'Corresponding source for this build', exact: true }),
        ).toHaveAttribute('href', build.source);
      expect((await request.get('/LICENSE.txt')).status()).toBe(200);
      expect((await request.get('/SHA256SUMS')).status()).toBe(200);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        build.presentation === 'staging' ? 'noindex, nofollow' : 'index, follow',
      );
      expect((await page.content()).includes("default-src 'none'")).toBe(true);
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`work30-privacy-reading-${width}.png`),
          fullPage: true,
        });
    }
  } finally {
    await context.close();
  }
});

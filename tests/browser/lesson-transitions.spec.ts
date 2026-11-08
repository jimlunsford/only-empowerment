import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { lessonOrder, lessonBridges } from '../../src/period-lesson-transitions';

const name = (value: string) => value[0].toUpperCase() + value.slice(1);
for (const [index, value] of lessonOrder.entries()) {
  test(`${value}: one intact teaching bridge, forward and previous links`, async ({ page }) => {
    await page.goto('/#/period/values/' + value);
    const bridge = page.locator('.value-lesson .lesson-transition');
    await expect(bridge).toHaveCount(1);
    await expect(bridge.locator('h2')).toHaveText(lessonBridges[value].heading);
    for (const text of lessonBridges[value].paragraphs)
      await expect(
        page.locator('.value-lesson article').getByText(text, { exact: true }),
      ).toHaveCount(1);
    const navigation = bridge.getByRole('navigation', { name: 'Lesson progression', exact: true });
    await expect(
      page.getByRole('navigation', { name: 'Lesson progression', exact: true }),
    ).toHaveCount(1);
    const label =
      index === 5 ? 'Review all six values' : 'Continue to ' + name(lessonOrder[index + 1]);
    await expect(page.locator('main').getByRole('link', { name: label, exact: true })).toHaveCount(
      1,
    );
    await navigation.getByRole('link', { name: label, exact: true }).click();
    const target =
      index === 5 ? '#/period/teaching-order' : '#/period/values/' + lessonOrder[index + 1];
    await expect(page).toHaveURL(new RegExp(target + '$'));
    if (index < 5) {
      await expect(page.locator('h1')).toBeFocused();
      await expect
        .poll(() => page.locator('h1').evaluate((el) => el.getBoundingClientRect().top))
        .toBeGreaterThanOrEqual(0);
      expect(
        await page.locator('h1').evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight),
      ).toBe(true);
    }
    await page.goBack();
    await expect(bridge).toBeVisible();
    if (index > 0) {
      const previous = navigation.getByRole('link', {
        name: 'Return to ' + name(lessonOrder[index - 1]),
        exact: true,
      });
      await previous.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp('#/period/values/' + lessonOrder[index - 1] + '$'));
      await expect(page.locator('h1')).toBeFocused();
      await page.goBack();
      await page.goForward();
      await page.reload();
      await expect(page.locator('h1')).toContainText(name(lessonOrder[index - 1]));
    } else await expect(navigation.locator('.transition-previous')).toHaveCount(0);
    if (index === 5) {
      await page.goto('/#/period/values/empowerment');
      await bridge.getByRole('link', { name: 'Return to Ownership', exact: true }).click();
      await expect(page.locator('h1')).toContainText('Ownership');
    }
  });
}

for (const width of [1440, 390, 320]) {
  test(`transition separation, tap targets, keyboard and reflow at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 1000 });
    for (const value of lessonOrder) {
      await page.goto('/#/period/values/' + value);
      await page.evaluate(() => document.fonts.ready);
      const bridge = page.locator('.value-lesson .lesson-transition');
      const next = bridge.locator('.transition-next');
      await next.scrollIntoViewIfNeeded();
      const secondary = bridge.locator('.transition-previous');
      if (await secondary.count()) {
        const first = (await next.boundingBox())!;
        const previous = (await secondary.boundingBox())!;
        expect(previous.y - first.y - first.height).toBeGreaterThanOrEqual(16);
      }
      for (const link of await bridge.getByRole('link').all()) {
        await link.focus();
        await expect(link).toBeFocused();
        expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
        const box = (await link.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (info.project.name === 'chromium') {
        await page.locator('h1').focus();
        await bridge.screenshot({
          path: info.outputPath(`work42-${value}-${width}-transition.png`),
        });
      }
    }
  });
}

for (const mode of ['disabled', 'blocked'] as const) {
  test(`native lesson progression remains usable with JavaScript ${mode}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    try {
      const page = await context.newPage();
      if (mode === 'blocked') await page.route('**/assets/*.js', (route) => route.abort());
      const path = (value: string) =>
        ['ownership', 'purpose'].includes(value)
          ? '/#reading-' + value
          : '/read/' + value + '.html';
      for (const [index, value] of lessonOrder.entries()) {
        await page.goto(baseURL + path(value));
        const bridge = page.locator('.lesson-transition[data-value="' + value + '"]');
        await expect(bridge).toHaveCount(1);
        const label =
          index === 5 ? 'Review all six values' : 'Continue to ' + name(lessonOrder[index + 1]);
        const destination = index === 5 ? '/#teaching-order' : path(lessonOrder[index + 1]);
        await bridge.getByRole('link', { name: label, exact: true }).click();
        await expect(page).toHaveURL(baseURL + destination);
        await expect(
          page.locator(index === 5 ? '#teaching-order' : index < 1 ? '#reading-purpose' : 'h1'),
        ).toBeVisible();
        if (index > 0) {
          await page.goto(baseURL + path(value));
          await bridge
            .getByRole('link', { name: 'Return to ' + name(lessonOrder[index - 1]), exact: true })
            .click();
          await expect(page).toHaveURL(baseURL + path(lessonOrder[index - 1]));
        }
      }
      await page.goto(baseURL + '/read/empowerment.html');
      await page
        .locator('.lesson-transition')
        .getByRole('link', { name: 'Return to Ownership', exact: true })
        .click();
      await expect(page).toHaveURL(baseURL + '/#reading-ownership');
      await expect(page.locator('#reading-ownership')).toBeVisible();
    } finally {
      await context.close();
    }
  });
}

test('a Standard Card draft survives the full transition path and retains its exit guard', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill('SYNTHETIC WORK42: Tell the truth about my part.');
  await page.locator('#period-nextApplication').fill('SYNTHETIC: Correct the next update.');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Explore the values' })
    .click();
  await page
    .getByRole('navigation', { name: 'PERIOD teaching order' })
    .getByRole('link', { name: 'Ownership', exact: true })
    .click();
  for (const value of lessonOrder.slice(1)) {
    await page
      .locator('.lesson-transition')
      .getByRole('link', { name: 'Continue to ' + name(value), exact: true })
      .click();
    await expect(page.locator('h1')).toContainText(name(value));
  }
  await page
    .locator('.lesson-transition')
    .getByRole('link', { name: 'Return to Discipline', exact: true })
    .click();
  await page
    .locator('.lesson-transition')
    .getByRole('link', { name: 'Continue to Empowerment', exact: true })
    .click();
  await page
    .locator('.lesson-transition')
    .getByRole('link', { name: 'Return to Ownership', exact: true })
    .click();
  await page.getByRole('navigation', { name: 'Your practice' }).getByRole('link').click();
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await expect(page.locator('#period-standard')).toHaveValue(
    'SYNTHETIC WORK42: Tell the truth about my part.',
  );
  await expect(page.locator('#period-nextApplication')).toHaveValue(
    'SYNTHETIC: Correct the next update.',
  );
  await page.getByRole('contentinfo').getByRole('link', { name: 'About the book' }).click();
  await page.locator('main a[href="https://jimlunsford.com/period-code/"]').click();
  await expect(page.getByRole('dialog')).toContainText('Your card is only in this tab');
  await page.getByRole('button', { name: 'Stay here' }).click();
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test('transition reading and screen-only actions retain print and accessibility boundaries', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const value of lessonOrder) {
    await page.goto('/#/period/values/' + value);
    const bridge = page.locator('.value-lesson .lesson-transition');
    expect(
      (
        await new AxeBuilder({ page })
          .include('.lesson-transition')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.emulateMedia({ media: 'print' });
    await expect(bridge.getByRole('navigation')).toBeHidden();
    for (const text of lessonBridges[value].paragraphs)
      await expect(page.getByText(text, { exact: true }).filter({ visible: true })).toHaveCount(1);
    await page.emulateMedia({ media: 'screen' });
  }
});

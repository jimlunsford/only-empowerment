import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { periodExercise } from '../../src/period-content';

async function populated(page: Page) {
  await page.goto('/#/period/standard');
  await page.reload();
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill(periodExercise.example.standard);
  await page.locator('#period-nextApplication').fill(periodExercise.example.nextApplication);
  await page.locator('.support summary').click();
  await page.locator('#period-returnPlan').fill(periodExercise.example.returnPlan);
  await page.locator('.support summary').click();
}
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('mobile meaning precedes the action and first input precedes optional teaching', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const meaning = await page.locator('.period-panel').boundingBox();
  const action = await page.getByRole('link', { name: 'Start with Ownership' }).boundingBox();
  expect(meaning!.y + meaning!.height).toBeLessThan(action!.y);
  await page.goto('/#/period/standard');
  await page.evaluate(() => document.fonts.ready);
  const first = await page.locator('#period-valueId').boundingBox();
  expect(first!.y + first!.height).toBeLessThan(900);
  expect((await page.locator('.mobile-teaching').boundingBox())!.y).toBeGreaterThan(first!.y);
  await page.locator('.mobile-teaching summary').click();
  await expect(page.locator('.mobile-teaching')).toContainText(periodExercise.teaching);
  await expect(page.locator('.mobile-teaching')).toContainText(periodExercise.guardrail);
  await expect(page.locator('.mobile-privacy')).toContainText(periodExercise.privacy);
  expect(await fits(page)).toBe(true);
});

test('focus and error remain separately visible on the same invalid input', async ({
  page,
}, info) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-valueId').selectOption('ownership');
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  const field = page.locator('#period-standard');
  await expect(field).toBeFocused();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
  await expect(field).toHaveAttribute('aria-describedby', /period-standard-error/);
  await expect(page.locator('#period-standard-error')).toBeVisible();
  const style = await field.evaluate((e) => {
    const s = getComputedStyle(e);
    return {
      outline: s.outlineStyle,
      outlineWidth: s.outlineWidth,
      offset: s.outlineOffset,
      outlineColor: s.outlineColor,
      borderColor: s.borderColor,
      borderWidth: s.borderWidth,
    };
  });
  expect(style.outline).toBe('solid');
  expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(3);
  expect(parseFloat(style.offset)).toBeGreaterThanOrEqual(4);
  expect(parseFloat(style.borderWidth)).toBeGreaterThanOrEqual(2);
  expect(style.outlineColor).not.toBe(style.borderColor);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({ path: info.outputPath('focused-error.png'), fullPage: true });
});

test('all four editorial states reflow with unavailable fonts, enlarged type and text spacing', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
  await context.route('**/*.woff2', (route) => route.abort());
  const page = await context.newPage();
  for (const route of ['/', '/#/period/values/ownership', '/#/period/standard']) {
    await page.goto(baseURL! + route);
    await page.evaluate(() => document.fonts.ready);
    expect(await fits(page)).toBe(true);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await fits(page)).toBe(true);
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent =
        '.period-shell * { line-height:1.5!important; letter-spacing:.12em!important; word-spacing:.16em!important; } .period-shell p { margin-bottom:2em!important; }';
      document.head.append(style);
    });
    expect(await fits(page)).toBe(true);
  }
  await populated(page);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  expect(await fits(page)).toBe(true);
  await expect(page.locator('[data-field="standard"]')).toHaveText(periodExercise.example.standard);
  await context.close();
});

test('400 percent viewport-equivalent reflow retains all teaching and controls', async ({
  browser,
  baseURL,
}) => {
  // Native browser UI zoom is a separate manual gate. A 1280 px viewport at
  // 400% zoom exposes 320 CSS pixels; this tests that layout, not browser UI zoom.
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    deviceScaleFactor: 4,
  });
  const page = await context.newPage();
  for (const route of ['/', '/#/period/values/ownership', '/#/period/standard']) {
    await page.goto(baseURL! + route);
    expect(await fits(page)).toBe(true);
  }
  await populated(page);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  expect(await fits(page)).toBe(true);
  await expect(page.locator('[data-field="standard"]')).toHaveText(periodExercise.example.standard);
  await context.close();
});

test('print keeps complete maximum and newline-heavy authored fields on A4 and Letter', async ({
  page,
  browserName,
}, info) => {
  test.skip(
    browserName !== 'chromium',
    'PDF generation is a Chromium capability; other engines cover print CSS in the journey suite.',
  );
  for (const multiline of [false, true]) {
    await populated(page);
    const standard = multiline ? 'S\n'.repeat(250) : 'Standard '.repeat(55) + 'end';
    const next = multiline ? 'N\n'.repeat(150) : 'Next '.repeat(59) + 'end';
    const support = multiline ? 'R\n'.repeat(150) : 'Return '.repeat(42) + 'end';
    await page.locator('#period-standard').fill(standard);
    await page.locator('#period-nextApplication').fill(next);
    await page.locator('.support summary').click();
    await page.locator('#period-returnPlan').fill(support);
    await page.getByRole('button', { name: 'Make my standard card' }).click();
    await expect(page.locator('#period-card-title')).toBeFocused();
    for (const [field, text] of [
      ['standard', standard],
      ['nextApplication', next],
      ['returnPlan', support],
    ])
      expect(await page.locator(`[data-field="${field}"]`).textContent()).toBe(text);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.result-actions')).toBeHidden();
    await expect(page.locator('.card-status')).toContainText('Chosen, not yet demonstrated');
    await expect(page.locator('.card-source')).toContainText(
      'https://jimlunsford.com/period-code/',
    );
    for (const format of ['A4', 'Letter'] as const)
      await page.pdf({
        path: info.outputPath(`period-${multiline ? 'newline' : 'long'}-${format}.pdf`),
        format,
      });
    await page.emulateMedia({ media: 'screen' });
  }
});

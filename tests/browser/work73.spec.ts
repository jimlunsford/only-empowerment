import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { frameworkOrientation as orientation } from '../../src/framework-home-content';
import { loopTransfer } from '../../src/loop-content';
import { loopScenario } from '../../src/loop-practice-content';

const previous = (page: Page) => page.getByRole('button', { name: 'Previous choice', exact: true });
async function chosen(page: Page, id: string) {
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', id);
  await expect(page.locator('#loop-scenario-heading')).toBeFocused();
  await expect(page.getByRole('status')).toHaveText('Example: ' + loopScenario.states[id].heading);
}
async function choose(page: Page, index = 0) {
  await page.locator('.loop-choices button').nth(index).click();
}
const noOverflow = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

for (const width of [320, 390, 768, 1440]) {
  test(`Work73 homepage exact orientation and independent keyboard entries at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Where to start', exact: true });
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(orientation.heading);
    await expect(section.locator('p')).toHaveText([orientation.relationship, orientation.choice]);
    expect(await section.evaluate((el) => el.nextElementSibling?.className)).toBe(
      'framework-options',
    );
    await expect(page.getByRole('heading', { name: 'Where to start', exact: true })).toHaveCount(1);
    for (const [index, route] of ['period', 'rebuild', 'loop'].entries()) {
      const link = page.locator('.framework-options a').nth(index);
      await expect(link).toHaveAttribute('href', '#/' + route);
      await link.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(new RegExp('#/' + route + '$'));
      await expect(page.locator('#app h1')).toBeVisible();
      await page.goBack();
      await expect(page.locator('.framework-options')).toBeVisible();
    }
    await noOverflow(page);
  });
  test(`Work73 Previous choice keyboard focus and transfer fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/loop/practice');
    await expect(previous(page)).toBeDisabled();
    await page.locator('.loop-choices button').first().focus();
    await page.keyboard.press('Enter');
    await previous(page).focus();
    await page.keyboard.press('Space');
    await chosen(page, 'pressure');
    await expect(previous(page)).toBeDisabled();
    const rect = await page.locator('#loop-scenario-heading').evaluate((el) => {
      const r = el.getBoundingClientRect(),
        s = getComputedStyle(el);
      return { top: r.top, outline: parseFloat(s.outlineWidth) + parseFloat(s.outlineOffset) };
    });
    expect(rect.top - rect.outline).toBeGreaterThanOrEqual(0);
    await noOverflow(page);
    await page.goto('/#/loop');
    const reflection = page.getByRole('region', { name: loopTransfer.heading });
    await reflection.scrollIntoViewIfNeeded();
    await expect(reflection).toBeVisible();
    await noOverflow(page);
  });
}
for (const miss of [false, true]) {
  test(`Work73 actual path retraces and replaces a branch, miss=${miss}`, async ({ page }) => {
    await page.goto('/#/loop/practice' + (miss ? '?state=miss' : ''));
    const initial = miss ? 'miss' : 'pressure';
    await expect(previous(page)).toBeDisabled();
    const historyLength = await page.evaluate(() => history.length);
    const url = page.url();
    const path = [initial];
    for (const option of [0, 0, 0, 0]) {
      path.push(loopScenario.states[path.at(-1)!].options[option].next);
      await choose(page, option);
      await chosen(page, path.at(-1)!);
    }
    for (let i = 0; i < 2; i++) {
      path.pop();
      await previous(page).click();
      await chosen(page, path.at(-1)!);
    }
    const parent = path.at(-1)!;
    const alternate = loopScenario.states[parent].options.length - 1;
    await choose(page, alternate);
    await chosen(page, loopScenario.states[parent].options[alternate].next);
    await previous(page).click();
    await chosen(page, parent);
    while (path.length > 1) {
      path.pop();
      await previous(page).click();
      await chosen(page, path.at(-1)!);
    }
    await expect(previous(page)).toBeDisabled();
    expect(page.url()).toBe(url);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
  });
  test(`Work73 Reset, reload, exit and reentry clear history, miss=${miss}`, async ({ page }) => {
    const route = '/#/loop/practice' + (miss ? '?state=miss' : '');
    await page.goto(route);
    await choose(page);
    await expect(previous(page)).toBeEnabled();
    await page.reload();
    await expect(page.locator('.loop-scenario')).toHaveAttribute(
      'data-state',
      miss ? 'miss' : 'pressure',
    );
    await expect(previous(page)).toBeDisabled();
    await choose(page);
    const historyLength = await page.evaluate(() => history.length);
    await page.getByRole('button', { name: 'Reset example', exact: true }).click();
    await expect(page).toHaveURL(/#\/loop\/practice$/);
    await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
    await expect(previous(page)).toBeDisabled();
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
    await page.reload();
    await expect(previous(page)).toBeDisabled();
    await choose(page);
    await page.getByRole('link', { name: 'Return to the teaching', exact: true }).click();
    await page.goBack();
    await expect(previous(page)).toBeDisabled();
    await choose(page);
    await page.getByRole('link', { name: 'Read or print every outcome', exact: true }).click();
    await page.goBack();
    await expect(previous(page)).toBeDisabled();
    await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  });
}
test('Work73 choices remain memory-only, tab-isolated, with no requests or browser-history additions', async ({
  page,
  context,
}) => {
  await page.goto('/#/loop/practice');
  const snapshot = () =>
    page.evaluate(() => ({
      local: { ...localStorage },
      session: { ...sessionStorage },
      cookie: document.cookie,
      history: history.state,
      length: history.length,
    }));
  const before = await snapshot();
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await choose(page);
  await choose(page);
  await previous(page).click();
  expect(await snapshot()).toEqual(before);
  expect(requests).toEqual([]);
  const other = await context.newPage();
  await other.goto(page.url());
  await expect(previous(other)).toBeDisabled();
  await expect(previous(page)).toBeEnabled();
  await other.close();
  await expect(page.locator('main')).toContainText(
    'Choices stay in this tab. Leaving or reloading clears them. Use the complete reading to link to a specific outcome.',
  );
});
test('Work73 optional fictional transfer preserves all four questions and collects nothing', async ({
  page,
}) => {
  await page.goto('/#/loop');
  const reflection = page.getByRole('region', { name: loopTransfer.heading });
  await expect(reflection.locator('h2')).toHaveText(loopTransfer.heading);
  await expect(reflection.locator('p')).toHaveText([
    loopTransfer.optional,
    loopTransfer.scenario,
    loopTransfer.reflection,
  ]);
  expect(
    await reflection.evaluate((el) => el.previousElementSibling?.querySelector('h2')?.id),
  ).toBe('reflection');
  await expect(page.locator('#reflection').locator('..').locator('p')).toHaveCount(6);
  await expect(reflection.locator('input, textarea, form, button')).toHaveCount(0);
  const result = await new AxeBuilder({ page }).include('.loop-transfer').analyze();
  expect(result.violations).toEqual([]);
});
test('Work73 native homepage and complete Loop reading preserve exact copy without scripts', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 900 },
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Where to start' })).toHaveCount(1);
  const orientationSection = page.locator('section[aria-labelledby="framework-orientation-title"]');
  await expect(orientationSection.locator('p')).toHaveText([
    orientation.relationship,
    orientation.choice,
  ]);
  for (const href of ['#teaching-order', '/read/rebuild.html', '/read/loop.html'])
    await expect(page.locator('.framework-hub a[href="' + href + '"]')).toBeVisible();
  await page.goto('/read/loop.html');
  const reflection = page.getByRole('region', { name: loopTransfer.heading });
  await expect(reflection.locator('p')).toHaveText([
    loopTransfer.optional,
    loopTransfer.scenario,
    loopTransfer.reflection,
  ]);
  await expect(page.locator('script, input, textarea, form')).toHaveCount(0);
  await noOverflow(page);
  await page.emulateMedia({ media: 'print' });
  await expect(reflection).toBeVisible();
  await context.close();
});
test('Work73 homepage and Previous choice pass automated accessibility checks', async ({
  page,
}) => {
  await page.goto('/');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.goto('/#/loop/practice');
  await choose(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

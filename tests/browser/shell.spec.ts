import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { executionCard } from './helpers/next-move';
const toolNames: Record<string, string> = {
  '/tools/decision-room': 'Decision Room',
  '/tools/next-move': 'Next Move',
  '/tools/build-a-standard': 'Build a Standard',
  '/tools/reset': 'Reset',
  '/tools/rebuild-map': 'Rebuild Map',
  '/tools/do-it-now': 'Do It Now',
};
const routes = [
  '/',
  '/tools',
  '/approach',
  '/privacy',
  '/saved',
  '/tools/decision-room',
  '/tools/next-move',
  '/tools/reset',
  '/tools/build-a-standard',
  '/tools/rebuild-map',
  '/tools/do-it-now',
];
test('all shell routes are accessible and fit the viewport', async ({ page }, testInfo) => {
  for (const route of routes) {
    await page.goto(`/#${route}`);
    await expect(page.locator('h1')).toBeVisible();
    if (toolNames[route])
      await expect(
        page.getByRole('region', { name: toolNames[route], exact: true }).locator('h1'),
      ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (['chromium', 'mobile-chromium'].includes(testInfo.project.name) && route === '/')
      await page.screenshot({
        path: testInfo.outputPath('home.png'),
        fullPage: true,
      });
  }
});
test('private marker stays out of requests and storage; internal navigation retains it and reload clears it', async ({
  page,
  context,
  baseURL,
}) => {
  const requests: { url: string; method: string; data: string | null }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), data: r.postData() }),
  );
  const marker = 'PRIVATE-SYNTHETIC-OE-9136';
  await executionCard(page, marker);
  expect(
    requests.every(
      (r) =>
        r.method === 'GET' &&
        new URL(r.url).origin === new URL(baseURL!).origin &&
        !JSON.stringify(r).includes(marker),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  await expect(page.locator('h1')).toContainText('Understand it.');
  await page.goBack();
  await expect(page.locator('.artifact-action .answer')).toHaveText(marker);
  await page.reload();
  await expect(page.getByLabel('What needs movement?', { exact: true })).toHaveValue('');
});
test('keyboard skip, route focus and not-found recovery', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
  for (const route of ['/unknown', '/preview', '/tools/unknown']) {
    await page.goto('/#' + route);
    await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
});
test('source footer and metadata identify the same build', async ({ page, request }) => {
  await page.goto('/');
  const metadata = await (await request.get('/build.json')).json();
  expect(metadata.commit).toMatch(/^[0-9a-f]{40}$/);
  await expect(page.locator('.footer-meta')).toContainText(metadata.commit.slice(0, 7));
  if (!metadata.dirty)
    await expect(page.locator('.footer-meta a').last()).toHaveAttribute('href', metadata.source);
});

test('320px layout and long answers reflow without horizontal scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await executionCard(page, 'x'.repeat(2000));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

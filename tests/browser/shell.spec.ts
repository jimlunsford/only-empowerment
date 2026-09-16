import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const routes = [
  '/',
  '/tools',
  '/approach',
  '/privacy',
  '/preview',
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
    if (
      ['chromium', 'mobile-chromium'].includes(testInfo.project.name) &&
      ['/', '/preview'].includes(route)
    )
      await page.screenshot({
        path: testInfo.outputPath(route === '/' ? 'home.png' : 'preview.png'),
        fullPage: true,
      });
  }
});
test('preview validates, escapes text, edits, and clears in-memory work', async ({
  page,
}, testInfo) => {
  await page.goto('/#/preview');
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  await expect(page.getByRole('alert')).toContainText('Name one action');
  await expect(
    page.getByRole('textbox', { name: 'What is one action you could finish?' }),
  ).toBeFocused();
  await page
    .getByRole('textbox', { name: 'What is one action you could finish?' })
    .fill('<img src=x onerror=alert(1)> Send one question.');
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  await expect(page.getByRole('heading', { name: 'Sample action card' })).toBeFocused();
  await expect(page.locator('.answer')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('.answer img')).toHaveCount(0);
  if (['chromium', 'mobile-chromium'].includes(testInfo.project.name))
    await page.screenshot({ path: testInfo.outputPath('output.png'), fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Edit response' }).click();
  await expect(
    page.getByRole('textbox', { name: 'What is one action you could finish?' }),
  ).toHaveValue(/Send one question/);
  await page.getByRole('button', { name: 'Clear preview', exact: true }).click();
  await page.getByRole('button', { name: 'Keep working' }).click();
  await expect(
    page.getByRole('textbox', { name: 'What is one action you could finish?' }),
  ).toHaveValue(/Send one question/);
  await page.getByRole('button', { name: 'Clear preview', exact: true }).click();
  await page.getByRole('button', { name: 'Clear this preview', exact: true }).click();
  await expect(
    page.getByRole('textbox', { name: 'What is one action you could finish?' }),
  ).toHaveValue('');
});
test('private marker stays out of requests and storage; reload and exit discard it', async ({
  page,
  context,
}) => {
  const requests: { url: string; method: string; data: string | null }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), data: r.postData() }),
  );
  await page.goto('/#/preview');
  const marker = 'PRIVATE-SYNTHETIC-OE-9136';
  await page.getByRole('textbox', { name: 'What is one action you could finish?' }).fill(marker);
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  await expect(page.locator('.answer')).toHaveText(marker);
  expect(
    requests.every(
      (r) =>
        r.method === 'GET' &&
        new URL(r.url).origin === 'http://127.0.0.1:4173' &&
        !JSON.stringify(r).includes(marker),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'What is one action you could finish?' }),
  ).toHaveValue('');
  await page.getByRole('textbox', { name: 'What is one action you could finish?' }).fill(marker);
  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole('textbox', { name: 'What is one action you could finish?' }),
  ).toHaveValue('');
});
test('keyboard skip, route focus and not-found recovery', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
  await page.goto('/#/unknown');
  await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible();
});
test('copy failure is explained and long output has a print layout', async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('denied')) },
    }),
  );
  await page.goto('/#/preview');
  await page
    .getByRole('textbox', { name: 'What is one action you could finish?' })
    .fill('Long sample '.repeat(45));
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  await page.getByRole('button', { name: 'Copy card', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Select the text');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.staging-banner')).toBeHidden();
  await expect(page.locator('.output-card')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print card' })).toBeHidden();
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
  await page.goto('/#/preview');
  await page
    .getByRole('textbox', { name: 'What is one action you could finish?' })
    .fill('x'.repeat(600));
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  await expect(page.locator('.answer')).toHaveText('x'.repeat(600));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

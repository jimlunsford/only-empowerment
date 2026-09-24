import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const staging = 'https://dev.onlyempowerment.com';
const accepted = process.env.OE_STAGING_COMMIT || 'bd984a8986a658c6bd0d0d663c4e30f5c2f09d80';
if (!/^[a-f0-9]{40}$/.test(accepted)) throw new Error('OE_STAGING_COMMIT must be a full Git SHA.');
test.beforeEach(({ baseURL }) => {
  test.skip(baseURL !== staging, 'These checks target the deployed staging host only.');
});

test('deployed TLS response, headers and source match independently pinned source', async ({
  request,
}) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const headers = response.headers();
  expect(headers['x-robots-tag']).toBe('noindex, nofollow, noarchive');
  expect(headers['content-security-policy']).toContain("connect-src 'none'");
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).toContain("form-action 'none'");
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('no-referrer');
  expect(headers['set-cookie']).toBeUndefined();
  const metadata = await (await request.get('/build.json')).json();
  expect(metadata).toEqual({
    version: '0.1.0-dev.6',
    commit: accepted,
    dirty: false,
    tag: null,
    source: `https://github.com/jimlunsford/only-empowerment/commit/${accepted}`,
  });
  const http = await request.get('http://dev.onlyempowerment.com/', { maxRedirects: 0 });
  expect(http.status()).toBe(301);
  expect(http.headers().location).toBe(`${staging}/`);
});

test('deployed layouts and print artifact are reviewable at laptop and narrow widths', async ({
  page,
}, testInfo) => {
  for (const width of [1024, 390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (testInfo.project.name === 'chromium')
      await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
  }
  await page.goto('/#/preview');
  await page
    .getByRole('textbox', { name: 'What is one action you could finish?' })
    .fill('SYNTHETIC STAGING REVIEW: Clear one shelf. Done when the surface is empty.');
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  if (testInfo.project.name === 'chromium')
    await page.screenshot({ path: testInfo.outputPath('card-320.png'), fullPage: true });
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.output-card')).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.staging-banner')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Copy card', exact: true })).toBeHidden();
  if (testInfo.project.name === 'chromium') {
    await page.screenshot({ path: testInfo.outputPath('print-card.png'), fullPage: true });
    await page.pdf({
      path: testInfo.outputPath('sample-card.pdf'),
      format: 'A4',
      printBackground: true,
    });
  }
});

test('deployed answer lifecycle emits only first-party static requests and no persistent storage', async ({
  page,
  context,
}) => {
  const requests: { url: string; method: string; data: string | null }[] = [];
  const consoleErrors: string[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), data: r.postData() }),
  );
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('/#/preview');
  const marker = 'OE-PRIVATE-SYNTHETIC-DEPLOYED-20260916';
  const field = page.getByRole('textbox', { name: 'What is one action you could finish?' });
  await field.fill(marker);
  await page.getByRole('button', { name: 'Review the sample card' }).click();
  await page.getByRole('button', { name: 'Edit response' }).click();
  await expect(field).toHaveValue(marker);
  await page.getByRole('button', { name: 'Clear preview', exact: true }).click();
  await page.getByRole('button', { name: 'Clear this preview', exact: true }).click();
  await expect(field).toHaveValue('');
  await field.fill(marker);
  await page.reload();
  await expect(field).toHaveValue('');
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      databases: await indexedDB.databases(),
      caches: await caches.keys(),
      workers: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ local: 0, session: 0, databases: [], caches: [], workers: 0 });
  expect(requests.length).toBeGreaterThan(0);
  expect(
    requests.every(
      (r) =>
        r.method === 'GET' &&
        new URL(r.url).origin === staging &&
        !JSON.stringify(r).includes(marker),
    ),
  ).toBe(true);
  expect(consoleErrors).toEqual([]);
  console.log('Observed requests:', JSON.stringify(requests));
});

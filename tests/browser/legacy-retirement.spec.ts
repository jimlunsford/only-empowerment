import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { records, seed } from './helpers/legacy-records';

const retired = [
  '/tools',
  '/saved',
  '/approach',
  ...['decision-room', 'next-move', 'build-a-standard', 'reset', 'rebuild-map', 'do-it-now'].map(
    (name) => '/tools/' + name,
  ),
];
const values = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
const readings = [
  '/',
  '/read/resilience.html',
  '/read/integrity.html',
  '/read/discipline.html',
  '/read/empowerment.html',
];
const snapshot = (page: import('@playwright/test').Page) =>
  page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));

test('every retired fragment is unavailable on direct entry, reload, and in-site history', async ({
  page,
}) => {
  for (const path of retired) {
    await page.goto('/#' + path);
    await expect(page.locator('h1')).toHaveText('That page is not here.');
    await expect(page.locator('main')).toContainText('have been retired');
    await expect(page.locator('main textarea, main input, main select, main button')).toHaveCount(
      0,
    );
    await page.reload();
    await expect(page.locator('h1')).toHaveText('That page is not here.');
    await page
      .getByRole('main')
      .getByRole('link', { name: 'Explore the values', exact: true })
      .click();
    await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
    await page.goBack();
    await expect(page.locator('h1')).toHaveText('That page is not here.');
    await page.goForward();
    await expect(
      page.getByRole('navigation', { name: 'PERIOD teaching order' }).getByRole('link'),
    ).toHaveCount(6);
  }
});

test('all fictional legacy values remain byte-identical through startup, public navigation and retired routes', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await seed(page);
  const before = await snapshot(page);
  expect(before).toEqual(records);
  const routes = [
    '/',
    ...values.map((v) => '/period/values/' + v),
    '/period/practice',
    '/period/practice/responses',
    '/period/practice/follow-through',
    '/period/practice/connected-code',
    '/period/purpose/evening',
    '/period/resilience/pressure',
    '/period/integrity/record',
    '/period/discipline/pattern',
    '/period/empowerment/conversation',
    '/period/standard',
    '/period/book',
    '/privacy',
    ...retired,
  ];
  for (const path of routes) {
    await page.goto('/#' + path);
    await expect(page.locator('h1')).toBeVisible();
    expect(await snapshot(page)).toEqual(before);
    await expect(page.locator('body')).not.toContainText('Plan the fictional handover');
    await expect(page.locator('body')).not.toContainText('unsupported raw record');
  }
  const after = await snapshot(page);
  const hashes = Object.entries(before).map(([key, raw]) => ({
    key,
    before: createHash('sha256').update(raw).digest('hex'),
    after: createHash('sha256').update(after[key]).digest('hex'),
  }));
  await writeFile(
    info.outputPath('work28-storage-preservation.json'),
    JSON.stringify({ fictional: true, routes, unchanged: true, hashes }, null, 2),
  );
});

test('startup and normal navigation never even access local storage; cancellation also leaves it untouched', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    (window as any).legacyAccesses = 0;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        (window as any).legacyAccesses++;
        return original.get!.call(window);
      },
    });
  });
  await page.goto('/');
  for (const link of [
    'Optional Standard Card',
    'Privacy & source',
    'About the book',
    'Why PERIOD?',
  ]) {
    await page.getByRole('link', { name: link, exact: true }).first().click();
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => (window as any).legacyAccesses)).toBe(0);
  }
  await page.getByRole('link', { name: 'Privacy & source', exact: true }).click();
  await page.getByRole('button', { name: 'Delete legacy tool data', exact: true }).click();
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => (window as any).legacyAccesses)).toBe(0);
});

test('unavailable browser storage does not block lessons, examples, retirement response or the card', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Fictional blocked storage');
      },
    }),
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const path of [
    '/',
    ...values.map((v) => '/period/values/' + v),
    '/period/standard',
    '/privacy',
    '/saved',
  ]) {
    await page.goto('/#' + path);
    await expect(page.locator('h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('ineffective confirmed deletion reports failure without modifying unrelated data', async ({
  page,
}) => {
  await seed(page);
  await page.getByRole('link', { name: 'Privacy & source', exact: true }).click();
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => {};
  });
  await page.getByRole('button', { name: 'Delete legacy tool data', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete legacy tool data', exact: true })
    .click();
  await expect(page.locator('.local-delete [role="status"]')).toContainText(
    'could not be verified',
  );
  expect(await snapshot(page)).toEqual(records);
});

test('static reading and failed enhancement contain no legacy entry points and disclose residual data', async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    try {
      if (javaScriptEnabled)
        await context.route('**/*', (route) =>
          route.request().resourceType() === 'script' ? route.abort() : route.continue(),
        );
      const page = await context.newPage();
      for (const path of readings) {
        await page.goto(baseURL + path);
        await expect(page.getByRole('main')).toBeVisible();
        await expect(
          page.locator('a[href*="#/tools"], a[href*="#/saved"], a[href*="#/approach"]'),
        ).toHaveCount(0);
        await expect(page.getByRole('navigation', { name: 'Existing work' })).toHaveCount(0);
        await expect(page.locator('.founder-copyright')).toHaveCount(1);
        await expect(
          page.getByRole('link', { name: 'Privacy & source', exact: true }),
        ).toHaveAttribute('href', '/read/privacy.html');
        if (path === '/') {
          await expect(page.getByRole('main')).toContainText(
            'Existing browser-local records are left untouched',
          );
          await expect(page.getByRole('main')).toContainText('browser’s settings');
        }
      }
    } finally {
      await context.close();
    }
  }
});

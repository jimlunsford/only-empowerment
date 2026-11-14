import { test, expect } from '@playwright/test';

const sections = ['line', 'structure', 'return', 'trust', 'negotiation', 'help', 'end', 'complete'];
const fit = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('framework home introduces both complete experiences', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /A place to learn how to live differently/ }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore The PERIOD Code' })).toHaveAttribute(
    'href',
    '#/period',
  );
  await expect(page.getByRole('link', { name: 'Explore How to Rebuild Yourself' })).toHaveAttribute(
    'href',
    '#/rebuild',
  );
  await page.getByRole('link', { name: 'Explore The PERIOD Code' }).click();
  await expect(page.locator('.homepage')).toBeVisible();
  await page.goBack();
  await page.getByRole('link', { name: 'Explore How to Rebuild Yourself' }).click();
  await expect(
    page.getByRole('heading', { name: 'How to Rebuild Yourself', exact: true }),
  ).toBeVisible();
});

test('each founder teaching destination is reachable in the native app', async ({ page }) => {
  for (const section of sections) {
    await page.goto('/#/rebuild/' + section);
    await expect(page.locator('.rebuild-guide h1')).toBeVisible();
    await expect(page.locator('.rebuild-guide')).toContainText('How to Rebuild Yourself');
    await expect(page.locator('.site-header')).toBeVisible();
    await expect(page.locator('.site-footer')).toBeVisible();
    expect(await fit(page)).toBe(true);
  }
});

test('all 22 optional source actions remain operable and are not submissions', async ({ page }) => {
  await page.goto('/#/rebuild/line');
  for (const i of [1, 2, 3, 4]) {
    await page.locator('.quotesheet .q' + i).click();
    await expect(page.locator('#note-' + i)).toBeVisible();
  }
  await page.goto('/#/rebuild/structure');
  for (const i of [1, 2, 3, 4]) {
    await page.locator('.switchset .sw' + i).check();
    await expect(page.locator('.switchset #pane-' + i)).toBeVisible();
  }
  await page.goto('/#/rebuild/return');
  const entries = page.locator('.timeline details');
  await expect(entries).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    if (!(await entries.nth(i).evaluate((el: HTMLDetailsElement) => el.open)))
      await entries.nth(i).locator('summary').click();
    await expect(entries.nth(i)).toHaveAttribute('open', '');
  }
  await page.goto('/#/rebuild/trust');
  const trust = page.locator('.layers input');
  await expect(trust).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await trust.nth(i).check();
    await expect(trust.nth(i)).toBeChecked();
  }
  await page.goto('/#/rebuild/negotiation');
  for (const i of [1, 2, 3, 4]) {
    await page.locator('.switchset .sw' + i).check();
    await expect(page.locator('.switchset #pane-' + i)).toBeVisible();
  }
  await page.goto('/#/rebuild/help');
  const help = page.locator('.scope-list details');
  await expect(help).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    if (!(await help.nth(i).evaluate((el: HTMLDetailsElement) => el.open)))
      await help.nth(i).locator('summary').click();
    await expect(help.nth(i)).toHaveAttribute('open', '');
  }
  await expect(page.locator('.rebuild-guide :is(form,textarea,button[type=submit])')).toHaveCount(
    0,
  );
});

test('narrow-screen and print keep the complete teaching readable', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 820 });
    for (const section of [
      'index',
      'line',
      'structure',
      'return',
      'trust',
      'negotiation',
      'help',
      'end',
    ]) {
      await page.goto('/#/rebuild/' + section);
      expect(await fit(page), width + ':' + section).toBe(true);
    }
  }
  await page.goto('/#/rebuild/complete');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.all-module')).toHaveCount(7);
  await expect(page.locator('.flatstate')).toHaveCount(22);
});

test('script failure leaves a complete native reading and PERIOD fallback', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL! + '/');
  await expect(page.locator('#rebuild-reading')).toBeVisible();
  await expect(page.locator('#rebuild-reading .all-module')).toHaveCount(7);
  await expect(page.locator('#teaching-order')).toBeVisible();
  await expect(page.locator('#rebuild-reading')).toContainText(
    'Build a Life You Do Not Want to Escape',
  );
  await context.close();
});

test('private authored information stays out of network and persistent storage', async ({
  page,
  context,
  baseURL,
}) => {
  const requests = [];
  page.on('request', (request) =>
    requests.push({ url: request.url(), method: request.method(), data: request.postData() }),
  );
  await page.goto('/#/rebuild');
  await page.getByRole('link', { name: 'Draw the line' }).first().click();
  await page.locator('.quotesheet .q4').click();
  expect(
    requests.every((r) => r.method === 'GET' && new URL(r.url).origin === new URL(baseURL!).origin),
  ).toBe(true);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
});

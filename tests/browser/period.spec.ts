import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const standard = '  When <b>pressure</b> arrives, I pause.\n👩🏽‍💻 é العربية  ';
const application = 'Before the check-in, I send an honest update.';
async function editor(page: Page) {
  await page.goto('/#/period/standard');
  await page.locator('#period-valueId').selectOption('ownership');
  await page.locator('#period-standard').fill(standard);
  await page.locator('#period-nextApplication').fill(application);
}
async function card(page: Page) {
  await editor(page);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
}
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
test('teaching journey, available links, keyboard focus and example require no answers', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Why PERIOD?', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The negotiation', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The standard', exact: true })).toBeVisible();
  await axe(page);
  await page.getByRole('link', { name: 'Start with Ownership' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await expect(
    page.getByRole('heading', { name: 'Ownership does not mean everything is your fault.' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why Purpose comes next' })).toBeVisible();
  await expect(page.locator('a[href="#/period/values/purpose"]')).toHaveCount(0);
  await axe(page);
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Practice Ownership', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Practice Ownership views' })
    .getByRole('link', { name: 'The connected Code', exact: true })
    .click();
  await page.getByRole('link', { name: 'Write an optional Standard Card' }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('ownership');
  await page.getByText('See a finished example', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Example standard card' })).toBeVisible();
  await page.getByRole('button', { name: 'Write my own standard' }).click();
  await expect(page.locator('#period-valueId')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue('');
  await page.goto('/#/period/values/unknown');
  await expect(page.locator('h1')).toHaveText('Choose a value');
  await expect(page.locator('main a[href="#/period/values/ownership"]')).toHaveCount(1);
});
test('validation, Unicode limits, optional support, exact output, edit and clear recovery', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('#period-valueId')).toBeFocused();
  await axe(page);
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill('😀'.repeat(501));
  await page.locator('#period-nextApplication').fill(application);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('#period-standard')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue('😀'.repeat(501));
  await expect(page.locator('#period-standard-error')).toContainText('500 characters');
  await page.locator('#period-standard').fill(standard);
  await page.getByText('Add a way to return when it gets difficult', { exact: true }).click();
  await page.locator('#period-returnPlan').fill('  Ask for help.\nReturn. ');
  await page.getByText('Edit your support or correction', { exact: true }).click();
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('#period-card-title')).toBeFocused();
  expect(await page.locator('[data-field="standard"]').textContent()).toBe(standard);
  expect(await page.locator('[data-field="returnPlan"]').textContent()).toBe(
    '  Ask for help.\nReturn. ',
  );
  await expect(page.locator('.period-card b')).toHaveCount(0);
  await axe(page);
  await page.getByRole('button', { name: 'Edit my card' }).click();
  await expect(page.locator('#period-valueId')).toBeFocused();
  await page.locator('#period-valueId').selectOption('discipline');
  await expect(page.getByRole('status').first()).toContainText('Your wording is unchanged');
  await expect(page.locator('#period-standard')).toHaveValue(standard);
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep writing' })).toBeFocused();
  await axe(page);
  await page.keyboard.press('Escape');
  await expect(page.locator('#period-clear')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue(standard);
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click();
  await expect(page.locator('#period-clear')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue('');
});
test('draft and card survive in-site history, lesson entry, and guarded book exit', async ({
  page,
}) => {
  await editor(page);
  await page.getByRole('link', { name: 'Ownership', exact: true }).first().click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Practice Ownership', exact: true })
    .click();
  await page
    .getByRole('navigation', { name: 'Practice Ownership views' })
    .getByRole('link', { name: 'The connected Code', exact: true })
    .click();
  await page.getByRole('link', { name: 'Write an optional Standard Card' }).click();
  await expect(
    page.getByText('You already have a standard in progress.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('#period-standard')).toHaveValue(standard);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.goBack();
  expect(await page.locator('[data-field="standard"]').textContent()).toBe(standard);
  await page.getByRole('link', { name: 'About the book', exact: true }).click();
  await page.getByRole('link', { name: 'Explore the book and read a sample' }).click();
  await expect(page.getByRole('button', { name: 'Stay here' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('link', { name: 'Explore the book and read a sample' }),
  ).toBeFocused();
  await expect(page).toHaveURL(/#\/period\/book$/);
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await page.reload();
  await expect(page.locator('#period-standard')).toHaveValue('');
});
test('Back and Forward restore distinct reading positions', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => scrollTo(0, 500));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(500);
  await page
    .getByRole('link', { name: 'Ownership', exact: true })
    .first()
    .evaluate((el: HTMLElement) => el.click());
  await expect(page.getByRole('heading', { name: 'Ownership', exact: true })).toBeVisible();
  await page.evaluate(() => scrollTo(0, 700));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(500);
  await page.goForward();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
});
test('copy success, denied clipboard fallback and print cancellation are truthful', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copiedCard = text;
        },
      },
    });
    window.print = () => {
      (window as any).printRequested = true;
    };
  });
  await card(page);
  await page.getByRole('button', { name: 'Copy my card' }).click();
  await expect(page.getByRole('status')).toContainText('Card copied.');
  const copied = await page.evaluate(() => (window as any).copiedCard);
  expect(copied).toContain(standard);
  expect(copied).toContain('Chosen, not yet demonstrated');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Copy my card' }).click();
  await expect(page.getByRole('status')).toContainText('Copy was blocked.');
  await expect(page.getByLabel('Card text to copy')).toHaveValue(copied);
  await page.getByRole('button', { name: 'Select all text' }).click();
  expect(
    await page
      .locator('#period-copy')
      .evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart),
  ).toBe(copied.length);
  await page.getByRole('button', { name: 'Print my card' }).click();
  expect(await page.evaluate(() => (window as any).printRequested)).toBe(true);
  await expect(page.getByRole('status')).not.toContainText('Printed');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('#period-copy')).toBeHidden();
  await expect(page.locator('.period-card')).toBeVisible();
  expect(await page.locator('[data-field="standard"]').textContent()).toBe(standard);
});
test('authored content never enters traffic, logs, storage or history and legacy bytes survive clear', async ({
  page,
  context,
  baseURL,
}) => {
  const requests: string[] = [],
    messages: string[] = [];
  page.on('request', (r) =>
    requests.push(
      JSON.stringify({
        url: r.url(),
        method: r.method(),
        headers: r.headers(),
        body: r.postData(),
      }),
    ),
  );
  page.on('console', (m) => messages.push(m.text()));
  page.on('pageerror', (e) => messages.push(e.message));
  const marker = 'PRIVATE-PERIOD-TEST-8429';
  const key = 'oe:execution-card:v1:11111111-1111-4111-8111-111111111111';
  const record = JSON.stringify({
    schemaVersion: 1,
    id: '11111111-1111-4111-8111-111111111111',
    tool: 'next-move',
    status: 'Planned',
    card: {
      situation: 'Legacy fixture',
      action: 'Keep this record',
      start: 'Today',
      obstacle: 'None',
      completion: 'Check',
    },
  });
  await page.goto('/');
  await page.evaluate(({ key, record }) => localStorage.setItem(key, record), { key, record });
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await page.locator('#period-valueId').selectOption('resilience');
  await page.locator('#period-standard').fill(marker);
  await page.locator('#period-nextApplication').fill(marker);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await expect(page.getByRole('main')).toContainText('Legacy fixture');
  await page.goBack();
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click();
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(record);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([1, 0]);
  expect(await page.evaluate(() => JSON.stringify(history.state))).not.toContain(marker);
  expect(page.url()).not.toContain(marker);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
  expect(
    await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length)),
  ).toBe(0);
  expect(
    requests.every(
      (r) =>
        !r.includes(marker) &&
        JSON.parse(r).method === 'GET' &&
        new URL(JSON.parse(r).url).origin === new URL(baseURL!).origin,
    ),
  ).toBe(true);
  expect(messages.join(' ')).not.toContain(marker);
});
test('static reading survives disabled JavaScript and a failed app script', async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    if (javaScriptEnabled)
      await context.route('**/*', (route) =>
        route.request().resourceType() === 'script' ? route.abort() : route.continue(),
      );
    const page = await context.newPage();
    await page.goto(baseURL! + '/#/period/standard');
    for (const text of [
      'Why PERIOD?',
      'Ownership',
      'Why Purpose comes next',
      'Example standard card',
    ])
      await expect(
        page.getByRole('heading', {
          name: text,
          exact: true,
          level: text === 'Ownership' ? 2 : undefined,
        }),
      ).toBeVisible();
    await expect(page.getByText(/The card editor needs JavaScript/)).toBeVisible();
    await expect(page.locator('textarea')).toHaveCount(0);
    await context.close();
  }
});
test('responsive teaching, editor and maximum card reflow, accessibility and review captures', async ({
  page,
}, info) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/#/period/values/ownership', '/#/period/standard']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.setViewportSize({
    width: info.project.name === 'mobile-chromium' ? 390 : 1440,
    height: 900,
  });
  await page.goto('/');
  if (['chromium', 'mobile-chromium'].includes(info.project.name))
    await page.screenshot({ path: info.outputPath('period-introduction.png'), fullPage: true });
  await page.goto('/#/period/values/ownership');
  if (['chromium', 'mobile-chromium'].includes(info.project.name))
    await page.screenshot({ path: info.outputPath('period-ownership.png'), fullPage: true });
  await editor(page);
  await page
    .locator('#period-standard')
    .fill('When a deadline is at risk, I send an honest update before it passes.');
  await axe(page);
  if (['chromium', 'mobile-chromium'].includes(info.project.name))
    await page.screenshot({ path: info.outputPath('period-editor.png'), fullPage: true });
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  if (['chromium', 'mobile-chromium'].includes(info.project.name))
    await page.screenshot({ path: info.outputPath('period-card.png'), fullPage: true });
  if (info.project.name === 'chromium') {
    for (const format of ['A4', 'Letter'] as const)
      await page.pdf({ path: info.outputPath(`period-typical-${format}.pdf`), format });
  }
  await page.getByRole('button', { name: 'Edit my card' }).click();
  await page.locator('#period-standard').fill('👩🏽‍💻'.repeat(125));
  await page.locator('#period-nextApplication').fill('x'.repeat(300));
  await page.getByText('Add a way to return when it gets difficult', { exact: true }).click();
  await page.locator('#period-returnPlan').fill('y'.repeat(300));
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  if (info.project.name === 'chromium')
    for (const format of ['A4', 'Letter'] as const)
      await page.pdf({ path: info.outputPath(`period-maximum-${format}.pdf`), format });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    document.body.style.lineHeight = '1.5';
    document.body.style.letterSpacing = '0.12em';
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await axe(page);
});

test('short exercise is operable by keyboard through review and edit', async ({ page }) => {
  await page.goto('/#/period/standard');
  // Start from the main landmark as the skip link would; all subsequent controls use keys.
  await page.locator('#main').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#period-valueId')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Read about Ownership' })).toBeFocused();
  await page.keyboard.press('Tab');
  if (await page.locator('.mobile-teaching').isVisible()) {
    await expect(page.locator('.mobile-teaching summary')).toBeFocused();
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('#period-standard')).toBeFocused();
  await page.keyboard.type('When a commitment changes, I give an honest update.');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Before the meeting, I explain the delay.');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Make my standard card' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#period-card-title')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Copy my card' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Print my card' })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#period-valueId')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue(
    'When a commitment changes, I give an honest update.',
  );
});

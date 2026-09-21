import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const marker = 'OE-SYNTHETIC-NEXTMOVE-20260920';
const data = {
  situation: `${marker} A request is stalled.\nKeep my words.`,
  action: `${marker} Send the completed request. <script>alert('x')</script> 🧭`,
  obstacle: `${marker} Waiting for motivation.`,
  start: `${marker} After lunch.`,
  completion: `${marker} Request sent; a reply is not required.`,
};
async function next(page: Page) {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  // Invalid Next intentionally stays put. Valid transitions are asserted by each named next field.
}
async function checkAxe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function begin(page: Page) {
  await page.goto('/#/tools/next-move');
  await page.getByLabel('What needs movement?', { exact: true }).fill(data.situation);
  await next(page);
  await page.getByLabel('What is your next useful action?', { exact: true }).fill(data.action);
  await next(page);
}
async function plan(page: Page) {
  await begin(page);
  await page.getByRole('radio', { name: 'The direction is decided' }).check();
  await next(page);
  await page.getByLabel('What is likely to get in the way?', { exact: true }).fill(data.obstacle);
  await page.getByRole('radio', { name: 'I can plan around' }).check();
  await next(page);
  await page.getByLabel('What will start this action?', { exact: true }).fill(data.start);
  await next(page);
  await page.getByLabel('What will count as complete?', { exact: true }).fill(data.completion);
  await page.getByRole('button', { name: 'Review my plan' }).click();
}
async function finish(page: Page) {
  await plan(page);
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('same browser profile');
  await page.getByRole('button', { name: 'Save this card', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Saved on this device.');
}
async function saved(page: Page) {
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
}
async function deleteAll(page: Page) {
  await page.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await page.getByRole('button', { name: 'Delete all Only Empowerment data', exact: true }).click();
}
test('happy path preserves authored content, validates each state, and edits before finalization', async ({
  page,
}, info) => {
  await page.goto('/#/tools/next-move');
  for (const [step, field] of [
    [0, 'situation'],
    [1, 'action'],
  ] as const) {
    await next(page);
    await expect(page.getByRole('alert')).toContainText('Add');
    await expect(page.getByRole('textbox')).toBeFocused();
    await checkAxe(page);
    await page.getByRole('textbox').fill(data[field]);
    await checkAxe(page);
    await page.screenshot({ path: info.outputPath(`step-${step + 1}.png`), fullPage: true });
    await next(page);
  }
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Choose');
  await page.getByRole('radio', { name: 'The direction is decided' }).check();
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('step-3.png'), fullPage: true });
  await next(page);
  await page.getByLabel('What is likely to get in the way?', { exact: true }).fill(data.obstacle);
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Choose');
  await page.getByRole('radio', { name: 'I can plan around' }).check();
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('step-4.png'), fullPage: true });
  await next(page);
  await page.getByLabel('What will start this action?', { exact: true }).fill(data.start);
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('step-5.png'), fullPage: true });
  await next(page);
  await page.getByLabel('What will count as complete?', { exact: true }).fill(data.completion);
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('step-6.png'), fullPage: true });
  await page.getByRole('button', { name: 'Review my plan' }).click();
  await page
    .getByLabel('My next move', { exact: true })
    .fill('  Revised by me.\nSend the request.  ');
  await page.getByLabel('Completion boundary', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await expect(page.getByLabel('Completion boundary', { exact: true })).toBeFocused();
  await page.getByLabel('Completion boundary', { exact: true }).fill(data.completion);
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('review.png'), fullPage: true });
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await expect(page.locator('.artifact-action .answer')).toHaveJSProperty(
    'textContent',
    '  Revised by me.\nSend the request.  ',
  );
  await expect(page.getByText('Status: Planned', { exact: true })).toBeVisible();
  await expect(
    page.locator('.execution-card script, .execution-card img, .execution-card a'),
  ).toHaveCount(0);
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('card.png'), fullPage: true });
  await page.getByRole('button', { name: 'Edit card' }).click();
  await expect(page.getByLabel('My next move', { exact: true })).toHaveValue(
    '  Revised by me.\nSend the request.  ',
  );
});
test('back and internal route navigation preserve memory, refresh discards unsaved work', async ({
  page,
}) => {
  await begin(page);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveValue(data.action);
  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('textbox')).toHaveValue(data.action);
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('textbox')).toHaveValue(data.action);
  await page.reload();
  await expect(page.getByRole('textbox')).toHaveValue('');
});
test('every not-ready reason and genuine obstacle can stop without creating a card', async ({
  page,
}, info) => {
  test.setTimeout(60000);
  for (const reason of [
    'I have not made the decision.',
    'I need more information.',
    'A resource, permission, or other prerequisite is missing.',
    'Safety needs consideration.',
    'I need professional or personal support.',
    'Circumstances changed.',
    'I am not ready to define this yet.',
  ]) {
    await begin(page);
    await page.getByRole('radio', { name: reason, exact: true }).check();
    await page.getByRole('button', { name: 'Pause here', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('You can pause here.');
    await expect(page.locator('.execution-card')).toHaveCount(0);
    await checkAxe(page);
    if (reason.startsWith('I have not'))
      await expect(page.getByRole('link', { name: 'Open Decision Room' })).toBeVisible();
    await page.reload();
  }
  await begin(page);
  await page.getByRole('radio', { name: 'The direction is decided' }).check();
  await next(page);
  await page.getByRole('textbox').fill('Required authorization has not arrived.');
  await page.getByRole('radio', { name: 'It is a real blocker' }).check();
  await page.getByRole('button', { name: 'Pause here' }).click();
  await expect(page.locator('.pause-panel')).toBeVisible();
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('pause.png'), fullPage: true });
  await page.getByRole('button', { name: 'Reconsider my action' }).click();
  await expect(page.getByRole('textbox')).toHaveValue(data.action);
});
test('copy succeeds truthfully; denied clipboard provides selectable plain text', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).__copied = text;
        },
      },
    }),
  );
  await finish(page);
  await page.getByRole('button', { name: 'Copy card', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Execution Card copied.');
  const text = await page.evaluate(() => (window as any).__copied);
  expect(text).toContain('ONLY EMPOWERMENT\nExecution Card');
  expect(text).toContain(data.action);
  expect(text).toMatch(/Status\nPlanned$/);
  expect(text).not.toContain('Save on');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw Error('denied');
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Copy card', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('blocked');
  await expect(page.getByLabel('Execution Card plain text')).toBeFocused();
  await expect(page.getByLabel('Execution Card plain text')).toHaveValue(text);
  await checkAxe(page);
});
test('explicit save, reopen, edit, multiple cards, per-record deletion and all-version deletion', async ({
  page,
}, info) => {
  await finish(page);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('save-dialog.png'), fullPage: true });
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await save(page);
  await page.reload();
  await saved(page);
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('saved.png'), fullPage: true });
  await page.getByRole('button', { name: 'Open Execution Card 1', exact: true }).click();
  await expect(page.locator('.artifact-action .answer')).toHaveText(data.action);
  await page.getByRole('button', { name: 'Edit card' }).click();
  await page.getByLabel('My next move', { exact: true }).fill('An edited action.');
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await page.getByRole('button', { name: 'Save changes on this device' }).click();
  await page.getByRole('button', { name: 'Save these changes' }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(1);
  await page.reload();
  await finish(page);
  await save(page);
  expect(await page.evaluate(() => localStorage.length)).toBe(2);
  await saved(page);
  await page.getByRole('button', { name: 'Delete Execution Card 1', exact: true }).click();
  await checkAxe(page);
  await page.screenshot({ path: info.outputPath('delete-dialog.png'), fullPage: true });
  await page.getByRole('button', { name: 'Delete this card', exact: true }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(1);
  await page.evaluate(() => {
    localStorage.setItem('other-app', 'keep');
    localStorage.setItem('oe:future:v99', '{}');
  });
  await deleteAll(page);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['other-app']);
  await expect(page.getByRole('heading', { name: 'No saved work.' })).toBeVisible();
  await checkAxe(page);
});
test('corruption and unknown versions stay unreadable and storage failures are honest', async ({
  page,
}) => {
  await page.goto('/#/saved');
  await page.evaluate(() => {
    localStorage.setItem('oe:execution-card:v1:broken', '{');
    localStorage.setItem('oe:future', '{"schemaVersion":99}');
  });
  await page.reload();
  await expect(page.getByText('2 unreadable or unsupported', { exact: false })).toBeVisible();
  await deleteAll(page);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await finish(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException('full', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this card', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('could not be verified');
  await expect(page.locator('.execution-card')).toBeVisible();
  await page.evaluate(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('denied', 'SecurityError');
      },
    }),
  );
  await saved(page);
  await expect(page.getByRole('alert')).toContainText('unavailable');
  await deleteAll(page);
  await expect(page.locator('.local-delete [role=status]')).toContainText('could not be verified');
});
test('cross-tab deletion clears saved and unsaved work without restoring deleted records', async ({
  page,
  context,
}) => {
  await finish(page);
  await save(page);
  const second = await context.newPage();
  await second.goto('/#/saved');
  await second.getByRole('button', { name: 'Open Execution Card 1' }).click();
  await second.getByRole('button', { name: 'Edit card' }).click();
  await second.getByLabel('My next move', { exact: true }).fill('Unsaved change');
  await saved(page);
  await page.getByRole('button', { name: 'Delete Execution Card 1' }).click();
  await page.getByRole('button', { name: 'Delete this card', exact: true }).click();
  await expect(second.getByRole('textbox')).toHaveValue('');
  await second.getByRole('textbox').fill('Unsaved new draft');
  await deleteAll(page);
  await expect(second.getByRole('textbox')).toHaveValue('');
  expect(await second.evaluate(() => localStorage.length)).toBe(0);
});
test('synthetic answers never enter requests, titles, links or unintended persistence', async ({
  page,
  context,
  baseURL,
}) => {
  const requests: { url: string; data: string | null; method: string }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), data: r.postData(), method: r.method() }),
  );
  await finish(page);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
  expect(
    await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length)),
  ).toBe(0);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
  expect(await page.title()).not.toContain(marker);
  expect(
    await page.locator('a').evaluateAll((links) => links.map((a) => a.href).join('\n')),
  ).not.toContain(marker);
  await save(page);
  const raw = await page.evaluate(() => JSON.stringify(localStorage));
  expect(raw).toContain(marker);
  await saved(page);
  await deleteAll(page);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(marker);
  expect(requests.length).toBeGreaterThan(0);
  expect(
    requests.every(
      (r) =>
        r.method === 'GET' &&
        new URL(r.url).origin === new URL(baseURL!).origin &&
        !JSON.stringify(r).includes(marker),
    ),
  ).toBe(true);
});
test('long hostile input, bounds, 320px reflow, forced colors, text scale and multipage print', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await plan(page);
  const long =
    '<img src=x onerror=alert(1)> "quotes" apostrophe’s 日本語 🧭\n' +
    'x'.repeat(650) +
    '\nLong paragraph. '.repeat(60);
  await page.getByLabel('My next move', { exact: true }).fill('x'.repeat(2001));
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await expect(page.getByRole('alert')).toContainText('not been shortened');
  for (const name of [
    'Situation',
    'My next move',
    'Likely obstacle or negotiation',
    'Completion boundary',
  ])
    await page.getByLabel(name, { exact: true }).fill(long);
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await checkAxe(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('narrow-long.png'), fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  await page.screenshot({ path: info.outputPath('forced-colors.png'), fullPage: true });
  await page.emulateMedia({ forcedColors: 'none' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await page.screenshot({ path: info.outputPath('text-200.png'), fullPage: false });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.staging-banner')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Print card' })).toBeHidden();
  await expect(page.locator('.execution-card')).toBeVisible();
  if (info.project.name === 'chromium')
    await page.pdf({
      path: info.outputPath('long-card.pdf'),
      format: 'A4',
      printBackground: false,
    });
});

test('keyboard navigation, dialog focus, viewport widths and empty saved state', async ({
  page,
}, info) => {
  await page.goto('/#/tools/next-move');
  await page.getByRole('textbox').focus();
  await page.keyboard.type('Synthetic keyboard example');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Clear current work', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Clear current work', exact: true })).toBeFocused();
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (info.project.name === 'chromium')
      await page.screenshot({ path: info.outputPath(`workflow-${width}.png`), fullPage: true });
  }
  await saved(page);
  await checkAxe(page);
  await expect(page.getByRole('heading', { name: 'No saved work.' })).toBeVisible();
});

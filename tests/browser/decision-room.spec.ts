import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const marker = 'OE-DECISION-PRIVATE-20260921';
const fields = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
const text = (name: string) => `  ${marker}-${name} <script>"' & 🧭</script>\nMy own words.  `;
async function next(page: Page) {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
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
async function capture(page: Page, info?: TestInfo, name = 'state') {
  if (info && ['chromium', 'mobile-chromium'].includes(info.project.name)) {
    await page.screenshot({ path: info.outputPath(name + '.png'), fullPage: true });
    await info.attach(name + '-semantics', {
      body: await page.locator('main').ariaSnapshot(),
      contentType: 'text/plain',
    });
  }
}
async function compare(page: Page, info?: TestInfo) {
  if (!page.url().endsWith('/#/tools/decision-room')) await page.goto('/#/tools/decision-room');
  await page.locator('#dr-decision').fill(text('decision'));
  await capture(page, info, 'define');
  if (info) await axe(page);
  await next(page);
  await page.getByLabel('Option 1', { exact: true }).fill(text('A'));
  await page.getByLabel('Option 2', { exact: true }).fill(text('B'));
  await capture(page, info, 'options');
  if (info) await axe(page);
  await next(page);
  await page.locator('#dr-matters').fill(text('matters'));
  await next(page);
  for (const f of fields) {
    await page.locator('#dr-' + f).fill(text(f));
    if (info) await axe(page);
    await capture(page, info, f);
    await next(page);
  }
  const tradeoffs = page.locator('textarea');
  await tradeoffs.nth(0).fill(text('tradeoff-A'));
  await tradeoffs.nth(1).fill(text('tradeoff-B'));
  await page.locator('select').nth(0).selectOption('Costly to reverse');
  await page.locator('select').nth(1).selectOption('Not yet known');
  if (info) await axe(page);
  await capture(page, info, 'practical');
  await next(page);
  await page.locator('#dr-uncertainty').fill(text('uncertainty'));
  await next(page);
}
async function review(page: Page, info?: TestInfo) {
  await compare(page, info);
  await expect(page.locator('input:checked')).toHaveCount(0);
  await page.getByRole('radio', { name: 'I am ready to choose.', exact: true }).check();
  if (info) await axe(page);
  await next(page);
  await expect(page.locator('input:checked')).toHaveCount(0);
  await page.getByRole('radio').nth(1).check();
  if (info) await axe(page);
  await capture(page, info, 'choice');
  await next(page);
  await page.locator('#dr-rationale').fill(text('rationale'));
  await page.locator('#dr-firstMove').fill(text('firstMove'));
  await capture(page, info, 'reason');
  await page.getByRole('button', { name: 'Review my decision' }).click();
}
async function finish(page: Page, info?: TestInfo) {
  await review(page, info);
  if (info) await axe(page);
  await capture(page, info, 'review');
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  await expect(page.locator('.decision-record')).toBeVisible();
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Decision Record');
  await axe(page);
  await page.getByRole('button', { name: 'Save this record', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Saved on this device.');
}
async function saved(page: Page) {
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
}
async function clearAll(page: Page) {
  await page.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await page.getByRole('button', { name: 'Delete all Only Empowerment data', exact: true }).click();
}

test('full PERIOD comparison, explicit choice, exact authored record, editable review and accessible states', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await review(page, info);
  await page.locator('#dr-rationale').fill('');
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  await expect(page.locator('#dr-rationale')).toBeFocused();
  await expect(page.getByRole('alert')).toContainText('Add');
  await page.locator('#dr-rationale').fill(text('revised rationale'));
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  await axe(page);
  await capture(page, info, 'record');
  const record = page.locator('.decision-record');
  await expect(record).toContainText('Status: Decided');
  for (const f of ['decision', 'matters', ...fields, 'uncertainty', 'firstMove'])
    await expect(record).toContainText(`${marker}-${f}`);
  await expect(record.locator('script,img,a')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.getByRole('button', { name: 'Edit record', exact: true }).click();
  await expect(page.locator('#dr-rationale')).toHaveValue(text('revised rationale'));
  await expect(page.getByRole('radio').nth(1)).toBeChecked();
});
test('option bounds, add/remove focus, deletion confirmation, back navigation and no automatic wait', async ({
  page,
}) => {
  await page.goto('/#/tools/decision-room');
  await next(page);
  await expect(page.locator('#dr-decision')).toBeFocused();
  await page.locator('#dr-decision').fill(text('decision'));
  await next(page);
  await expect(page.getByRole('textbox')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Remove option' })).toHaveCount(0);
  await next(page);
  await expect(page.getByRole('alert')).toHaveCount(2);
  await page.getByLabel('Option 1', { exact: true }).fill('x'.repeat(301));
  await next(page);
  await expect(page.getByRole('alert').first()).toContainText('not been shortened');
  await expect(page.getByLabel('Option 1', { exact: true })).toHaveValue('x'.repeat(301));
  await page.getByLabel('Option 1', { exact: true }).fill('First');
  await page.getByLabel('Option 2', { exact: true }).fill('Second');
  await page.getByRole('button', { name: 'Add an option' }).click();
  await expect(page.getByLabel('Option 3', { exact: true })).toBeFocused();
  await page.getByLabel('Option 3', { exact: true }).fill('Wait, authored by me');
  await page.getByRole('button', { name: 'Add an option' }).click();
  await expect(page.getByRole('button', { name: 'Add an option' })).toBeDisabled();
  await page.getByRole('button', { name: 'Remove option 4', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add an option' })).toBeFocused();
  await page.getByRole('button', { name: 'Remove option 3', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await axe(page);
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Option 3', { exact: true })).toHaveValue('Wait, authored by me');
  await page.getByRole('button', { name: 'Remove option 3', exact: true }).click();
  await page.getByRole('button', { name: 'Remove option', exact: true }).click();
  await next(page);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Option 1', { exact: true })).toHaveValue('First');
});
test('all legitimate readiness pauses stay undecided and preserve reflections', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await compare(page);
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Choose');
  for (const reason of [
    'I need more information.',
    'I need professional or personal guidance.',
    'A prerequisite is unresolved.',
    'Safety needs consideration.',
    'The options are not clear enough.',
    'Circumstances changed.',
    'I am not ready to choose.',
  ]) {
    await page.getByRole('radio', { name: reason, exact: true }).check();
    await page.getByRole('button', { name: 'Pause here', exact: true }).click();
    await expect(page.locator('.decision-record')).toHaveCount(0);
    await expect(page.locator('.pause-panel')).toContainText(reason);
    await axe(page);
    await capture(page, info, 'pause');
    await page.getByRole('button', { name: 'Return to readiness' }).click();
  }
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#dr-uncertainty')).toHaveValue(text('uncertainty'));
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test('copy success and manual fallback preserve plain text and truthful status', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    }),
  );
  await finish(page);
  await page.getByRole('button', { name: 'Copy record', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Decision Record copied.');
  const copied = await page.evaluate(() => (window as unknown as { copied: string }).copied);
  expect(copied).toContain('ONLY EMPOWERMENT\nDecision Record');
  expect(copied).toContain(text('ownership'));
  expect(copied.endsWith('Status\nDecided')).toBe(true);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(Error('denied')) },
    }),
  );
  await page.getByRole('button', { name: 'Copy record', exact: true }).click();
  await expect(page.getByLabel('Decision Record plain text')).toBeFocused();
  await expect(page.getByLabel('Decision Record plain text')).toHaveValue(copied);
  await axe(page);
});
test('mixed explicit saves, old-card compatibility, reopen edit, record deletion, and all-data removal', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await finish(page);
  await save(page);
  await page.evaluate(() => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    localStorage.setItem(
      'oe:execution-card:v1:' + id,
      JSON.stringify({
        schemaVersion: 1,
        id,
        tool: 'next-move',
        status: 'Planned',
        card: {
          situation: 'Existing card',
          action: 'Keep existing action',
          start: 'After lunch',
          obstacle: 'None apparent',
          completion: 'Sent',
        },
      }),
    );
    localStorage.setItem('unrelated', 'keep');
  });
  await saved(page);
  await expect(page.locator('.saved-list li')).toHaveCount(2);
  await expect(page.locator('.saved-list')).toContainText('Decision Record');
  await expect(page.locator('.saved-list')).toContainText('Execution Card');
  await axe(page);
  await capture(page, info, 'mixed-saved');
  await page.getByRole('button', { name: /Open Decision Record/ }).click();
  await page.getByRole('button', { name: 'Open saved record', exact: true }).click();
  await page.getByRole('button', { name: 'Edit record' }).click();
  await page.locator('#dr-firstMove').fill('User changed first move');
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  await page.getByRole('button', { name: 'Save changes on this device' }).click();
  await page.getByRole('button', { name: 'Save these changes' }).click();
  await saved(page);
  await expect(page.locator('.saved-list')).toContainText('User changed first move');
  await page.getByRole('button', { name: /Open Execution Card/ }).click();
  await expect(page.locator('.artifact-action')).toContainText('Keep existing action');
  await saved(page);
  await page.getByRole('button', { name: /Delete Decision Record/ }).click();
  await axe(page);
  await capture(page, info, 'delete-dialog');
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await expect(page.locator('.saved-list li')).toHaveCount(1);
  await clearAll(page);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['unrelated']);
  await expect(page.getByRole('heading', { name: 'No saved work.' })).toBeVisible();
});
test('private handoff previews editable fields, protects unsaved Next Move, and runs full receiving workflow', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.goto('/#/tools/next-move');
  await page.locator('#field-situation').fill('Unsaved previous Next Move');
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.getByRole('link', { name: /Decision Room/ }).click();
  await finish(page);
  await page.getByRole('button', { name: 'Turn this decision into a Next Move' }).click();
  await axe(page);
  await capture(page, info, 'handoff');
  await page.getByLabel('Action to carry').fill('Edited bridge');
  await page.getByRole('button', { name: 'Continue into Next Move' }).click();
  await expect(page.getByRole('dialog')).toContainText('Unsaved words');
  await axe(page);
  await capture(page, info, 'replace-dialog');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.evaluate(() => {
    location.hash = '/tools/next-move';
  });
  await expect(page.locator('#field-situation')).toHaveValue('Unsaved previous Next Move');
  await page.evaluate(() => {
    location.hash = '/tools/decision-room';
  });
  // Leaving the handoff discards its ephemeral edit; returning must offer a usable record.
  await expect(
    page.getByRole('button', { name: 'Turn this decision into a Next Move' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Turn this decision into a Next Move' }).click();
  await page.getByLabel('Action to carry').fill('Edited bridge');
  await page.getByRole('button', { name: 'Continue into Next Move' }).click();
  await page.getByRole('button', { name: 'Replace and open Next Move' }).click();
  await expect(page.locator('#field-situation')).toHaveValue(text('decision'));
  await expect(page.locator('.storage-notice')).toContainText('Decision Record');
  await capture(page, info, 'receiving');
  await next(page);
  await expect(page.locator('#field-action')).toHaveValue('Edited bridge');
  await page.locator('#field-action').fill('Edited again in Next Move');
  await next(page);
  await expect(page.getByRole('radio', { name: 'The direction is decided' })).not.toBeChecked();
  await page.getByRole('radio', { name: 'The direction is decided' }).check();
  await next(page);
  await page.locator('#field-obstacle').fill('No obstacle apparent');
  await page.getByRole('radio', { name: 'I can plan around' }).check();
  await next(page);
  await page.locator('#field-start').fill('After lunch');
  await next(page);
  await page.locator('#field-completion').fill('Request sent');
  await page.getByRole('button', { name: 'Review my plan' }).click();
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await expect(page.locator('.execution-card')).toContainText('Status: Planned');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(page.url()).not.toContain(marker);
});
test('handoff exclusions and cancel retain the Decision Record with no automatic persistence', async ({
  page,
}) => {
  await finish(page);
  await page.getByRole('button', { name: 'Turn this decision into a Next Move' }).click();
  await page.getByRole('checkbox', { name: 'Include decision as situation' }).uncheck();
  await page.getByRole('checkbox', { name: 'Include first move as action' }).uncheck();
  await page.getByRole('button', { name: 'Cancel handoff' }).click();
  await expect(page.locator('.decision-record')).toContainText(text('decision').trim());
  await page.getByRole('button', { name: 'Turn this decision into a Next Move' }).click();
  await page.getByRole('checkbox', { name: 'Include first move as action' }).uncheck();
  await page.getByRole('button', { name: 'Continue into Next Move' }).click();
  await next(page);
  await expect(page.locator('#field-action')).toHaveValue('');
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Add');
});
test('synthetic markers stay out of requests, links, titles and storage before explicit save', async ({
  page,
  context,
  baseURL,
}) => {
  const requests: { url: string; method: string; data: string | null }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), data: r.postData() }),
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await finish(page);
  expect(
    await page.evaluate(async () => ({
      local: localStorage.length,
      session: sessionStorage.length,
      db: await indexedDB.databases(),
      cache: await caches.keys(),
      workers: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ local: 0, session: 0, db: [], cache: [], workers: 0 });
  expect(await context.cookies()).toEqual([]);
  expect(await page.title()).not.toContain(marker);
  expect(
    (await page.locator('a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))).join(' '),
  ).not.toContain(marker);
  await save(page);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toHaveLength(1);
  expect(keys[0]).toMatch(/^oe:decision-record:v1:/);
  await saved(page);
  await clearAll(page);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(errors).toEqual([]);
  expect(
    requests.every(
      (r) =>
        r.method === 'GET' &&
        new URL(r.url).origin === new URL(baseURL!).origin &&
        !JSON.stringify(r).includes(marker),
    ),
  ).toBe(true);
});
test('mixed-tab deletion clears open Decision Records, dialogs, copy fallbacks and memory-only work', async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  await finish(page);
  await save(page);
  const second = await context.newPage();
  await second.goto('/#/saved');
  await second.getByRole('button', { name: /Open Decision Record/ }).click();
  await second.getByRole('button', { name: 'Save changes on this device' }).click();
  await saved(page);
  await page.getByRole('button', { name: /Delete Decision Record/ }).click();
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await expect(second.locator('#dr-decision')).toHaveValue('');
  await expect(second.getByRole('dialog')).toHaveCount(0);
  await second.locator('#dr-decision').fill('Unsaved in another tab');
  await clearAll(page);
  await expect(second.locator('#dr-decision')).toHaveValue('');
  await second.close();
});
test('long content reflows at all widths, enlarged text, forced colors, reduced motion and multipage print', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await review(page);
  for (const f of ['decision', 'matters', ...fields, 'uncertainty', 'rationale'])
    await page
      .locator('#dr-' + f)
      .fill(`${text(f)}\n` + 'Long reflection about both alternatives. '.repeat(35));
  await page.getByLabel('Option 1', { exact: true }).fill('x'.repeat(300));
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await capture(page, info, 'record-' + width);
  }
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await axe(page);
  await capture(page, info, 'forced-colors');
  await page.emulateMedia({ forcedColors: 'none' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture(page, info, 'text-200');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.decision-record')).toBeVisible();
  for (const selector of ['.site-header', '.staging-banner', '.artifact-actions', '.site-footer'])
    await expect(page.locator(selector)).toBeHidden();
  await capture(page, info, 'print');
  if (info.project.name === 'chromium')
    await page.pdf({
      path: info.outputPath('decision-record-long.pdf'),
      format: 'A4',
      printBackground: false,
    });
});
test('keyboard path, memory navigation, storage failures, and reload behavior are honest', async ({
  page,
}) => {
  await page.goto('/#/tools/decision-room');
  await page.keyboard.press('Tab');
  await page.getByRole('textbox').focus();
  await page.keyboard.type('Keyboard decision');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Option 1', { exact: true })).toBeFocused();
  await page.keyboard.type('First');
  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  await page.goBack();
  await expect(page.getByLabel('Option 1', { exact: true })).toHaveValue('First');
  await page.reload();
  await expect(page.locator('#dr-decision')).toHaveValue('');
  await finish(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this record', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('could not be verified');
  await expect(page.locator('.decision-record')).toBeVisible();
});

test('option editing and handoff fit narrow viewports, and removing a chosen option requires a new choice', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await review(page);
  await page.getByRole('button', { name: 'Add an option' }).click();
  await page.getByLabel('Option 3', { exact: true }).fill('A third real alternative');
  await page.getByRole('button', { name: 'Remove option 2', exact: true }).click();
  await page.getByRole('button', { name: 'Remove option', exact: true }).click();
  await expect(page.locator('.neutral-options input:checked')).toHaveCount(0);
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  await expect(page.getByRole('alert')).toContainText(['Add', 'Choose', 'Select']);
  await page.locator('textarea[id^="dr-tradeoff-"]').last().fill('Costs time. Unknown response.');
  await page.locator('select').last().selectOption('Not yet known');
  await page.locator('#dr-choice').focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#dr-choice')).toBeChecked();
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await capture(page, info, 'review-options-' + width);
  }
  await page.getByRole('button', { name: 'Confirm my decision' }).click();
  await page.getByRole('button', { name: 'Turn this decision into a Next Move' }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await axe(page);
  await capture(page, info, 'handoff-320');
  await info.attach('handoff-accessibility-tree', {
    body: await page.locator('main').ariaSnapshot(),
    contentType: 'text/plain',
  });
});

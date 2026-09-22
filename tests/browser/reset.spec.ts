import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  resetFields,
  resetLabels,
  resetText,
  type ResetPlan,
  type ResetField,
} from '../../src/reset-model';
import { standardFields } from '../../src/standard-model';
import { emptyDecision, decisionFields } from '../../src/decision-room-model';
const marker = 'OE-RESET-PRIVATE-20260922';
const authored = (f: string) =>
  `  ${marker}-${f} <script>alert("'🧭")</script> & <img src=x> e\u0301 👩🏽‍💻\nNext real opportunity today.  `;
const data = Object.fromEntries(resetFields.map((f) => [f, authored(f)])) as ResetPlan;
const sourceId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const sourceKey = 'oe:personal-standard:v1:' + sourceId;
const sourceStandard = Object.fromEntries(
  standardFields.map((f) => [
    f,
    f === 'keeping' || f === 'violations' ? [authored('source-' + f)] : authored('source-' + f),
  ]),
);
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function next(page: Page) {
  await page.getByRole('button', { name: 'Next', exact: true }).click();
}
async function capture(page: Page, info: TestInfo, name: string) {
  if (['chromium', 'mobile-chromium'].includes(info.project.name))
    await page.screenshot({ path: info.outputPath('reset-' + name + '.png'), fullPage: true });
}
async function seed(page: Page) {
  const d = emptyDecision();
  for (const f of decisionFields) d[f] = 'Existing decision ' + f;
  d.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  d.chosenId = d.options[0].id;
  await page.evaluate(
    ({ standard, decision }) => {
      const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        c = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
      localStorage.setItem(
        'oe:execution-card:v1:' + a,
        JSON.stringify({
          schemaVersion: 1,
          id: a,
          tool: 'next-move',
          status: 'Planned',
          card: {
            situation: 'Existing card',
            action: 'Existing action',
            start: 'After lunch',
            obstacle: 'Delay',
            completion: 'Sent',
          },
        }),
      );
      localStorage.setItem(
        'oe:decision-record:v1:' + b,
        JSON.stringify({
          schemaVersion: 1,
          id: b,
          tool: 'decision-room',
          status: 'Decided',
          decision,
        }),
      );
      localStorage.setItem(
        'oe:personal-standard:v1:' + c,
        JSON.stringify({
          schemaVersion: 1,
          id: c,
          tool: 'build-a-standard',
          status: 'Set',
          standard,
        }),
      );
      localStorage.setItem('unrelated', 'keep');
    },
    { standard: sourceStandard, decision: d },
  );
}
async function begin(page: Page) {
  await page.goto('/#/tools/reset');
  await page.locator('#reset-slip').fill(data.slip);
  await next(page);
}
async function manual(page: Page, values = data) {
  await page.getByLabel('State the standard myself', { exact: true }).check();
  await page.locator('#reset-standard').fill(values.standard);
  await page.getByLabel('The standard still stands.', { exact: true }).check();
  await next(page);
}
async function rest(page: Page, values = data, info?: TestInfo) {
  for (const f of ['ownership', 'weakPoint', 'correction', 'structure', 'proof'] as const) {
    await page.locator('#reset-' + f).fill(values[f]);
    if (info) {
      await axe(page);
      await capture(page, info, f);
    }
    await page
      .getByRole('button', { name: f === 'proof' ? 'Review my Reset Plan' : 'Next', exact: true })
      .click();
  }
}
async function review(page: Page, values = data) {
  await page.goto('/#/tools/reset');
  await page.locator('#reset-slip').fill(values.slip);
  await next(page);
  await manual(page, values);
  await rest(page, values);
}
async function finish(page: Page, values = data) {
  await review(page, values);
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).click();
  await expect(page.locator('.reset-plan')).toContainText('Status: Planned');
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this plan', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Saved on this device.');
}
async function saved(page: Page) {
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
}
async function openPlan(page: Page) {
  await page.getByRole('button', { name: /Open Reset Plan/ }).click();
  await expect(page.getByRole('dialog').or(page.locator('.reset-plan'))).toBeVisible();
  if (await page.getByRole('dialog').isVisible())
    await page.getByRole('button', { name: 'Open saved record', exact: true }).click();
  await expect(page.locator('.reset-plan')).toBeVisible();
}
async function edit(page: Page, f: ResetField) {
  await page
    .getByRole('button', { name: 'Edit ' + resetLabels[f].toLowerCase(), exact: true })
    .click();
}
async function clearAll(page: Page) {
  await page.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await page.getByRole('button', { name: 'Delete all Only Empowerment data', exact: true }).click();
}

test('Reset full manual workflow, exact authorship, all editable sections, standing recheck and axe', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await begin(page);
  await axe(page);
  await capture(page, info, 'manual-standard');
  await manual(page);
  await rest(page, data, info);
  await axe(page);
  await capture(page, info, 'review');
  for (const f of resetFields) {
    await edit(page, f);
    await expect(page.locator('#reset-' + f)).toBeFocused();
    await page.locator('#reset-' + f).fill(authored('edited-' + f));
    await page
      .getByRole('button', { name: 'Done editing ' + resetLabels[f].toLowerCase(), exact: true })
      .click();
    if (f === 'standard') {
      await expect(
        page.getByLabel('The standard still stands.', { exact: true }),
      ).not.toBeChecked();
      await next(page);
      await expect(page.getByRole('alert')).toContainText('Choose whether');
      await page.getByLabel('The standard still stands.', { exact: true }).check();
      await next(page);
    }
  }
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).click();
  await expect(page.locator('.reset-plan')).toContainText('Status: Planned');
  await expect(page.locator('.reset-plan')).toContainText('does not mean the correction happened');
  await expect(
    page.locator(
      '.reset-plan script,.reset-plan img,.reset-plan a,.reset-plan textarea,.reset-plan button',
    ),
  ).toHaveCount(0);
  for (const f of resetFields)
    await expect(page.locator(`.reset-${f} .answer`)).toHaveJSProperty(
      'textContent',
      authored('edited-' + f),
    );
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await axe(page);
  await capture(page, info, 'record');
});
test('miss bounds, empty required answers, back navigation and internal memory with reload loss', async ({
  page,
}) => {
  await page.goto('/#/tools/reset');
  await next(page);
  await expect(page.locator('#reset-slip')).toBeFocused();
  await page.locator('#reset-slip').fill('x'.repeat(2001));
  await next(page);
  await expect(page.getByRole('alert')).toContainText('not been shortened');
  await expect(page.locator('#reset-slip')).toHaveValue('x'.repeat(2001));
  await page.locator('#reset-slip').fill(data.slip);
  await next(page);
  await next(page);
  await expect(page.locator('#source-manual')).toBeFocused();
  await manual(page);
  for (const f of ['ownership', 'weakPoint', 'correction', 'structure', 'proof']) {
    await page
      .getByRole('button', { name: f === 'proof' ? 'Review my Reset Plan' : 'Next', exact: true })
      .click();
    await expect(page.locator('#reset-' + f)).toBeFocused();
    await page.locator('#reset-' + f).fill(data[f as ResetField]);
    await page
      .getByRole('button', { name: f === 'proof' ? 'Review my Reset Plan' : 'Next', exact: true })
      .click();
  }
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#reset-proof')).toHaveValue(data.proof);
  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  await page.goBack();
  await expect(page.locator('#reset-proof')).toHaveValue(data.proof);
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#reset-proof')).toHaveValue(data.proof);
  await page.reload();
  await expect(page.locator('#reset-slip')).toHaveValue('');
});
for (const choice of ['unclear', 'review', 'unsure'])
  test(`Reset ${choice} pause creates no plan and preserves memory through Build a Standard`, async ({
    page,
  }, info) => {
    await begin(page);
    if (choice === 'unclear') await page.locator('#source-unclear').check();
    else {
      await page.locator('#source-manual').check();
      await page.locator('#reset-standard').fill(data.standard);
      await page.locator('#standing-' + choice).check();
    }
    await next(page);
    await expect(page.locator('.pause-panel')).toBeVisible();
    await expect(page.locator('.reset-plan')).toHaveCount(0);
    await axe(page);
    await capture(page, info, 'pause-' + choice);
    await page.getByRole('link', { name: 'Open Build a Standard', exact: true }).click();
    await expect(page.locator('#ps-area')).toBeVisible();
    await page.locator('#ps-area').fill('Other tool work');
    await page.goBack();
    await expect(page.locator('.pause-panel')).toBeVisible();
    await page.getByRole('button', { name: 'Return to the standard check', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.locator('#reset-slip')).toHaveValue(data.slip);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
  });
test('saved standards require explicit selection, show read-only reference and never mutate source', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  await page.evaluate(
    ({ key }) => {
      const original = JSON.parse(localStorage.getItem(key)!);
      original.id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
      original.standard.area = 'Second standard';
      localStorage.setItem('oe:personal-standard:v1:' + original.id, JSON.stringify(original));
    },
    { key: sourceKey },
  );
  const before = await page.evaluate(() => Object.entries(localStorage));
  await begin(page);
  await page.locator('#source-saved').check();
  await expect(page.locator('#saved-standard')).toHaveValue('');
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Select a saved');
  await expect(page.locator('#saved-standard option')).toHaveCount(3);
  await page.locator('#saved-standard').selectOption(sourceKey);
  await expect(page.locator('#reset-standard')).toHaveValue(sourceStandard.standard as string);
  await expect(page.locator('.reset-reference input,.reset-reference textarea')).toHaveCount(0);
  await page.getByText('View selected standard reference', { exact: true }).click();
  await expect(page.locator('.reset-reference')).toContainText('Read-only snapshot');
  await axe(page);
  await capture(page, info, 'saved-standard');
  await page.locator('#standing-stands').check();
  await next(page);
  await rest(page);
  await edit(page, 'standard');
  await page.locator('#reset-standard').fill('Reviewed snapshot line');
  await page
    .getByRole('button', { name: 'Confirm Reset Plan', exact: true })
    .count()
    .then((n) => expect(n).toBe(0));
  await page.getByRole('button', { name: 'Check the standard again', exact: true }).click();
  await expect(page.locator('#standing-stands')).not.toBeChecked();
  await page.locator('#standing-stands').check();
  await next(page);
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).click();
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual(before);
  await save(page);
  const records = await page.evaluate(() => Object.entries(localStorage));
  expect(Object.fromEntries(records.filter(([k]) => !k.startsWith('oe:reset-plan')))).toEqual(
    Object.fromEntries(before),
  );
  const reset = JSON.parse(records.find(([k]) => k.startsWith('oe:reset-plan'))![1]);
  expect(reset.plan.standard).toBe('Reviewed snapshot line');
  expect(Object.keys(reset)).toEqual(['schemaVersion', 'id', 'tool', 'status', 'plan']);
  await page.evaluate((key) => localStorage.removeItem(key), sourceKey);
  await page.reload();
  await saved(page);
  await openPlan(page);
  await expect(page.locator('.reset-standard .answer')).toHaveText('Reviewed snapshot line');
});
test('no saved standards remains a usable manual or pause path', async ({ page }) => {
  await begin(page);
  await page.locator('#source-saved').check();
  await expect(
    page.getByText('No saved Personal Standards are available.', { exact: false }),
  ).toBeVisible();
  await next(page);
  await expect(page.locator('.reset-plan')).toHaveCount(0);
  await manual(page);
  await expect(page.locator('#reset-ownership')).toBeVisible();
});
test('copy success, manual fallback and print use exact Reset Plan text', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as any).copied = value;
        },
      },
    });
    window.print = () => {
      (window as any).printed = true;
    };
  });
  await finish(page);
  await page.getByRole('button', { name: 'Copy plan', exact: true }).click();
  expect(await page.evaluate(() => (window as any).copied)).toBe(resetText(data));
  await page.getByRole('button', { name: 'Print plan', exact: true }).click();
  expect(await page.evaluate(() => (window as any).printed)).toBe(true);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(Error('denied')) },
    }),
  );
  await page.getByRole('button', { name: 'Copy plan', exact: true }).click();
  await expect(page.getByLabel('Reset Plan plain text')).toBeFocused();
  await expect(page.getByLabel('Reset Plan plain text')).toHaveValue(resetText(data));
  expect(
    await page
      .getByLabel('Reset Plan plain text')
      .evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart),
  ).toBe(resetText(data).length);
  await axe(page);
});
test('explicit save, four artifact Saved Work, reopen edit save and scoped deletion', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await finish(page);
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await axe(page);
  await capture(page, info, 'save-dialog');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await save(page);
  await seed(page);
  const before = await page.evaluate(() =>
    Object.fromEntries(
      Object.entries(localStorage).filter(([k]) => !k.startsWith('oe:reset-plan')),
    ),
  );
  await saved(page);
  await expect(page.locator('.saved-list > li')).toHaveCount(4);
  await axe(page);
  await capture(page, info, 'four-artifacts');
  await openPlan(page);
  await page.getByRole('button', { name: 'Edit plan', exact: true }).click();
  await edit(page, 'proof');
  await page
    .locator('#reset-proof')
    .fill('At the next scheduled conversation, hold the agreed boundary.');
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).click();
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((v) => v.includes('At the next scheduled conversation')),
    ),
  ).toBe(false);
  await page.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save these changes', exact: true }).click();
  await page.reload();
  await saved(page);
  await openPlan(page);
  await expect(page.locator('.reset-proof .answer')).toContainText(
    'At the next scheduled conversation',
  );
  expect(
    await page.evaluate(() =>
      Object.fromEntries(
        Object.entries(localStorage).filter(([k]) => !k.startsWith('oe:reset-plan')),
      ),
    ),
  ).toEqual(before);
  await saved(page);
  await page.getByRole('button', { name: /Delete Reset Plan/ }).click();
  await axe(page);
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await expect(page.locator('.saved-list > li')).toHaveCount(3);
  await page.evaluate(() => {
    localStorage.setItem('oe:reset-plan:v9:future', '{}');
    localStorage.setItem('oe:broken', '{');
  });
  await page.reload();
  await expect(page.getByText(/2 unreadable or unsupported/)).toBeVisible();
  await clearAll(page);
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([['unrelated', 'keep']]);
});
test('all authored markers and saved-standard selection remain off network links titles and unexpected storage', async ({
  page,
  context,
}) => {
  const requests: any[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), body: r.postData(), method: r.method() }),
  );
  await finish(page);
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(async () => ({
      db: (await indexedDB.databases()).length,
      caches: (await caches.keys()).length,
      workers: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ db: 0, caches: 0, workers: 0 });
  expect(await page.title()).not.toContain(marker);
  expect(
    (await page.locator('a').evaluateAll((es) => es.map((e) => e.href))).join('\n'),
  ).not.toContain(marker);
  await save(page);
  const entries = await page.evaluate(() => Object.entries(localStorage));
  expect(entries).toHaveLength(1);
  expect(entries[0][0]).toMatch(/^oe:reset-plan:v1:/);
  expect(JSON.parse(entries[0][1]).plan).toEqual(data);
  await seed(page);
  await saved(page);
  await page.goBack();
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Clear current work', exact: true })
    .click();
  await page.locator('#reset-slip').fill(data.slip);
  await next(page);
  await page.locator('#source-saved').check();
  await page.locator('#saved-standard').selectOption(sourceKey);
  expect(JSON.stringify(requests)).not.toContain(marker);
  expect(
    requests.every(
      (r) => r.method === 'GET' && new URL(r.url).origin === new URL(page.url()).origin,
    ),
  ).toBe(true);
  await saved(page);
  await clearAll(page);
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([['unrelated', 'keep']]);
});
test('mixed quota, denied storage and quota failure retain the unsaved plan honestly', async ({
  page,
}) => {
  await finish(page);
  await seed(page);
  await page.evaluate(() => {
    for (let i = 0; i < 47; i++) localStorage.setItem('oe:future:' + i, '{}');
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this plan', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('50 saved Only Empowerment records');
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('oe:future'))
      .forEach((k) => localStorage.removeItem(k));
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this plan', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('could not be verified');
  await expect(page.locator('.reset-plan')).toContainText(marker);
  await page.evaluate(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw Error('denied');
      },
    }),
  );
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this plan', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('could not be verified');
  await saved(page);
  await clearAll(page);
  await expect(page.getByText(/local storage deletion could not be verified/)).toBeVisible();
});
test('cross-tab deletion with storage-event fallback clears edits and lists without resurrection', async ({
  page,
  context,
}) => {
  await context.addInitScript(() =>
    Object.defineProperty(window, 'BroadcastChannel', { value: undefined }),
  );
  await finish(page);
  await save(page);
  const other = await context.newPage();
  await other.goto('/#/saved');
  await openPlan(other);
  await other.getByRole('button', { name: 'Edit plan', exact: true }).click();
  await edit(other, 'ownership');
  await other.locator('#reset-ownership').fill('Unsaved stale words');
  const listing = await context.newPage();
  await listing.goto('/#/saved');
  await saved(page);
  await page.getByRole('button', { name: /Delete Reset Plan/ }).click();
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await expect(other.locator('#reset-slip')).toHaveValue('');
  await expect(listing.locator('.saved-list > li')).toHaveCount(0);
  expect(await other.evaluate(() => localStorage.length)).toBe(0);
});
test('changed saved bytes refuse overwrite and BroadcastChannel clears memory-only Reset work', async ({
  page,
  context,
}) => {
  await finish(page);
  await save(page);
  const other = await context.newPage();
  await other.goto('/#/saved');
  await openPlan(other);
  await page.evaluate(() => {
    const key = Object.keys(localStorage)[0],
      r = JSON.parse(localStorage.getItem(key)!);
    r.plan.proof = 'Other tab proof';
    localStorage.setItem(key, JSON.stringify(r));
  });
  await other.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await other.getByRole('button', { name: 'Save these changes', exact: true }).click();
  await expect(other.locator('.work-status')).toContainText('changed or was deleted');
  await saved(page);
  await clearAll(page);
  await expect(other.locator('#reset-slip')).toHaveValue('');
  await other.locator('#reset-slip').fill('Memory only');
  await clearAll(page);
  await expect(other.locator('#reset-slip')).toHaveValue('');
});
test('visibility recheck catches a saved Reset removed while suspended', async ({ page }) => {
  await finish(page);
  await save(page);
  await page.evaluate(() => {
    Object.keys(localStorage).forEach((k) => localStorage.removeItem(k));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#reset-slip')).toHaveValue('');
});
test('keyboard-only manual Reset, focus, choices, review and dialogs', async ({ page }) => {
  await page.goto('/#/tools/reset');
  await page.locator('#reset-slip').focus();
  await page.keyboard.type('I did not complete the promised task.');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#source-manual')).toBeFocused();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await expect(page.locator('#reset-standard')).toBeFocused();
  await page.keyboard.type('I complete the task at the agreed time.');
  await page.keyboard.press('Tab');
  await expect(page.locator('#standing-stands')).toBeFocused();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  for (const f of ['ownership', 'weakPoint', 'correction', 'structure', 'proof']) {
    await page.locator('#reset-' + f).focus();
    await page.keyboard.type('I will complete the next action today.');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  }
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Save on this device', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.work-status')).toHaveText('Saved on this device.');
  await axe(page);
});
test('Reset stages selector pause review artifact and saved work reflow at five widths', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto('/');
  await seed(page);
  await page.evaluate(
    ({ key }) => {
      const r = JSON.parse(localStorage.getItem(key)!);
      r.standard = {
        area: 'Communication under pressure',
        standard: 'When I need time before answering, I say so and agree when I will return.',
        reason: 'People can plan around an honest answer.',
        keeping: ['Name the pause and agree a return time.'],
        violations: ['Leave the conversation without an agreement.'],
        structure: 'Put the return time in my calendar.',
        adaptation: 'Review the arrangement when responsibilities change.',
        nonNegotiation: 'Discomfort alone does not change the agreement.',
        correction: 'Acknowledge the missed agreement and arrange the next conversation.',
      };
      localStorage.setItem(key, JSON.stringify(r));
    },
    { key: sourceKey },
  );
  const example = {
    ownership: 'I stepped away without agreeing when I would return.',
    weakPoint: 'I had no prepared way to ask for a pause when the conversation became difficult.',
    correction:
      'Contact the person today, acknowledge the missed agreement, and arrange the next conversation.',
    structure: 'Prepare a clear pause request and put any agreed return time in my calendar.',
    proof:
      'At the next conversation this afternoon, state the pause and agree a return time before stepping away.',
  };
  await page.goto('/#/tools/reset');
  await page
    .locator('#reset-slip')
    .fill('I left a difficult conversation without saying when I would return.');
  await next(page);
  await page.locator('#source-saved').check();
  await page.locator('#saved-standard').selectOption(sourceKey);
  async function sizes(name: string) {
    for (const width of [320, 360, 390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width === 320 || width === 1440) await capture(page, info, name + '-' + width);
    }
    await axe(page);
  }
  await sizes('selector');
  await page.getByText('View selected standard reference', { exact: true }).click();
  await sizes('reference');
  await page.getByText('View selected standard reference', { exact: true }).click();
  await page.locator('#standing-review').check();
  await next(page);
  await sizes('pause');
  await page.getByRole('button', { name: 'Return to the standard check', exact: true }).click();
  await page.locator('#standing-stands').check();
  await next(page);
  for (const f of ['ownership', 'weakPoint', 'correction', 'structure', 'proof'] as const) {
    await page.locator('#reset-' + f).fill(example[f]);
    await sizes(f);
    await page
      .getByRole('button', { name: f === 'proof' ? 'Review my Reset Plan' : 'Next', exact: true })
      .click();
  }
  await sizes('review');
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).click();
  await sizes('artifact');
  await save(page);
  await saved(page);
  await sizes('saved');
});
test('long Unicode text, 200 percent text, 400 percent equivalent reflow, forced colors reduced motion and print', async ({
  page,
  browserName,
}, info) => {
  test.setTimeout(90000);
  const values = {
    ...data,
    standard: 'W'.repeat(2000),
    proof: '👩🏽‍💻'.repeat(100) + ' e\u0301\nAt the next opportunity today.',
    structure: 'Structure. '.repeat(160),
  };
  await finish(page, values);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await axe(page);
  await capture(page, info, 'forced-colors');
  await page.emulateMedia({ forcedColors: 'none' });
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath('reset-text-200.png'), fullPage: false });
  await page.evaluate(() => (document.documentElement.style.fontSize = ''));
  await expect(page.locator('.reset-standard .answer')).toHaveJSProperty(
    'textContent',
    values.standard,
  );
  await expect(page.locator('.reset-proof .answer')).toHaveJSProperty('textContent', values.proof);
  await page.setViewportSize({ width: 800, height: 1000 });
  await page.emulateMedia({ media: 'print' });
  for (const c of ['.site-header', '.staging-banner', '.artifact-actions', '.work-footer'])
    await expect(page.locator(c)).toBeHidden();
  await expect(page.locator('.reset-plan')).toBeVisible();
  await capture(page, info, 'print');
  if (browserName === 'chromium' && info.project.name === 'chromium')
    await page.pdf({
      path: info.outputPath('reset-plan-long.pdf'),
      format: 'A4',
      printBackground: false,
    });
});

test('deliberately reviewed saved standard is reloaded explicitly without losing Reset work', async ({
  page,
}) => {
  await page.goto('/');
  await seed(page);
  await begin(page);
  await page.locator('#source-saved').check();
  await page.locator('#saved-standard').selectOption(sourceKey);
  await page.locator('#standing-review').check();
  await next(page);
  await page.getByRole('link', { name: 'Open Build a Standard', exact: true }).click();
  await saved(page);
  await page.getByRole('button', { name: /Open Personal Standard/ }).click();
  await page.getByRole('button', { name: 'Edit standard', exact: true }).click();
  await page.getByRole('button', { name: 'Edit my standard', exact: true }).click();
  await page.locator('#ps-standard').fill('A deliberately reviewed behavioral line.');
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save these changes', exact: true }).click();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.locator('.tool-card[href="#/tools/reset"]').click();
  await expect(page.locator('.pause-panel')).toBeVisible();
  await page.getByRole('button', { name: 'Return to the standard check', exact: true }).click();
  await expect(page.locator('#reset-standard')).toHaveValue(sourceStandard.standard as string);
  await page.getByRole('button', { name: 'Reload selected standard', exact: true }).click();
  await expect(page.locator('#reset-standard')).toHaveValue(
    'A deliberately reviewed behavioral line.',
  );
  await expect(page.locator('#standing-stands')).not.toBeChecked();
  await page.locator('#standing-stands').check();
  await next(page);
  await rest(page);
  await expect(page.locator('.reset-slip .answer')).toHaveJSProperty('textContent', data.slip);
  await page.getByRole('button', { name: 'Confirm Reset Plan', exact: true }).click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).standard.standard,
      sourceKey,
    ),
  ).toBe('A deliberately reviewed behavioral line.');
});

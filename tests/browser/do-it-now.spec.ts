import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { actionText, resultPrompts, type ActionStatus } from '../../src/do-it-now-model';
import { emptyDecision, decisionFields } from '../../src/decision-room-model';
import { standardFields } from '../../src/standard-model';
import { resetFields } from '../../src/reset-model';
import { rebuildFields } from '../../src/rebuild-model';
const marker = 'OE-ACTION-PRIVATE-20260925';
const words = (f: string) =>
  `  ${marker}-${f} <script>"'🧭</script> <img src=x> e\u0301 👩🏽‍💻\nOwn words.  `;
const record = {
  task: words('task'),
  firstAction: words('first'),
  beginState: 'Started' as const,
  outcome: words('outcome'),
};
const actionId = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const actionKey = 'oe:action-record:v1:' + actionId;
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function capture(page: Page, info: TestInfo, name: string) {
  if (['chromium', 'mobile-chromium'].includes(info.project.name))
    await page.screenshot({ path: info.outputPath('action-' + name + '.png'), fullPage: true });
}
async function start(page: Page) {
  await page.goto('/#/tools/do-it-now');
  await page.locator('#din-task').fill(record.task);
  await page.locator('#din-firstAction').fill(record.firstAction);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
}
async function begin(page: Page) {
  await page.getByLabel('Yes. I can begin now.', { exact: true }).check();
  await page.getByRole('button', { name: 'Begin now', exact: true }).click();
}
async function result(page: Page, status: ActionStatus = 'Completed') {
  await page.getByLabel(status, { exact: true }).check();
  await expect(page.getByLabel(resultPrompts[status], { exact: true })).toBeVisible();
  await page.locator('#din-outcome').fill(record.outcome);
  await page.getByRole('button', { name: 'Review Action Record', exact: true }).click();
}
async function confirm(page: Page) {
  await page.getByRole('button', { name: 'Confirm Action Record', exact: true }).click();
}
async function complete(page: Page, status: ActionStatus = 'Completed') {
  await start(page);
  await begin(page);
  await result(page, status);
  await confirm(page);
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this record', exact: true }).click();
}
async function seed(page: Page) {
  const decision = emptyDecision();
  for (const f of decisionFields) decision[f] = 'Existing ' + f;
  decision.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  decision.chosenId = decision.options[0].id;
  const records = [
    {
      schemaVersion: 1,
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tool: 'next-move',
      status: 'Planned',
      card: {
        situation: 'Existing card',
        action: words('handoff-action'),
        start: words('handoff-start'),
        completion: words('handoff-completion'),
        obstacle: 'Delay',
      },
    },
    {
      schemaVersion: 1,
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      tool: 'decision-room',
      status: 'Decided',
      decision,
    },
    {
      schemaVersion: 1,
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      tool: 'build-a-standard',
      status: 'Set',
      standard: Object.fromEntries(
        standardFields.map((f) => [
          f,
          ['keeping', 'violations'].includes(f) ? ['Act'] : 'Own ' + f,
        ]),
      ),
    },
    {
      schemaVersion: 1,
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      tool: 'reset',
      status: 'Planned',
      plan: Object.fromEntries(resetFields.map((f) => [f, 'Own ' + f])),
    },
    {
      schemaVersion: 1,
      id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      tool: 'rebuild-map',
      status: 'Mapped',
      map: Object.fromEntries(
        rebuildFields.map((f) => [f, f === 'actions' ? ['Act'] : 'Own ' + f]),
      ),
    },
  ];
  await page.evaluate(
    ({ records }) => {
      const prefixes = [
        'execution-card',
        'decision-record',
        'personal-standard',
        'reset-plan',
        'rebuild-map',
      ];
      records.forEach((r, i) =>
        localStorage.setItem('oe:' + prefixes[i] + ':v1:' + r.id, JSON.stringify(r)),
      );
      localStorage.setItem('unrelated', 'keep');
    },
    { records },
  );
}
async function openCard(page: Page) {
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await page.getByRole('button', { name: /Open Execution Card/ }).click();
}
for (const status of ['Completed', 'Partial', 'Blocked'] as const)
  test(`Do It Now ${status}: explicit begin, result, review, exact artifact, copy, print and save`, async ({
    page,
  }, info) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (t: string) => {
            (window as any).__copied = t;
          },
        },
      }),
    );
    await page.goto('/#/tools/do-it-now');
    await capture(page, info, 'entry-' + status);
    await start(page);
    await capture(page, info, 'begin-' + status);
    await axe(page);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    await expect(
      page.getByRole('button', { name: 'Save on this device', exact: true }),
    ).toHaveCount(0);
    await begin(page);
    await expect(page.getByText('Begin state: Started', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    await axe(page);
    await result(page, status);
    await capture(page, info, 'review-' + status);
    await axe(page);
    await expect(page.getByRole('heading', { name: 'Begin state', exact: true })).toBeVisible();
    await confirm(page);
    await capture(page, info, 'record-' + status);
    await expect(page.locator('.output-card')).toContainText('Status: ' + status);
    await expect(page.locator('.output-card .answer').first()).toHaveText(record.task);
    await axe(page);
    await expect(page.locator('.output-card script,.output-card img')).toHaveCount(0);
    await page.getByRole('button', { name: 'Copy record', exact: true }).click();
    expect(await page.evaluate(() => (window as any).__copied)).toBe(actionText(record, status));
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.site-header')).toBeHidden();
    await expect(page.locator('.staging-banner')).toBeHidden();
    await expect(page.locator('.output-card')).toBeVisible();
    await capture(page, info, 'print-' + status);
    await page.emulateMedia({ media: 'screen' });
    await save(page);
    await expect(page.getByText('Saved on this device.', { exact: true })).toBeVisible();
    const values = await page.evaluate(() => Object.entries(localStorage));
    expect(values).toHaveLength(1);
    expect(values[0][0]).toMatch(/^oe:action-record:v1:/);
    expect(JSON.parse(values[0][1])).toMatchObject({ tool: 'do-it-now', status, record });
    expect(values[0][1]).not.toContain('timer');
  });
test('Do It Now validates empty/oversized input, preserves Back and pauses without beginning', async ({
  page,
}) => {
  await page.goto('/#/tools/do-it-now');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#din-task')).toBeFocused();
  await axe(page);
  await page.locator('#din-task').fill('x'.repeat(2001));
  await page.locator('#din-firstAction').fill('Do the work');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('#din-task')).toHaveValue('x'.repeat(2001));
  await page.locator('#din-task').fill(record.task);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: 'Begin now', exact: true }).click();
  await expect(page.locator('#din-yes')).toBeFocused();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#din-task')).toHaveValue(record.task);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel(/^No\. Something/).check();
  await page.getByLabel('Use an optional timer', { exact: true }).check();
  await page.getByRole('button', { name: 'Pause here', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'You can pause here.' })).toBeVisible();
  await axe(page);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page.locator('.action-timer,.output-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Return to begin check' }).click();
  await expect(page.locator('#din-yes')).not.toBeChecked();
});
test('Do It Now review changes status deliberately and requires appropriate new evidence', async ({
  page,
}) => {
  await start(page);
  await begin(page);
  await page.getByRole('button', { name: 'Review Action Record' }).click();
  await expect(page.locator('#din-Completed')).toBeFocused();
  await page.getByLabel('Completed', { exact: true }).check();
  await page.getByRole('button', { name: 'Review Action Record' }).click();
  await expect(page.locator('#din-outcome')).toBeFocused();
  await page.locator('#din-outcome').fill('x'.repeat(2001));
  await page.getByRole('button', { name: 'Review Action Record' }).click();
  await expect(page.locator('#din-outcome')).toHaveValue('x'.repeat(2001));
  await page.locator('#din-outcome').fill(record.outcome);
  await page.getByRole('button', { name: 'Review Action Record' }).click();
  await page.getByLabel('Partial', { exact: true }).check();
  await expect(page.locator('#din-outcome')).toHaveValue('');
  await expect(page.getByLabel(resultPrompts.Partial, { exact: true })).toBeVisible();
  await confirm(page);
  await expect(page.locator('.output-card')).toHaveCount(0);
  await page.locator('#din-outcome').fill('First part done; second remains.');
  await page.locator('#din-task').fill('Edited task');
  await confirm(page);
  await expect(page.locator('.output-card')).toContainText('Status: Partial');
  await expect(page.locator('.output-card')).toContainText('Edited task');
});
test('Do It Now optional timer is bounded, expires honestly, and never persists or announces ticks', async ({
  page,
}, info) => {
  await page.clock.install();
  await start(page);
  await expect(page.getByLabel('Use an optional timer', { exact: true })).not.toBeChecked();
  await page.getByLabel('Use an optional timer', { exact: true }).check();
  await page.getByLabel('Yes. I can begin now.', { exact: true }).check();
  for (const value of ['0', '61', '1.5', 'abc']) {
    await page.locator('#din-minutes').fill(value);
    await page.getByRole('button', { name: 'Begin now', exact: true }).click();
    await expect(page.locator('#din-minutes')).toBeFocused();
  }
  await page.locator('#din-minutes').fill('1');
  await page.getByRole('button', { name: 'Begin now', exact: true }).click();
  await expect(page.getByLabel('Time remaining')).toHaveText('1:00');
  await expect(page.getByLabel('Time remaining')).toHaveAttribute('aria-live', 'off');
  await capture(page, info, 'timer');
  await page.clock.fastForward(70000);
  await expect(page.getByText('Timer ended. What happened?', { exact: true })).toBeVisible();
  await expect(page.locator('input[name="action-result"]:checked')).toHaveCount(0);
  await expect(page.locator('.output-card')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await axe(page);
  await result(page, 'Blocked');
  await confirm(page);
  await save(page);
  const raw = await page.evaluate(() => localStorage.getItem(Object.keys(localStorage)[0]));
  expect(raw).not.toMatch(/timer|StartedAt|Minutes/);
});
test('Do It Now can report before expiry and reload discards the unsaved timer', async ({
  page,
}) => {
  await start(page);
  await page.getByLabel('Use an optional timer', { exact: true }).check();
  await begin(page);
  await result(page, 'Partial');
  await confirm(page);
  await expect(page.locator('.output-card')).toContainText('Partial');
  await page.reload();
  await expect(page.locator('#din-task')).toHaveValue('');
  await expect(page.locator('.action-timer')).toHaveCount(0);
});
test('Do It Now timer derives elapsed time after navigation away', async ({ page }) => {
  await page.clock.install();
  await start(page);
  await page.getByLabel('Use an optional timer', { exact: true }).check();
  await page.locator('#din-minutes').fill('1');
  await begin(page);
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.clock.fastForward(70000);
  await page.locator('a.tool-card[href="#/tools/do-it-now"]').click();
  await expect(page.getByText('Timer ended. What happened?', { exact: true })).toBeVisible();
  await expect(page.locator('input[name="action-result"]:checked')).toHaveCount(0);
});
test('Do It Now clipboard fallback, cancel clear, confirm clear and save dialog accessibility', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw Error('blocked');
        },
      },
    }),
  );
  await complete(page);
  await page.getByRole('button', { name: 'Copy record' }).click();
  await expect(page.locator('#din-copy')).toHaveValue(actionText(record, 'Completed'));
  await expect(page.locator('#din-copy')).toBeFocused();
  await axe(page);
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await axe(page);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.output-card')).toBeVisible();
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Clear current work', exact: true })
    .click();
  await expect(page.locator('#din-task')).toHaveValue('');
  await expect(page.locator('#din-copy')).toHaveCount(0);
});
test('Do It Now six-artifact Saved Work preserves old bytes, reopens and explicitly saves edited result', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await complete(page, 'Blocked');
  await save(page);
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await expect(page.locator('.saved-list > li')).toHaveCount(6);
  await capture(page, info, 'six-saved');
  await axe(page);
  for (const [k, v] of before)
    expect(await page.evaluate((k) => localStorage.getItem(k), k)).toBe(v);
  await page.getByRole('button', { name: /Open Action Record/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Open saved record', exact: true }).click();
  await page.getByRole('button', { name: 'Edit record', exact: true }).click();
  await page.getByLabel('Completed', { exact: true }).check();
  await page.locator('#din-outcome').fill('Work done.');
  await confirm(page);
  await page.getByRole('button', { name: 'Save changes on this device' }).click();
  await page.getByRole('button', { name: 'Save these changes' }).click();
  await page.reload();
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await page.getByRole('button', { name: /Open Action Record/ }).click();
  await expect(page.locator('.output-card')).toContainText('Status: Completed');
  await expect(page.locator('.output-card')).toContainText('Work done.');
});
test('Do It Now corrupt/future records, quota and scoped deletion retain unrelated data', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('oe:bad', '{');
    localStorage.setItem('oe:action-record:v2:future', '{}');
    localStorage.setItem('unrelated', 'keep');
  });
  await complete(page);
  await save(page);
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await expect(page.getByText(/2 unreadable or unsupported/)).toBeVisible();
  await page.getByRole('button', { name: /Delete Action Record/ }).click();
  await axe(page);
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await expect(page.locator('.saved-list > li')).toHaveCount(0);
  await page.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await page.getByRole('button', { name: 'Delete all Only Empowerment data' }).click();
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([['unrelated', 'keep']]);
});
for (const failure of ['denied', 'quota', 'readback'] as const)
  test(`Do It Now ${failure} storage failure preserves the record and reports honestly`, async ({
    page,
  }) => {
    await complete(page);
    await page.evaluate((f) => {
      if (f === 'denied')
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw Error('denied');
          },
        });
      else
        Storage.prototype.setItem = function () {
          if (f === 'quota') throw new DOMException('full', 'QuotaExceededError');
        };
    }, failure);
    await save(page);
    await expect(page.getByText(/Save could not be verified/)).toBeVisible();
    await expect(page.locator('.output-card')).toBeVisible();
  });
test('Do It Now global 50-record cap includes other types and unsupported records', async ({
  page,
}) => {
  await page.goto('/');
  await seed(page);
  await page.evaluate(() => {
    for (let i = 0; i < 45; i++) localStorage.setItem('oe:future:' + i, '{}');
  });
  await complete(page);
  await save(page);
  await expect(page.getByText(/holds 50 app records/)).toBeVisible();
  expect(
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('oe:')).length),
  ).toBe(50);
});
test('Do It Now changed bytes reject stale writes and another-tab deletion clears open records', async ({
  page,
  context,
}) => {
  await complete(page);
  await save(page);
  const key = await page.evaluate(() => Object.keys(localStorage)[0]);
  const other = await context.newPage();
  await other.goto('/');
  await other.evaluate((k) => {
    const r = JSON.parse(localStorage.getItem(k)!);
    r.record.outcome = 'Other tab';
    localStorage.setItem(k, JSON.stringify(r));
  }, key);
  await page.getByRole('button', { name: 'Edit record', exact: true }).click();
  await page.locator('#din-outcome').fill('Stale edit');
  await confirm(page);
  await page.getByRole('button', { name: 'Save changes on this device' }).click();
  await page.getByRole('button', { name: 'Save these changes' }).click();
  await expect(page.getByText(/This saved record changed or was deleted/)).toBeVisible();
  await other.evaluate((k) => localStorage.removeItem(k), key);
  await expect(page.locator('#din-task')).toHaveValue('');
  await expect(page.locator('.output-card')).toHaveCount(0);
});
test('Do It Now visibility recheck clears a deleted saved record without recreating it', async ({
  page,
}) => {
  await complete(page);
  await save(page);
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) localStorage.removeItem(key);
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#din-task')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test('Do It Now multi-tab Saved Work and delete-all synchronize unsaved current work', async ({
  page,
  context,
}) => {
  await complete(page);
  await save(page);
  const other = await context.newPage();
  await other.goto('/#/saved');
  await expect(other.locator('.saved-list > li')).toHaveCount(1);
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await page.getByRole('button', { name: /Delete Action Record/ }).click();
  await page.getByRole('button', { name: 'Delete this record', exact: true }).click();
  await expect(other.locator('.saved-list > li')).toHaveCount(0);
  await start(page);
  await begin(page);
  await other.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await other.getByRole('button', { name: 'Delete all Only Empowerment data' }).click();
  await expect(page.locator('#din-task')).toHaveValue('');
});
test('Next Move handoff previews edits/exclusions, cancels, confirms start and preserves saved source', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await openCard(page);
  await page.getByRole('button', { name: 'Do it now', exact: true }).click();
  await capture(page, info, 'handoff');
  await axe(page);
  await page.getByRole('button', { name: 'Cancel handoff' }).click();
  await expect(page.locator('.execution-card')).toBeVisible();
  await page.getByRole('button', { name: 'Do it now', exact: true }).click();
  await page.locator('#nm-carry-action').fill('');
  await page.getByRole('button', { name: 'Continue into Do It Now' }).click();
  await expect(page.locator('#nm-carry-action')).toBeFocused();
  await page.locator('#nm-carry-action').fill(words('edited-action'));
  await page.locator('#nm-carry-start').fill(words('edited-start'));
  await page.getByRole('button', { name: 'Continue into Do It Now' }).click();
  await expect(page.locator('#din-task')).toHaveValue(words('edited-action'));
  await page.locator('#din-firstAction').fill(record.firstAction);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText(words('edited-start'), { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Begin now', exact: true }).click();
  await expect(page.locator('#din-yes')).toBeFocused();
  await page.getByLabel('The start condition is met and I can begin now.', { exact: true }).check();
  await page.getByRole('button', { name: 'Begin now', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Completion boundary from Next Move' }),
  ).toBeVisible();
  await expect(page.locator('input[name="action-result"]:checked')).toHaveCount(0);
  for (const [k, v] of before)
    expect(await page.evaluate((k) => localStorage.getItem(k), k)).toBe(v);
  expect(page.url()).not.toContain(marker);
  expect(await page.title()).not.toContain(marker);
});
test('Next Move handoff optional references excluded and existing started work deliberately replaced', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  await start(page);
  await begin(page);
  await openCard(page);
  await page.getByRole('button', { name: 'Do it now', exact: true }).click();
  await page.getByLabel('Include start condition', { exact: true }).uncheck();
  await page.getByLabel('Include completion boundary', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Continue into Do It Now' }).click();
  await capture(page, info, 'replace');
  await expect(page.getByRole('dialog')).toContainText('already reported starting');
  await axe(page);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.locator('a.tool-card[href="#/tools/do-it-now"]').click();
  await expect(page.getByText('Begin state: Started', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await page.locator('a.tool-card[href="#/tools/next-move"]').click();
  await page.getByRole('button', { name: 'Do it now', exact: true }).click();
  await page.getByLabel('Include start condition', { exact: true }).uncheck();
  await page.getByLabel('Include completion boundary', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Continue into Do It Now' }).click();
  await page.getByRole('button', { name: 'Replace and open Do It Now' }).click();
  await page.locator('#din-firstAction').fill('Begin the work');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Start condition from Next Move' })).toHaveCount(
    0,
  );
  await begin(page);
  await expect(
    page.getByRole('heading', { name: 'Completion boundary from Next Move' }),
  ).toHaveCount(0);
});
test('Do It Now private markers stay out of requests, URLs, titles, links and unexpected storage', async ({
  page,
}) => {
  const requests: { url: string; body: string | null; method: string }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), body: r.postData(), method: r.method() }),
  );
  await complete(page, 'Partial');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([]);
  expect(page.url()).not.toContain(marker);
  expect(await page.title()).not.toContain(marker);
  for (const href of await page
    .locator('a')
    .evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).href)))
    expect(href).not.toContain(marker);
  for (const r of requests) {
    expect(r.url + (r.body || '')).not.toContain(marker);
    expect(r.method).toBe('GET');
    expect(new URL(r.url).origin).toBe(new URL(page.url()).origin);
  }
  await save(page);
  expect(await page.evaluate(() => Object.keys(localStorage))).toHaveLength(1);
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await page.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await page.getByRole('button', { name: 'Delete all Only Empowerment data' }).click();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
for (const width of [320, 360, 390, 1024, 1440])
  test(`Do It Now ${width}px reflow, long Unicode, enlarged text, forced colors and print`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    await start(page);
    await capture(page, info, 'width-' + width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByLabel('Use an optional timer', { exact: true }).check();
    await begin(page);
    await page.getByLabel('Blocked', { exact: true }).check();
    await capture(page, info, 'result-' + width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await result(page, 'Blocked');
    await page.locator('#din-task').fill('界'.repeat(2000));
    await page.locator('#din-firstAction').fill('👩🏽‍💻'.repeat(100));
    await page.locator('#din-outcome').fill('e\u0301'.repeat(1000));
    await confirm(page);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await capture(page, info, 'long-' + width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await axe(page);
    await page.emulateMedia({ media: 'print', forcedColors: 'none' });
    expect(await page.locator('.output-card').textContent()).toContain('界'.repeat(2000));
    if (info.project.name === 'chromium' && width === 1440)
      await page.pdf({ path: info.outputPath('action-long.pdf'), format: 'A4' });
  });
test('Do It Now keyboard path maintains heading, input and dialog focus', async ({ page }) => {
  await page.goto('/#/tools/do-it-now');
  await page.locator('#din-task').focus();
  await page.keyboard.type('Write the report');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Write the first paragraph');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(page.locator('#din-yes')).toBeChecked();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Begin state: Started', { exact: true })).toBeVisible();
  await page.locator('#din-Completed').focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.type('Paragraph written.');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await axe(page);
});

test('Next Move handoff markers remain private and replacement preserves a saved Action Record', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url() + (r.postData() || '')));
  await page.goto('/');
  await seed(page);
  await complete(page, 'Partial');
  await save(page);
  const before = await page.evaluate(() => Object.entries(localStorage));
  await openCard(page);
  await page.getByRole('button', { name: 'Do it now', exact: true }).click();
  await page.getByRole('button', { name: 'Continue into Do It Now' }).click();
  await expect(page.getByRole('dialog')).toContainText('An Action Record is open');
  await page.getByRole('button', { name: 'Replace and open Do It Now' }).click();
  await page.locator('#din-firstAction').fill(words('handoff-first'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel(/^No\. Something/).check();
  await page.getByRole('button', { name: 'Pause here', exact: true }).click();
  await expect(page.locator('.output-card,.action-timer')).toHaveCount(0);
  for (const [k, v] of before)
    expect(await page.evaluate((k) => localStorage.getItem(k), k)).toBe(v);
  expect(await page.evaluate(() => Object.entries(localStorage))).toHaveLength(before.length);
  for (const request of requests) expect(request).not.toContain(marker);
  expect(page.url()).not.toContain(marker);
  expect(await page.title()).not.toContain(marker);
  for (const href of await page
    .locator('a')
    .evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).href)))
    expect(href).not.toContain(marker);
});

test('Do It Now six-artifact list, handoff and replacement fit every required width', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  await complete(page);
  await save(page);
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole('button', { name: /Open Execution Card/ }).click();
  await page.getByRole('button', { name: 'Do it now', exact: true }).click();
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width === 320) await capture(page, info, 'handoff-320');
  }
  await page.getByRole('button', { name: 'Continue into Do It Now' }).click();
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width === 320) await capture(page, info, 'replace-320');
  }
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
});

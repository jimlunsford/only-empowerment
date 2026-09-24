import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  rebuildFields,
  rebuildLabels,
  rebuildText,
  type Rebuild,
  type RebuildField,
} from '../../src/rebuild-model';
import { standardFields } from '../../src/standard-model';
import { emptyDecision, decisionFields } from '../../src/decision-room-model';
import { resetFields } from '../../src/reset-model';
const marker = 'OE-REBUILD-PRIVATE-20260924';
const authored = (f: string) =>
  `  ${marker}-${f} <script>alert("'🧭")</script> & <img src=x> e\u0301 👩🏽‍💻\nMy own words.  `;
const data = Object.fromEntries(
  rebuildFields.map((f) => [f, f === 'actions' ? [authored(f)] : authored(f)]),
) as Rebuild;
const sourceId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  sourceKey = 'oe:personal-standard:v1:' + sourceId;
const sourceStandard = Object.fromEntries(
  standardFields.map((f) => [
    f,
    ['keeping', 'violations'].includes(f) ? [authored('source-' + f)] : authored('source-' + f),
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
    await page.screenshot({ path: info.outputPath('rebuild-' + name + '.png'), fullPage: true });
}
async function seed(page: Page) {
  const decision = emptyDecision();
  for (const f of decisionFields) decision[f] = 'Existing ' + f;
  decision.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  decision.chosenId = decision.options[0].id;
  await page.evaluate(
    ({ standard, decision, plan }) => {
      const a = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        b = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        c = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
        d = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
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
      localStorage.setItem(
        'oe:reset-plan:v1:' + d,
        JSON.stringify({ schemaVersion: 1, id: d, tool: 'reset', status: 'Planned', plan }),
      );
      localStorage.setItem('unrelated', 'keep');
    },
    {
      standard: sourceStandard,
      decision,
      plan: Object.fromEntries(resetFields.map((f) => [f, 'Existing ' + f])),
    },
  );
}
async function begin(page: Page, values = data) {
  await page.goto('/#/tools/rebuild-map');
  await page.locator('#rm-area').fill(values.area);
  await page.locator('#rm-reality').fill(values.reality);
  await next(page);
}
async function manual(page: Page, values = data) {
  await page.getByLabel('State the standard myself', { exact: true }).check();
  await page.locator('#rm-standard').fill(values.standard);
  await next(page);
}
async function rest(page: Page, values = data, info?: TestInfo) {
  for (const stage of ['structure', 'actions', 'proof', 'trust', 'firstMove'] as const) {
    if (stage === 'actions') await page.locator('#rm-actions-0').fill(values.actions[0]);
    else await page.locator('#rm-' + stage).fill(values[stage]);
    if (stage === 'trust') await page.locator('#rm-negotiation').fill(values.negotiation);
    if (info) {
      await axe(page);
      await capture(page, info, stage);
    }
    await page
      .getByRole('button', {
        name: stage === 'firstMove' ? 'Review my Rebuild Map' : 'Next',
        exact: true,
      })
      .click();
  }
}
async function review(page: Page, values = data) {
  await begin(page, values);
  await manual(page, values);
  await rest(page, values);
}
async function finish(page: Page, values = data) {
  await review(page, values);
  await page.getByRole('button', { name: 'Confirm Rebuild Map', exact: true }).click();
  await expect(page.locator('.rebuild-map')).toContainText('Status: Mapped');
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this map', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Saved on this device.');
}
async function saved(page: Page) {
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Saved on this device', exact: true }),
  ).toBeVisible();
}
async function openMap(page: Page) {
  await page.getByRole('button', { name: /Open Rebuild Map/ }).click();
  await expect(page.getByRole('dialog').or(page.locator('.rebuild-map'))).toBeVisible();
  if (await page.getByRole('dialog').isVisible())
    await page.getByRole('button', { name: 'Open saved record', exact: true }).click();
  await expect(page.locator('.rebuild-map')).toBeVisible();
}
async function edit(page: Page, f: RebuildField) {
  await page
    .getByRole('button', { name: 'Edit ' + rebuildLabels[f].toLowerCase(), exact: true })
    .click();
}
async function offer(page: Page) {
  await page
    .getByRole('button', { name: 'Turn the first move into a Next Move', exact: true })
    .click();
}

test('Rebuild full workflow, all editable sections, exact authorship and accessible states', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await begin(page);
  await axe(page);
  await capture(page, info, 'standard');
  await manual(page);
  await rest(page, data, info);
  await axe(page);
  await capture(page, info, 'review');
  const edited = structuredClone(data);
  for (const f of rebuildFields) {
    await edit(page, f);
    const input = page.locator('#rm-' + f + (f === 'actions' ? '-0' : ''));
    await expect(input).toBeFocused();
    await input.fill(authored('edited-' + f));
    if (f === 'actions') edited.actions = [authored('edited-' + f)];
    else edited[f] = authored('edited-' + f);
    await page
      .getByRole('button', { name: 'Done editing ' + rebuildLabels[f].toLowerCase(), exact: true })
      .click();
    await expect(page.locator('#rm-edit-' + f)).toBeFocused();
  }
  await page.getByRole('button', { name: 'Confirm Rebuild Map', exact: true }).click();
  await axe(page);
  await capture(page, info, 'artifact');
  for (const f of rebuildFields)
    await expect(page.locator('.rebuild-' + f + ' .answer')).toHaveText(
      f === 'actions' ? edited.actions : edited[f],
      { useInnerText: false },
    );
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await expect(page.locator('.rebuild-map script,.rebuild-map img')).toHaveCount(0);
});
test('empty overlong inputs, Back and clear confirmation retain user control', async ({ page }) => {
  await page.goto('/#/tools/rebuild-map');
  await next(page);
  await expect(page.locator('#rm-area')).toBeFocused();
  await expect(page.getByRole('alert')).toHaveCount(2);
  await page.locator('#rm-area').fill('x'.repeat(2001));
  await page.locator('#rm-reality').fill(data.reality);
  await next(page);
  await expect(page.locator('#rm-area')).toHaveValue('x'.repeat(2001));
  await page.locator('#rm-area').fill(data.area);
  await next(page);
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Choose how');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#rm-area')).toHaveValue(data.area);
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('#rm-area')).toHaveValue(data.area);
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Clear current work', exact: true })
    .click();
  await expect(page.locator('#rm-area')).toHaveValue('');
});
test('unclear standard pauses without artifact and internal routes retain only memory', async ({
  page,
}, info) => {
  await begin(page);
  await page.getByLabel('I do not have a clear standard yet', { exact: true }).check();
  await next(page);
  await expect(page.locator('.pause-panel')).toContainText('No Rebuild Map has been created.');
  await axe(page);
  await capture(page, info, 'pause');
  await expect(page.locator('.rebuild-map')).toHaveCount(0);
  await page.getByRole('link', { name: 'Open Build a Standard', exact: true }).click();
  await expect(page.locator('#ps-area')).toBeVisible();
  await page.evaluate(() => {
    location.hash = '/tools/rebuild-map';
  });
  await expect(page.locator('.pause-panel')).toBeVisible();
  await page.getByRole('button', { name: 'Return to the standard', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#rm-area')).toHaveValue(data.area);
  await page.reload();
  await expect(page.locator('#rm-area')).toHaveValue('');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test('saved Personal Standard selection is explicit and final snapshot survives source edit/delete', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  const old = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  await begin(page);
  await page.getByLabel('Use a saved Personal Standard', { exact: true }).check();
  await expect(page.locator('#rm-saved-standard')).toHaveValue('');
  await next(page);
  await expect(page.getByRole('alert')).toContainText('Select a saved');
  await page.locator('#rm-saved-standard').selectOption(sourceKey);
  await page.getByText('View selected standard reference', { exact: true }).click();
  await axe(page);
  await capture(page, info, 'saved-reference');
  await expect(page.locator('.reset-reference')).toContainText(sourceStandard.structure as string);
  await expect(page.locator('.reset-reference')).not.toContainText(
    sourceStandard.correction as string,
  );
  await next(page);
  await rest(page);
  await edit(page, 'standard');
  await page.locator('#rm-standard').fill('My revised map snapshot');
  await page
    .getByRole('button', { name: 'Done editing standard i am raising to', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirm Rebuild Map', exact: true }).click();
  await save(page);
  for (const [key, value] of Object.entries(old))
    expect(await page.evaluate((k) => localStorage.getItem(k), key)).toBe(value);
  const raw = await page.evaluate(
    () => Object.entries(localStorage).find(([k]) => k.startsWith('oe:rebuild-map:'))![1],
  );
  expect(raw).not.toContain(sourceKey);
  expect(raw).not.toContain(sourceStandard.structure);
  expect(JSON.parse(raw).map.standard).toBe('My revised map snapshot');
  await page.evaluate((key) => {
    const s = JSON.parse(localStorage.getItem(key)!);
    s.standard.standard = 'Changed source';
    localStorage.setItem(key, JSON.stringify(s));
    localStorage.removeItem(key);
  }, sourceKey);
  await page.reload();
  await saved(page);
  await openMap(page);
  await expect(page.locator('.rebuild-standard')).toContainText('My revised map snapshot');
});
test('repeated action list preserves order, enforces bounds and restores focus', async ({
  page,
}) => {
  await begin(page);
  await manual(page);
  await page.locator('#rm-structure').fill(data.structure);
  await next(page);
  await next(page);
  await expect(page.locator('#rm-actions-0')).toBeFocused();
  await page.locator('#rm-actions-0').fill('First');
  for (let i = 1; i < 5; i++) {
    await page.getByRole('button', { name: 'Add repeated action', exact: true }).click();
    await expect(page.locator('#rm-actions-' + i)).toBeFocused();
    await page.locator('#rm-actions-' + i).fill('Action ' + (i + 1));
  }
  await expect(
    page.getByRole('button', { name: 'Add repeated action', exact: true }),
  ).toBeDisabled();
  await page.locator('#rm-actions-4').fill('x'.repeat(1001));
  await next(page);
  await expect(page.locator('#rm-actions-4')).toBeFocused();
  await page.getByRole('button', { name: 'Remove action 5', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('#rm-actions-4')).toHaveValue('x'.repeat(1001));
  await page.getByRole('button', { name: 'Remove action 5', exact: true }).click();
  await page.getByRole('button', { name: 'Remove action', exact: true }).click();
  await expect(page.locator('#rm-actions-3')).toBeFocused();
  await expect(page.locator('#rm-actions-0')).toHaveValue('First');
  await next(page);
  await expect(page.locator('#rm-proof')).toBeVisible();
});
test('copy exact text, denied clipboard fallback and print artifact', async ({ page }, info) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copied: string }).copied = text;
        },
      },
    });
  });
  await finish(page);
  await page.getByRole('button', { name: 'Copy Rebuild Map', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(
    rebuildText(data),
  );
  await page.evaluate(() => {
    navigator.clipboard.writeText = async () => {
      throw Error('denied');
    };
  });
  await page.getByRole('button', { name: 'Copy Rebuild Map', exact: true }).click();
  await expect(page.locator('#rm-copy')).toHaveValue(rebuildText(data));
  await expect(page.locator('#rm-copy')).toBeFocused();
  expect(
    await page
      .locator('#rm-copy')
      .evaluate((e: HTMLTextAreaElement) => e.selectionEnd - e.selectionStart),
  ).toBe(rebuildText(data).length);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.rebuild-map')).toBeVisible();
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.artifact-actions')).toBeHidden();
  await expect(page.locator('.staging-banner')).toBeHidden();
  await capture(page, info, 'print');
});
test('saving is explicit, five types coexist, reopening edits require a new save', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  await finish(page);
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await axe(page);
  await capture(page, info, 'save-dialog');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(
    await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('oe:')).length),
  ).toBe(4);
  await save(page);
  const raw = await page.evaluate(
    () => Object.entries(localStorage).find(([k]) => k.startsWith('oe:rebuild-map:'))![1],
  );
  await saved(page);
  await axe(page);
  await capture(page, info, 'saved-work');
  await expect(page.locator('.saved-list > li')).toHaveCount(5);
  await openMap(page);
  await page.getByRole('button', { name: 'Edit map', exact: true }).click();
  await edit(page, 'proof');
  await page.locator('#rm-proof').fill('Changed proof');
  await page.getByRole('button', { name: 'Confirm Rebuild Map', exact: true }).click();
  expect(
    await page.evaluate(
      () => Object.entries(localStorage).find(([k]) => k.startsWith('oe:rebuild-map:'))![1],
    ),
  ).toBe(raw);
  await page.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save these changes', exact: true }).click();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(Object.entries(localStorage).find(([k]) => k.startsWith('oe:rebuild-map:'))![1])
          .map.proof,
    ),
  ).toBe('Changed proof');
});
for (const failure of ['denied', 'quota', 'readback'] as const)
  test(`Rebuild ${failure} save failure leaves usable memory and no false success`, async ({
    page,
  }) => {
    await finish(page);
    await page.evaluate((mode) => {
      if (mode === 'denied')
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw Error('denied');
          },
        });
      else
        Storage.prototype.setItem =
          mode === 'quota'
            ? function () {
                throw new DOMException('full', 'QuotaExceededError');
              }
            : function () {};
    }, failure);
    await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
    await page.getByRole('button', { name: 'Save this map', exact: true }).click();
    await expect(page.locator('.work-status')).toContainText('Save could not be verified');
    await expect(page.locator('.rebuild-proof')).toContainText(data.proof);
    await expect(page.locator('.save-state')).toContainText('Not saved');
  });
test('handoff previews minimal editable fields, protects existing work and runs all Next Move stages', async ({
  page,
}, info) => {
  await page.goto('/');
  await seed(page);
  const old = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  await page.goto('/#/tools/next-move');
  await page.locator('#field-situation').fill('Do not silently replace this');
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  await expect(page.locator('h1')).toContainText('Different situations');
  await page.getByRole('link', { name: /Try Rebuild Map/ }).click();
  await page.locator('#rm-area').fill(data.area);
  await page.locator('#rm-reality').fill(data.reality);
  await next(page);
  await manual(page);
  await rest(page);
  await page.getByRole('button', { name: 'Confirm Rebuild Map', exact: true }).click();
  await offer(page);
  await expect(page.locator('#rm-handoff-situation')).toHaveValue(
    data.area + '\n\n' + data.reality,
  );
  await expect(page.locator('#rm-handoff-action')).toHaveValue(data.firstMove);
  await axe(page);
  await capture(page, info, 'handoff');
  await page.locator('#rm-handoff-situation').fill('My edited situation');
  await page.locator('#rm-handoff-action').fill('My edited action');
  await page.getByRole('button', { name: 'Continue into Next Move', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Unsaved words');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel handoff', exact: true }).click();
  await page.evaluate(() => {
    location.hash = '/tools/next-move';
  });
  await expect(page.locator('#field-situation')).toHaveValue('Do not silently replace this');
  await page.evaluate(() => {
    location.hash = '/tools/rebuild-map';
  });
  await offer(page);
  await page.locator('#rm-handoff-situation').fill('My edited situation');
  await page.locator('#rm-handoff-action').fill('My edited action');
  await page.getByRole('button', { name: 'Continue into Next Move', exact: true }).click();
  await page.getByRole('button', { name: 'Replace and open Next Move', exact: true }).click();
  await expect(page.locator('#field-situation')).toHaveValue('My edited situation');
  await next(page);
  await expect(page.locator('#field-action')).toHaveValue('My edited action');
  await next(page);
  await expect(
    page.getByLabel('The direction is decided; I can define the next action.'),
  ).not.toBeChecked();
  await page.getByLabel('The direction is decided; I can define the next action.').check();
  await next(page);
  await page.locator('#field-obstacle').fill('Likely distraction');
  await page
    .getByLabel('I can plan around it, or no obstacle is apparent.', { exact: true })
    .check();
  await next(page);
  await page.locator('#field-start').fill('After lunch');
  await next(page);
  await page.locator('#field-completion').fill('Message sent');
  await page.getByRole('button', { name: /Review/i }).click();
  await page.getByRole('button', { name: 'Confirm my plan', exact: true }).click();
  await expect(page.locator('.execution-card')).toContainText('Planned');
  expect(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)))).toEqual(old);
});
for (const excluded of ['situation', 'action', 'both'] as const)
  test(`handoff excludes ${excluded} and never bypasses receiving input validation`, async ({
    page,
  }) => {
    await finish(page);
    await offer(page);
    if (excluded !== 'action')
      await page.getByLabel('Include area and current reality as situation').uncheck();
    if (excluded !== 'situation') await page.getByLabel('Include first move as action').uncheck();
    await page.getByRole('button', { name: 'Continue into Next Move', exact: true }).click();
    await expect(page.locator('#field-situation')).toHaveValue(
      excluded === 'action' ? data.area + '\n\n' + data.reality : '',
    );
    if (excluded !== 'action') await page.locator('#field-situation').fill('Authored here');
    await next(page);
    await expect(page.locator('#field-action')).toHaveValue(
      excluded === 'situation' ? data.firstMove : '',
    );
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
  });
test('oversized handoff is preserved for deliberate editing or exclusion', async ({ page }) => {
  await finish(page, { ...data, area: 'a'.repeat(2000), reality: 'b'.repeat(2000) });
  await offer(page);
  await page.getByRole('button', { name: 'Continue into Next Move', exact: true }).click();
  await expect(page.locator('#rm-handoff-situation')).toBeFocused();
  await expect(page.locator('#rm-handoff-situation')).toHaveValue(
    'a'.repeat(2000) + '\n\n' + 'b'.repeat(2000),
  );
  await page.locator('#rm-handoff-situation').fill('Chosen shorter context');
  await page.getByRole('button', { name: 'Continue into Next Move', exact: true }).click();
  await expect(page.locator('#field-situation')).toHaveValue('Chosen shorter context');
});
test('cross-tab edits reject stale saves, deletions clear the map and all-data clear removes transient handoff', async ({
  page,
  context,
}) => {
  await finish(page);
  await save(page);
  const other = await context.newPage();
  await other.goto('/#/saved');
  const key = await page.evaluate(() =>
    Object.keys(localStorage).find((k) => k.startsWith('oe:rebuild-map:'))!,
  );
  await other.evaluate((key) => {
    const r = JSON.parse(localStorage.getItem(key)!);
    r.map.proof = 'Other tab';
    localStorage.setItem(key, JSON.stringify(r));
  }, key);
  await page.bringToFront();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await page.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save these changes', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('record changed or was deleted');
  await other.evaluate((key) => localStorage.removeItem(key), key);
  await expect(page.locator('#rm-area')).toHaveValue('');
  await page.locator('#rm-area').fill(data.area);
  await page.locator('#rm-reality').fill(data.reality);
  await next(page);
  await manual(page);
  await rest(page);
  await page.getByRole('button', { name: 'Confirm Rebuild Map', exact: true }).click();
  await offer(page);
  await other.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await other
    .getByRole('button', { name: 'Delete all Only Empowerment data', exact: true })
    .click();
  await expect(page.locator('#rm-area')).toHaveValue('');
  await expect(page.locator('#rm-handoff-situation')).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('privacy lifecycle keeps all private markers out of URLs requests titles and implicit storage', async ({
  page,
  context,
}) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), body: r.postData() }),
  );
  await finish(page);
  await offer(page);
  await page.getByRole('button', { name: 'Cancel handoff', exact: true }).click();
  await saved(page);
  await page.evaluate(() => {
    location.hash = '/tools/rebuild-map';
  });
  await expect(page.locator('.rebuild-map')).toBeVisible();
  expect(
    await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length })),
  ).toEqual({ local: 0, session: 0 });
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(async () => ({
      db: (await indexedDB.databases()).length,
      caches: (await caches.keys()).length,
      sw: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ db: 0, caches: 0, sw: 0 });
  expect(page.url()).not.toContain(marker);
  expect(await page.title()).not.toContain(marker);
  expect(JSON.stringify(requests)).not.toContain(marker);
  for (const r of requests) {
    expect(r.method).toBe('GET');
    expect(new URL(r.url).origin).toBe(new URL(page.url()).origin);
  }
  await page.reload();
  await expect(page.locator('#rm-area')).toHaveValue('');
});
test('long Unicode map reflows, supports forced colors/enlarged text and prints across pages', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const long = {
    ...data,
    ...Object.fromEntries(
      rebuildFields
        .filter((f) => f !== 'actions')
        .map((f) => [
          f,
          authored(f) + ' ' + '長'.repeat(600) + ' ' + 'Repeat behavior. '.repeat(50),
        ]),
    ),
  };
  await finish(page, long);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width === 320 || width === 1440) await capture(page, info, 'long-' + width);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: 'active' });
  await axe(page);
  await capture(page, info, 'large-forced-colors');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
  await page.emulateMedia({ media: 'print', forcedColors: 'none' });
  if (info.project.name === 'chromium')
    await page.pdf({
      path: info.outputPath('rebuild-long.pdf'),
      format: 'A4',
      printBackground: true,
    });
});

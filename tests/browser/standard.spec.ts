import { test, expect, type Page, type TestInfo } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import {
  standardFields,
  standardLabels,
  standardText,
  standardStepFields,
  standardSteps,
  type Standard,
  type StandardField,
} from '../../src/standard-model';
import { emptyDecision, decisionFields } from '../../src/decision-room-model';
const marker = 'OE-STANDARD-PRIVATE-20260922';
const authored = (f: string) =>
  `  ${marker}-${f} <script>alert("'🧭")</script> & <img src=x>\nMy own words.  `;
const data = Object.fromEntries(
  standardFields.map((f) => [
    f,
    f === 'keeping' || f === 'violations' ? [authored(f)] : authored(f),
  ]),
) as Standard;
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
async function capture(page: Page, info: TestInfo | undefined, name: string) {
  if (info && ['chromium', 'mobile-chromium'].includes(info.project.name)) {
    await page.screenshot({ path: info.outputPath(name + '.png'), fullPage: true });
    const semanticsPath = info.outputPath(name + '-semantics.txt');
    await writeFile(semanticsPath, await page.locator('main').ariaSnapshot());
    await info.attach(name + '-semantics', {
      path: semanticsPath,
      contentType: 'text/plain',
    });
  }
}
async function review(page: Page, info?: TestInfo, values = data) {
  await page.goto('/#/tools/build-a-standard');
  for (const step of standardSteps) {
    for (const f of standardStepFields[step]) {
      const v = values[f];
      await page
        .locator(`#ps-${f}${Array.isArray(v) ? '-0' : ''}`)
        .fill(Array.isArray(v) ? v[0] : v);
    }
    if (info) {
      await axe(page);
      await capture(page, info, step);
    }
    await page
      .getByRole('button', {
        name: step === 'correction' ? 'Review my standard' : 'Next',
        exact: true,
      })
      .click();
  }
}
async function finish(page: Page, info?: TestInfo, values = data) {
  await review(page, info, values);
  if (info) {
    await axe(page);
    await capture(page, info, 'review');
  }
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  await expect(page.locator('.personal-standard')).toContainText('Status: Set');
}
async function save(page: Page) {
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this standard', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Saved on this device.');
}
async function saved(page: Page) {
  await page.getByRole('link', { name: 'Saved work', exact: true }).click();
}
async function openStandard(page: Page) {
  await page.getByRole('button', { name: /Open Personal Standard/ }).click();
  await expect(page.getByRole('dialog').or(page.locator('.personal-standard'))).toBeVisible();
  if (await page.getByRole('dialog').isVisible())
    await page.getByRole('button', { name: 'Open saved standard', exact: true }).click();
  await expect(page.locator('.personal-standard')).toBeVisible();
}
async function edit(page: Page, f: StandardField) {
  await page
    .getByRole('button', { name: 'Edit ' + standardLabels[f].toLowerCase(), exact: true })
    .click();
}
async function clearAll(page: Page) {
  await page.getByRole('button', { name: 'Delete my local data', exact: true }).click();
  await page.getByRole('button', { name: 'Delete all Only Empowerment data', exact: true }).click();
}
async function seedOtherTypes(page: Page) {
  const d = emptyDecision();
  for (const f of decisionFields) d[f] = 'Existing decision ' + f;
  d.options.forEach((o, i) =>
    Object.assign(o, { label: 'Option ' + i, tradeoff: 'Cost', reversibility: 'Not yet known' }),
  );
  d.chosenId = d.options[0].id;
  await page.evaluate((decision) => {
    const c = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    localStorage.setItem(
      'oe:execution-card:v1:' + c,
      JSON.stringify({
        schemaVersion: 1,
        id: c,
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
      'oe:decision-record:v1:' + id,
      JSON.stringify({ schemaVersion: 1, id, tool: 'decision-room', status: 'Decided', decision }),
    );
    localStorage.setItem('unrelated', 'keep');
  }, d);
}

test('complete standard workflow, observable sections, every review edit, authored Set artifact and axe', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await review(page, info);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  for (const f of standardFields) {
    await edit(page, f);
    const input = page.locator(`#ps-${f}${f === 'keeping' || f === 'violations' ? '-0' : ''}`);
    await expect(input).toBeFocused();
    await input.fill(authored('edited-' + f));
    await page
      .getByRole('button', { name: 'Done editing ' + standardLabels[f].toLowerCase(), exact: true })
      .click();
    await expect(page.locator('#edit-' + f)).toBeFocused();
  }
  await edit(page, 'correction');
  await page.locator('#ps-correction').fill('');
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  await expect(page.locator('#ps-correction')).toBeFocused();
  await axe(page);
  await page.locator('#ps-correction').fill(authored('edited-correction'));
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  const artifact = page.locator('.personal-standard');
  await expect(artifact).toContainText('Status: Set');
  await expect(artifact).toContainText('does not mean you have kept or proven it');
  await expect(artifact.locator('script,img,a,button,textarea')).toHaveCount(0);
  for (const f of standardFields)
    await expect(artifact.locator(`.standard-${f} .answer`).first()).toHaveJSProperty(
      'textContent',
      authored('edited-' + f),
    );
  await axe(page);
  await capture(page, info, 'record');
  await page.getByRole('button', { name: 'Edit standard', exact: true }).click();
  await edit(page, 'standard');
  await expect(page.locator('#ps-standard')).toHaveValue(authored('edited-standard'));
});
test('bounds, vague wording, back navigation, clear cancellation, internal routes and reload', async ({
  page,
}) => {
  await page.goto('/#/tools/build-a-standard');
  await next(page);
  await expect(page.locator('#ps-area')).toBeFocused();
  await expect(page.getByRole('alert')).toContainText('Add');
  await page.locator('#ps-area').fill('x'.repeat(2001));
  await next(page);
  await expect(page.getByRole('alert')).toContainText('not been shortened');
  await expect(page.locator('#ps-area')).toHaveValue('x'.repeat(2001));
  await page.locator('#ps-area').fill('Work');
  await next(page);
  await page.locator('#ps-standard').fill('try harder');
  await next(page);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#ps-standard')).toHaveValue('try harder');
  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  await page.goBack();
  await expect(page.locator('#ps-standard')).toHaveValue('try harder');
  await page.getByRole('button', { name: 'Clear current work', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ps-standard')).toHaveValue('try harder');
  await page.reload();
  await expect(page.locator('#ps-area')).toHaveValue('');
});
test('keeping and violating lists add edit remove cancel focus minimum maximum and long text', async ({
  page,
}) => {
  await review(page);
  for (const f of ['keeping', 'violations'] as const) {
    await edit(page, f);
    const label = f === 'keeping' ? 'keeping' : 'violating';
    await expect(
      page.getByRole('button', { name: new RegExp('Remove ' + label + ' behavior') }),
    ).toHaveCount(0);
    for (let i = 1; i < 5; i++) {
      await page.locator('#add-' + f).click();
      await expect(page.locator(`#ps-${f}-${i}`)).toBeFocused();
      await page.locator(`#ps-${f}-${i}`).fill(authored(f + '-' + i));
    }
    await expect(page.locator('#add-' + f)).toBeDisabled();
    await page.locator(`#ps-${f}-4`).fill('L'.repeat(1001));
    await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
    await expect(page.locator(`#ps-${f}-4`)).toBeFocused();
    await expect(page.getByRole('alert')).toContainText('not been shortened');
    await page.locator(`#ps-${f}-4`).fill('L'.repeat(1000));
    await page.getByRole('button', { name: `Remove ${label} behavior 2`, exact: true }).click();
    await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
    await axe(page);
    await page.keyboard.press('Escape');
    await expect(page.locator(`#ps-${f}-1`)).toHaveValue(authored(f + '-1'));
    await page.getByRole('button', { name: `Remove ${label} behavior 2`, exact: true }).click();
    await page.getByRole('button', { name: 'Remove behavior', exact: true }).click();
    await expect(page.locator('#add-' + f)).toBeFocused();
    await expect(page.locator(`#ps-${f}-1`)).toHaveValue(authored(f + '-2'));
    await page
      .getByRole('button', { name: 'Done editing ' + standardLabels[f].toLowerCase(), exact: true })
      .click();
  }
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  await expect(page.locator('.standard-keeping li')).toHaveCount(4);
  await expect(page.locator('.standard-violations li')).toHaveCount(4);
});
test('copy success and manual fallback match exact portable text and print control', async ({
  page,
}) => {
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
  await page.getByRole('button', { name: 'Copy standard', exact: true }).click();
  await expect(page.locator('.work-status')).toHaveText('Personal Standard copied.');
  expect(await page.evaluate(() => (window as any).copied)).toBe(standardText(data));
  await page.getByRole('button', { name: 'Print standard', exact: true }).click();
  expect(await page.evaluate(() => (window as any).printed)).toBe(true);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(Error('denied')) },
    }),
  );
  await page.getByRole('button', { name: 'Copy standard', exact: true }).click();
  await expect(page.getByLabel('Personal Standard plain text')).toBeFocused();
  await expect(page.getByLabel('Personal Standard plain text')).toHaveValue(standardText(data));
  expect(
    await page
      .getByLabel('Personal Standard plain text')
      .evaluate((el: HTMLTextAreaElement) => el.selectionEnd - el.selectionStart),
  ).toBe(standardText(data).length);
  await axe(page);
});
test('explicit save cancellation, mixed Saved Work, reopen edit save, per-record and namespace deletion', async ({
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
  await seedOtherTypes(page);
  const before = await page.evaluate(() =>
    Object.fromEntries(
      Object.entries(localStorage).filter(([k]) => !k.includes('personal-standard')),
    ),
  );
  await saved(page);
  await expect(page.locator('.saved-list li')).toHaveCount(3);
  await axe(page);
  await capture(page, info, 'mixed-saved');
  await openStandard(page);
  await page.getByRole('button', { name: 'Edit standard', exact: true }).click();
  await edit(page, 'standard');
  await page.locator('#ps-standard').fill('My revised line');
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  expect(
    await page.evaluate(() =>
      Object.values(localStorage).some((v) => v.includes('My revised line')),
    ),
  ).toBe(false);
  await page.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save these changes', exact: true }).click();
  await page.reload();
  await saved(page);
  await openStandard(page);
  await expect(page.locator('.standard-standard .answer')).toHaveText('My revised line');
  expect(
    await page.evaluate(() =>
      Object.fromEntries(
        Object.entries(localStorage).filter(([k]) => !k.includes('personal-standard')),
      ),
    ),
  ).toEqual(before);
  await saved(page);
  await page.getByRole('button', { name: /Delete Personal Standard/ }).click();
  await axe(page);
  await page.getByRole('button', { name: 'Delete this standard', exact: true }).click();
  await expect(page.locator('.saved-list li')).toHaveCount(2);
  await page.evaluate(() => {
    localStorage.setItem('oe:future:v9', '{}');
    localStorage.setItem('oe:broken', '{');
  });
  await page.reload();
  await expect(page.getByText(/2 unreadable or unsupported/)).toBeVisible();
  await clearAll(page);
  expect(await page.evaluate(() => Object.entries(localStorage))).toEqual([['unrelated', 'keep']]);
});
test('privacy markers in every authored field remain off network titles links and unexpected storage', async ({
  page,
  context,
}) => {
  const requests: { url: string; body: string | null; method: string }[] = [];
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
  expect(entries[0][0]).toMatch(/^oe:personal-standard:v1:/);
  expect(JSON.parse(entries[0][1]).standard).toEqual(data);
  await saved(page);
  await clearAll(page);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  expect(JSON.stringify(requests)).not.toContain(marker);
  expect(
    requests.every(
      (r) => r.method === 'GET' && new URL(r.url).origin === new URL(page.url()).origin,
    ),
  ).toBe(true);
});
test('storage failures and full mixed quota preserve memory and honest save state', async ({
  page,
}) => {
  test.setTimeout(90000);
  await finish(page);
  await seedOtherTypes(page);
  await page.evaluate(() => {
    for (let i = 0; i < 48; i++) localStorage.setItem('oe:unsupported:' + i, '{}');
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this standard', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText(
    '50 saved Only Empowerment records total',
  );
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('oe:unsupported'))
      .forEach((k) => localStorage.removeItem(k));
    Storage.prototype.setItem = () => {
      throw new DOMException('full', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this standard', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('Save could not be verified');
  await expect(page.locator('.personal-standard')).toContainText(marker);
  await page.evaluate(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw Error('denied');
      },
    });
  });
  await page.getByRole('button', { name: 'Save on this device', exact: true }).click();
  await page.getByRole('button', { name: 'Save this standard', exact: true }).click();
  await expect(page.locator('.work-status')).toContainText('Save could not be verified');
  await saved(page);
  await expect(page.getByRole('alert')).toContainText('unavailable');
  await clearAll(page);
  await expect(page.getByText(/local storage deletion could not be verified/)).toBeVisible();
});
test('cross-tab record deletion clears open saved edits and lists with storage-event fallback', async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'BroadcastChannel', { value: undefined });
  });
  await finish(page);
  await save(page);
  const other = await context.newPage();
  await other.goto('/#/saved');
  await openStandard(other);
  await other.getByRole('button', { name: 'Edit standard', exact: true }).click();
  await edit(other, 'reason');
  await other.locator('#ps-reason').fill('Unsaved edit');
  const listing = await context.newPage();
  await listing.goto('/#/saved');
  await saved(page);
  await page.getByRole('button', { name: /Delete Personal Standard/ }).click();
  await page.getByRole('button', { name: 'Delete this standard', exact: true }).click();
  await expect(other.locator('#ps-area')).toHaveValue('');
  await expect(other.getByRole('button', { name: 'Set this standard', exact: true })).toHaveCount(
    0,
  );
  await expect(listing.locator('.saved-list li')).toHaveCount(0);
  expect(await other.evaluate(() => localStorage.length)).toBe(0);
});
test('changed saved standard refuses stale overwrite and BroadcastChannel clears unsaved work', async ({
  page,
  context,
}) => {
  await finish(page);
  await save(page);
  const other = await context.newPage();
  await other.goto('/#/saved');
  await openStandard(other);
  await page.evaluate(() => {
    const k = Object.keys(localStorage)[0],
      r = JSON.parse(localStorage.getItem(k)!);
    r.standard.reason = 'Other tab changed this';
    localStorage.setItem(k, JSON.stringify(r));
  });
  await other.getByRole('button', { name: 'Save changes on this device', exact: true }).click();
  await other.getByRole('button', { name: 'Save these changes', exact: true }).click();
  await expect(other.locator('.work-status')).toContainText('changed or was deleted');
  await saved(page);
  await clearAll(page);
  await expect(other.locator('#ps-area')).toHaveValue('');
  await other.locator('#ps-area').fill('In memory only');
  await clearAll(page);
  await expect(other.locator('#ps-area')).toHaveValue('');
});
test('keyboard-only workflow, review editing, confirmation and dialog focus', async ({ page }) => {
  await page.goto('/#/tools/build-a-standard');
  async function tabTo(selector: string) {
    for (let i = 0; i < 60; i++) {
      if (await page.locator(selector).evaluate((el) => el === document.activeElement)) return;
      await page.keyboard.press('Tab');
    }
    throw Error('Keyboard could not reach ' + selector);
  }
  for (const step of standardSteps) {
    for (const f of standardStepFields[step]) {
      const id = `#ps-${f}${f === 'keeping' || f === 'violations' ? '-0' : ''}`;
      await tabTo(id);
      await page.keyboard.type('My own ' + f);
    }
    await tabTo('button[type=submit]');
    await page.keyboard.press('Enter');
  }
  await tabTo('#edit-reason');
  await page.keyboard.press('Enter');
  await expect(page.locator('#ps-reason')).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.type('My edited reason');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#edit-reason')).toBeFocused();
  const set = page.getByRole('button', { name: 'Set this standard', exact: true });
  for (let i = 0; i < 30 && !(await set.evaluate((el) => el === document.activeElement)); i++)
    await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('.personal-standard')).toContainText('Status: Set');
  await expect(page.locator('h1')).toBeFocused();
  const saveButton = page.getByRole('button', { name: 'Save on this device', exact: true });
  for (
    let i = 0;
    i < 15 && !(await saveButton.evaluate((el) => el === document.activeElement));
    i++
  )
    await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(saveButton).toBeFocused();
});
test('responsive workflow review artifact and mixed saved work, enlarged text forced colors and print', async ({
  page,
  browserName,
}, info) => {
  test.setTimeout(120000);
  const values = {
    ...data,
    standard: 'A'.repeat(2000),
    keeping: ['Keeping behavior. '.repeat(50)],
    violations: ['Violating behavior. '.repeat(45)],
    structure: 'Protecting structure. '.repeat(80),
  };
  await finish(page, undefined, values);
  for (const width of [320, 360, 390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await capture(page, info, 'artifact-' + width);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await axe(page);
  await capture(page, info, 'forced-colors-320');
  await page.emulateMedia({ forcedColors: 'none' });
  await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
  // The stress artifact exceeds Firefox/WebKit's 32,767px image limit at this scale.
  // Capture the viewport; the following assertion still measures the entire document.
  await page.screenshot({ path: info.outputPath('text-200-all-browsers.png'), fullPage: false });
  const enlargedLayout = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    overflowing: Array.from(document.querySelectorAll('body *'))
      .filter((el) => el.getBoundingClientRect().right > innerWidth)
      .map((el) => ({
        tag: el.tagName,
        class: el.className,
        right: el.getBoundingClientRect().right,
      })),
  }));
  expect(enlargedLayout.scrollWidth, JSON.stringify(enlargedLayout)).toBeLessThanOrEqual(
    enlargedLayout.width,
  );
  await capture(page, info, 'text-200');
  await page.evaluate(() => (document.documentElement.style.fontSize = ''));
  await page.getByRole('button', { name: 'Edit standard', exact: true }).click();
  await edit(page, 'keeping');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture(page, info, 'list-320');
  await axe(page);
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  await save(page);
  await seedOtherTypes(page);
  await saved(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await capture(page, info, 'saved-320');
  await openStandard(page);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.staging-banner')).toBeHidden();
  await expect(page.locator('.artifact-actions')).toBeHidden();
  await expect(page.locator('.work-footer')).toBeHidden();
  await expect(page.locator('.personal-standard')).toBeVisible();
  await capture(page, info, 'print');
  if (browserName === 'chromium' && info.project.name === 'chromium')
    await page.pdf({
      path: info.outputPath('personal-standard-long.pdf'),
      format: 'A4',
      printBackground: false,
    });
});

test('every standard-building stage fits narrow mobile through desktop with ordinary content', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  const example: Standard = {
    area: 'Communication when work is under pressure',
    standard:
      'When I need time before answering, I say so and agree when I will return to the conversation.',
    reason: 'People can plan around an honest answer. Silence leaves them guessing.',
    keeping: ['I name the pause and agree a return time before stepping away.'],
    violations: ['I disappear from the conversation without an agreement.'],
    structure: 'I put the return time in my calendar and leave a note about what needs an answer.',
    adaptation:
      'If an urgent responsibility changes my availability, I communicate the change and agree a new time. I review the wider rule when responsibilities change.',
    nonNegotiation: 'Discomfort with the conversation alone is not a reason to disappear.',
    correction:
      'I acknowledge the missed agreement, contact the person, and arrange the next conversation.',
  };
  await page.goto('/#/tools/build-a-standard');
  for (const step of standardSteps) {
    for (const f of standardStepFields[step])
      await page
        .locator(`#ps-${f}${f === 'keeping' || f === 'violations' ? '-0' : ''}`)
        .fill(Array.isArray(example[f]) ? example[f][0] : (example[f] as string));
    for (const width of [320, 360, 390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width === 320) await capture(page, info, 'narrow-' + step);
      if (width === 1440) await capture(page, info, 'desktop-' + step);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page
      .getByRole('button', {
        name: step === 'correction' ? 'Review my standard' : 'Next',
        exact: true,
      })
      .click();
  }
  await capture(page, info, 'narrow-review');
  await page.setViewportSize({ width: 1440, height: 900 });
  await capture(page, info, 'desktop-review');
  await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
  await capture(page, info, 'desktop-record');
  await page.setViewportSize({ width: 320, height: 900 });
  await capture(page, info, 'narrow-record');
});

import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import approved from '../fixtures/work39-approved.json' with { type: 'json' };
import samples from '../fixtures/work39-card-exports.json' with { type: 'json' };
import { periodCardContext as copy, periodExercise } from '../../src/period-content';

const record = (id: string) => approved.records.find((r) => r.id === id)!;
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const axe = async (page: Page) => {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  return {
    violations: result.violations,
    passes: result.passes.length,
    incomplete: result.incomplete.map((v) => v.id),
  };
};
async function populate(page: Page, index = 1) {
  const { draft } = samples[index];
  await page.goto('/#/period/standard');
  await page.reload();
  await page.locator('#period-valueId').selectOption(draft.valueId);
  await page.locator('#period-standard').fill(draft.standard);
  await page.locator('#period-nextApplication').fill(draft.nextApplication);
  if (draft.returnPlan) {
    await page.locator('.support summary').click();
    await page.locator('#period-returnPlan').fill(draft.returnPlan);
  }
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('#period-card-title')).toBeFocused();
}

test('all six invitations and four everyday examples retain their existing lesson positions', async ({
  page,
}) => {
  const paths = [
    '/period/practice/connected-code',
    ...['purpose', 'resilience', 'integrity', 'discipline', 'empowerment'].map(
      (v) => '/period/values/' + v,
    ),
  ];
  for (const [index, path] of paths.entries()) {
    await page.goto('/#' + path);
    const main = page.locator('main');
    await expect(
      main
        .getByText(record('L0' + (index + 1)).proposed as string, { exact: true })
        .filter({ visible: true }),
    ).toBeVisible();
    if (index >= 2)
      await expect(
        main
          .getByText(record('E0' + (index - 1)).proposed as string, { exact: true })
          .filter({ visible: true }),
      ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Your practice' })).toContainText(
      copy.footer,
    );
  }
  await page.emulateMedia({ media: 'print' });
  await expect(
    page.getByText(record('L06').proposed as string, { exact: true }).filter({ visible: true }),
  ).toHaveCount(1);
  await expect(
    page.getByText(record('E04').proposed as string, { exact: true }).filter({ visible: true }),
  ).toHaveCount(1);
});

test('Card entry, guide, example and result reflow with one accessible guide and keyboard controls', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const audits = [];
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const entry = page.getByRole('navigation', { name: 'Your practice' });
    await expect(entry.locator('p')).toHaveText(copy.footer);
    if (info.project.name === 'chromium')
      await entry.screenshot({ path: info.outputPath(`work39-footer-${width}.png`) });
    await entry.getByRole('link', { name: 'Optional Standard Card', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('main h1')).toBeFocused();
    await expect(page.locator('.lead')).toHaveText(periodExercise.lead);
    await expect(page.locator('#period-standard')).toHaveValue('');
    expect(await fits(page)).toBe(true);
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`work39-editor-${width}.png`),
        fullPage: true,
      });
    if (width < 1000) {
      const summary = page.locator('.mobile-teaching summary');
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.mobile-teaching')).toHaveAttribute('open', '');
    }
    const heading = page.getByRole('heading', { name: copy.connectedHeading, exact: true });
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveJSProperty('tagName', width === 1440 ? 'H3' : 'H2');
    for (const text of copy.connectedParagraphs)
      await expect(page.getByText(text, { exact: true }).filter({ visible: true })).toHaveCount(1);
    const tree = await page.locator('main').ariaSnapshot();
    expect(tree.split(copy.connectedHeading)).toHaveLength(2);
    audits.push({ width, state: 'editor', ...(await axe(page)) });
    if (info.project.name === 'chromium')
      await page.screenshot({ path: info.outputPath(`work39-guide-${width}.png`), fullPage: true });
    await page.locator('.period-example summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.period-example')).toContainText(periodExercise.example.standard);
    await expect(page.locator('#period-standard')).toHaveValue('');
    if (info.project.name === 'chromium')
      await page
        .locator('.period-example')
        .screenshot({ path: info.outputPath(`work39-example-${width}.png`) });
    await populate(page);
    await expect(page.locator('.result-actions > p').nth(1)).toHaveText(copy.takeaway);
    audits.push({ width, state: 'result', ...(await axe(page)) });
    expect(await fits(page)).toBe(true);
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`work39-result-${width}.png`),
        fullPage: true,
      });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await fits(page)).toBe(true);
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`work39-result-text200-${width}.png`),
        fullPage: true,
      });
    await page.evaluate(() => (document.documentElement.style.fontSize = ''));
  }
  await writeFile(info.outputPath('work39-accessibility.json'), JSON.stringify(audits, null, 2));
});

test('new guidance leaves exact clipboard fallback, draft reuse, clearing and privacy unchanged', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('synthetic blocked clipboard');
        },
      },
    }),
  );
  await populate(page);
  await page.getByRole('button', { name: 'Copy my card' }).click();
  await expect(page.locator('#period-copy')).toBeFocused();
  await expect(page.locator('#period-copy')).toHaveValue(samples[1].text);
  await expect(page.locator('.copy-status')).toHaveText(
    'Copy was blocked. Select and copy the text below.',
  );
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
    })),
  ).toEqual({ local: [], session: [] });
  await page.getByRole('button', { name: 'Edit my card' }).click();
  await page.getByRole('link', { name: 'Read about Integrity' }).click();
  await page
    .getByRole('navigation', { name: 'Your practice' })
    .getByRole('link', { name: 'Optional Standard Card' })
    .click();
  await expect(page.locator('#period-standard')).toHaveValue(samples[1].draft.standard);
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep writing' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#period-clear')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue(samples[1].draft.standard);
  await page.reload();
  await expect(page.locator('#period-standard')).toHaveValue('');
});

for (const mode of ['normal', 'disabled', 'failed'] as const) {
  test(`N02 direct entry and refresh with scripts ${mode}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode === 'failed') await context.route('**/*.js', (r) => r.abort());
    try {
      const page = await context.newPage();
      await page.goto(baseURL! + '/#reading-standard-card');
      const target =
        mode === 'normal' ? page.locator('main h1') : page.locator('#reading-standard-card');
      await expect(target).toBeInViewport();
      if (mode === 'normal') await expect(page.locator('#period-valueId')).toBeVisible();
      else
        for (const p of copy.paperParagraphs)
          await expect(page.getByText(p, { exact: true })).toHaveCount(1);
      await page.reload();
      await expect(page).toHaveURL(/#reading-standard-card$/);
      await expect(target).toBeInViewport();
    } finally {
      await context.close();
    }
  });

  test(`N02 keyboard, repeated activation and Back/Forward with scripts ${mode}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode === 'failed') await context.route('**/*.js', (r) => r.abort());
    try {
      const page = await context.newPage();
      await page.goto(baseURL! + '/read/integrity.html');
      const link = page.getByRole('link', { name: 'Use the standard on paper', exact: true });
      await expect(link).toHaveAttribute('href', '/#reading-standard-card');
      await link.focus();
      expect(
        await link.evaluate((e) => parseFloat(getComputedStyle(e).outlineWidth)),
      ).toBeGreaterThanOrEqual(3);
      await page.keyboard.press('Enter');
      const target =
        mode === 'normal' ? page.locator('main h1') : page.locator('#reading-standard-card');
      await expect(target).toBeInViewport();
      if (mode !== 'normal') await expect(target).toBeFocused();
      await page.goBack();
      await expect(page).toHaveURL(/\/read\/integrity.html$/);
      await page.goForward();
      await expect(target).toBeInViewport();
      if (mode !== 'normal') {
        for (let n = 0; n < 2; n++) {
          await page.getByRole('link', { name: 'Use the standard on paper' }).focus();
          await page.keyboard.press('Enter');
          await expect(target).toBeFocused();
          await expect(target).toBeInViewport();
        }
        await expect(page.getByRole('link', { name: 'Optional Standard Card' })).toHaveAttribute(
          'href',
          '/#/period/standard',
        );
        await expect(page.locator('.footer-app-note')).toContainText('require JavaScript');
      } else {
        // Incoming native links use the alias; this does not add an application control.
        await page.evaluate(() => {
          const a = document.createElement('a');
          a.href = '#reading-standard-card';
          a.id = 'incoming-paper';
          a.textContent = 'Incoming paper reading';
          document.body.append(a);
        });
        for (let n = 0; n < 2; n++) {
          await page.locator('#incoming-paper').focus();
          await page.keyboard.press('Enter');
          await expect(target).toBeFocused();
        }
      }
      if (mode === 'failed') await axe(page);
    } finally {
      await context.close();
    }
  });

  test(`N02 modified click preserves original page with scripts ${mode}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode === 'failed') await context.route('**/*.js', (r) => r.abort());
    try {
      const page = await context.newPage();
      await page.goto(baseURL! + '/read/integrity.html');
      const before = page.url();
      const pending = context.waitForEvent('page');
      await page
        .getByRole('link', { name: 'Use the standard on paper' })
        .click({ modifiers: ['ControlOrMeta', 'Shift'], noWaitAfter: true });
      const popup = await pending;
      await popup.bringToFront();
      await expect(popup).toHaveURL(/#reading-standard-card$/);
      await expect(
        mode === 'normal' ? popup.locator('main h1') : popup.locator('#reading-standard-card'),
      ).toBeInViewport();
      expect(page.url()).toBe(before);
    } finally {
      await context.close();
    }
  });
}

test('responsive lesson evidence and complete A4 and Letter reading and Card exports', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.skip(
    info.project.name !== 'chromium',
    'PDF export uses desktop Chromium; other engines verify shared copy, navigation and reflow.',
  );
  test.setTimeout(180000);
  const expected: Record<string, string> = {};
  async function capture(name: string, target: Page) {
    await target.evaluate(() => document.fonts.ready);
    await target.emulateMedia({ media: 'print' });
    const text = await target.locator('body').innerText();
    for (const format of ['A4', 'Letter'] as const) {
      const file = `work39-${name}-${format}.pdf`;
      await target.pdf({
        path: info.outputPath(file),
        format,
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' },
      });
      expected[file] = text;
    }
    await target.emulateMedia({ media: 'screen' });
  }
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const value of ['resilience', 'integrity', 'discipline', 'empowerment']) {
      await page.goto('/#/period/values/' + value);
      expect(await fits(page)).toBe(true);
      await page.screenshot({
        path: info.outputPath(`work39-${value}-${width}.png`),
        fullPage: true,
      });
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const index of [0, 1, 2]) {
    await populate(page, index);
    await page.emulateMedia({ media: 'print' });
    await expect(page.getByText(copy.takeaway, { exact: true })).toBeHidden();
    await capture(samples[index].name, page);
  }
  await page.goto('/#/period/values/empowerment');
  await capture('empowerment-complete', page);
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const reading = await context.newPage();
    for (const path of [
      '/',
      '/read/resilience.html',
      '/read/integrity.html',
      '/read/discipline.html',
      '/read/empowerment.html',
    ]) {
      await reading.goto(baseURL! + path);
      await expect(reading.locator('.founder-copyright')).toBeVisible();
      await capture(
        path === '/' ? 'root-reading' : path.split('/').at(-1)!.replace('.html', '-reading'),
        reading,
      );
    }
  } finally {
    await context.close();
  }
  await writeFile(info.outputPath('work39-print-expected.json'), JSON.stringify(expected, null, 2));
});

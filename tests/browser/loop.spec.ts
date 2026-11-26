import { openSiteMenu } from './helpers/site-menu';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { loopScenario, type LoopStateId } from '../../src/loop-practice-content';
import { loopSections, loopSectionIds } from '../../src/loop-content';

const paths = new Map<LoopStateId, number[]>([['pressure', []]]);
for (const [id, path] of paths)
  loopScenario.states[id].options.forEach((o, i) => {
    if (!paths.has(o.next)) paths.set(o.next, [...path, i]);
  });
async function state(page, id: LoopStateId) {
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  for (const i of paths.get(id)!) await page.locator('.loop-choices button').nth(i).click();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', id);
}
const noOverflow = async (page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

test('third framework and existing Discipline and Rebuild remain distinct', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.framework-options article')).toHaveCount(4);
  await page.getByRole('link', { name: 'Explore The Discipline Loop', exact: true }).click();
  await expect(page.locator('.loop-experience h1')).toHaveText('The Discipline Loop');
  await openSiteMenu(page);
  await page
    .locator('.site-header')
    .getByRole('link', { name: 'The PERIOD Code', exact: true })
    .click();
  await page.goto('/#/period/values/discipline');
  await expect(page.locator('h1')).toContainText('Discipline');
  await expect(page.locator('.loop-experience')).toHaveCount(0);
  await page.goto('/#/rebuild/line?section=example');
  await expect(page.locator('.rebuild-guide')).toBeVisible();
  await expect(page.locator('.loop-experience')).toHaveCount(0);
});
test('all 35 authored transitions work, focus and announce without changing the URL', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/#/loop/practice');
  for (const [id, s] of Object.entries(loopScenario.states))
    for (let i = 0; i < s.options.length; i++) {
      await state(page, id as LoopStateId);
      await expect(page.locator('.loop-choices button').nth(i)).toHaveText(
        s.options[i].label + ' →',
      );
      await page.locator('.loop-choices button').nth(i).click();
      const next = loopScenario.states[s.options[i].next];
      await expect(page.locator('#loop-scenario-heading')).toHaveText(next.heading);
      await expect(page.locator('#loop-scenario-heading')).toBeFocused();
      await expect(page.getByRole('status')).toHaveText('Example: ' + next.heading);
      expect(new URL(page.url()).hash).toBe('#/loop/practice');
    }
});
test('miss entry, reset, reload and leaving the example discard transient choices', async ({
  page,
}) => {
  await page.goto('/#/loop/practice?state=miss');
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'miss');
  await page
    .getByRole('button', { name: 'Tell the truth and locate the break', exact: true })
    .click();
  await page.reload();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'miss');
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  await page.getByRole('link', { name: 'Return to the teaching', exact: true }).click();
  await page.goBack();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  await page.goto('/#/loop/practice?state=proof');
  await expect(page.locator('h1')).toHaveText('That page is not here.');
});
test('all sixteen section addresses focus correctly on direct load and reload', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const id of loopSectionIds) {
    await page.goto('/#/loop?section=' + id);
    await expect(page.locator('#app #' + id)).toBeFocused();
    await expect
      .poll(() =>
        page.locator('#app #' + id).evaluate((e) => Math.abs(e.getBoundingClientRect().top)),
      )
      .toBeLessThan(100);
  }
  await page.reload();
  await expect(page.locator('#app #reflection')).toBeFocused();
  await page.goto('/#/loop?section=unknown');
  await expect(page.locator('h1')).toHaveText('That page is not here.');
});
test('section links support Back and Forward with public navigation state only', async ({
  page,
}) => {
  await page.goto('/#/loop');
  await page.getByRole('link', { name: 'Understand the loop', exact: true }).click();
  await expect(page.locator('#five-parts')).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('link', { name: 'Understand the loop', exact: true })).toBeFocused();
  await page.goForward();
  await expect(page.locator('#five-parts')).toBeFocused();
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
});
for (const width of [320, 390, 1366])
  test(`all states and comparison fit ${width}px with usable targets`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/loop');
    await noOverflow(page);
    await page.goto('/#/loop?section=two-loops');
    await noOverflow(page);
    await page.goto('/#/loop/practice');
    for (const id of Object.keys(loopScenario.states)) {
      await state(page, id as LoopStateId);
      await noOverflow(page);
      for (const b of await page.locator('.loop-choices button').all()) {
        const box = await b.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
      }
    }
  });
test('keyboard Enter and Space operate choices and reset with visible focus', async ({ page }) => {
  await page.goto('/#/loop/practice');
  const button = page.getByRole('button', {
    name: 'Clear one usable space, then stop',
    exact: true,
  });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'proof');
  await page.getByRole('button', { name: 'Reset example', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  await expect(page.locator('#loop-scenario-heading')).toBeFocused();
  expect(
    await page.locator('#loop-scenario-heading').evaluate((e) => getComputedStyle(e).outlineStyle),
  ).not.toBe('none');
});
test('reduced motion and forced colors retain every control', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/#/loop/practice');
  await expect(page.locator('.loop-choices button')).toHaveCount(4);
  await page.locator('.loop-choices button').first().click();
  await expect(page.locator('#loop-scenario-heading')).toBeFocused();
  await noOverflow(page);
});
test('fixed scenario has zero storage access, requests or private location state', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    (window as any).__loopPrivacy = [];
    const hit = (name: string) => {
      (window as any).__loopPrivacy.push(name);
      throw Error('Forbidden ' + name);
    };
    for (const method of ['getItem', 'setItem', 'removeItem', 'clear', 'key'])
      Object.defineProperty(Storage.prototype, method, { value: () => hit('Storage.' + method) });
    Object.defineProperty(window, 'indexedDB', { get: () => hit('indexedDB') });
    Object.defineProperty(document, 'cookie', {
      get: () => hit('cookie read'),
      set: () => hit('cookie write'),
    });
    window.fetch = () => hit('fetch');
    XMLHttpRequest.prototype.open = () => hit('XHR');
    navigator.sendBeacon = () => hit('beacon');
  });
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto('/#/loop/practice');
  await expect(page.locator('.loop-scenario')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const count = requests.length;
  for (const id of Object.keys(loopScenario.states)) await state(page, id as LoopStateId);
  expect(requests.length).toBe(count);
  const origin = new URL(page.url()).origin;
  expect(requests.every((url) => url.startsWith(origin + '/'))).toBe(true);
  expect(await page.evaluate(() => (window as any).__loopPrivacy)).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
  await expect(
    page.locator('.loop-experience input,.loop-experience textarea,.loop-experience form'),
  ).toHaveCount(0);
});
for (const mode of ['no-js', 'blocked-module'])
  test(`${mode}: root and both complete readings retain all text and branch links`, async ({
    browser,
  }) => {
    test.setTimeout(90000);
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js' }),
      page = await context.newPage();
    if (mode === 'blocked-module') await page.route('**/assets/*.js', (r) => r.abort());
    for (const path of ['/#/loop', '/read/loop.html', '/read/loop-practice.html']) {
      await page.goto(path);
      for (const s of Object.values(loopScenario.states)) {
        await expect(page.getByRole('heading', { name: s.heading, exact: true })).toBeVisible();
        for (const o of s.options)
          await expect(
            page
              .locator(
                '#loop-state-' +
                  Object.keys(loopScenario.states).find(
                    (k) => loopScenario.states[k].heading === s.heading,
                  ),
              )
              .getByRole('link', { name: o.label, exact: true }),
          ).toHaveAttribute('href', '#loop-state-' + o.next);
      }
      if (!path.includes('practice.html'))
        for (const section of loopSections)
          for (const b of section.blocks)
            if (b.kind === 'paragraph') await expect(page.locator('body')).toContainText(b.text);
      await page
        .getByRole('link', { name: 'Clear one usable space, then stop', exact: true })
        .click();
      expect(new URL(page.url()).hash).toBe('#loop-state-proof');
    }
    await context.close();
  });
test('WCAG scans cover full teaching, each scenario state and both native readers', async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const path of ['/#/loop', '/read/loop.html', '/read/loop-practice.html']) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await page.goto('/#/loop/practice');
  for (const id of Object.keys(loopScenario.states)) {
    await state(page, id as LoopStateId);
    expect(
      (
        await new AxeBuilder({ page })
          .include('.loop-experience')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

for (const reading of [
  { route: '/#/loop', native: false, teaching: true, transcript: false },
  { route: '/#/loop/practice', native: false, teaching: false, transcript: true },
  { route: '/read/loop.html', native: true, teaching: true, transcript: true },
  { route: '/read/loop-practice.html', native: true, teaching: false, transcript: true },
]) {
  test(`complete print content: ${reading.route}`, async ({ browser }, info) => {
    const context = await browser.newContext({ javaScriptEnabled: !reading.native });
    const page = await context.newPage();
    await page.goto(new URL(reading.route, info.project.use.baseURL).href);
    const scope = page.locator(reading.native ? 'main' : '#app main');
    await expect(scope).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    if (reading.teaching)
      for (const section of loopSections)
        for (const block of section.blocks) {
          const texts =
            block.kind === 'comparison'
              ? block.rows.flat()
              : [
                  block.kind === 'paragraph' && block.related
                    ? block.text + ' ' + block.related.label
                    : block.text,
                ];
          for (const text of texts)
            await expect(
              scope.getByText(text, { exact: true }).filter({ visible: true }).first(),
            ).toBeVisible();
        }
    if (reading.transcript) {
      await expect(scope.locator('.loop-transcript-state:visible')).toHaveCount(13);
      await expect(scope.locator('.loop-transcript-state a:visible')).toHaveCount(35);
      for (const state of Object.values(loopScenario.states))
        for (const text of [...state.body, ...state.options.map((o) => o.label)])
          await expect(
            scope.getByText(text, { exact: true }).filter({ visible: true }).first(),
          ).toBeVisible();
    }
    await expect(page.locator('.footer-print-urls')).toBeVisible();
    await expect(page.locator('.footer-print-urls')).toContainText('The Discipline Loop');
    if (info.project.name === 'chromium')
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath('loop-' + format + '.pdf'),
          format,
          printBackground: true,
        });
    await context.close();
  });
}

import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { executionSections, executionTargetIds, executionTexts } from '../../src/execution-content';
import { records } from './helpers/legacy-records';

const screen = (page: Page) => page.locator('.execution-screen');
const expectedCopy = executionTexts().map((p) => [p.id, p.text]);
const copies = async (page: Page, scope: string) =>
  page
    .locator(scope + ' [data-execution-copy]')
    .evaluateAll((els) =>
      els.map((el) => [el.getAttribute('data-execution-copy'), el.textContent]),
    );
const fits = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

test('fourth framework is reachable from home, both headers, footer and native index', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.framework-options article')).toHaveCount(4);
  await page.getByRole('link', { name: 'Explore Pure Execution Mode', exact: true }).click();
  await expect(screen(page).locator('h1')).toBeFocused();
  await expect(screen(page).locator('h1')).toHaveText('Pure Execution Mode');
  await expect(page.locator('.site-header a[href="#/execution"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(page.locator('.site-footer a[href="#/execution"]')).toHaveCount(1);
  await page.locator('.site-header a[href="#/period"]').click();
  await page.locator('.framework-switch a[href="#/execution"]').click();
  await expect(screen(page).locator('h1')).toBeFocused();
  await page.goto('/read/index.html');
  await page
    .getByRole('link', { name: 'Complete teaching, worked examples and explanations', exact: true })
    .click();
  await expect(page.locator('h1')).toHaveText('Pure Execution Mode');
  await expect(page.locator('[data-execution-section]')).toHaveCount(9);
});

test('all section and step addresses focus visible headings on direct load and reload', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/#/execution');
  await expect(screen(page).locator('h1')).toBeFocused();
  for (const id of executionTargetIds) {
    await page.goto('/#/execution?section=' + id);
    const target = screen(page).locator('#' + id);
    await expect(target).toBeFocused();
    await expect
      .poll(() => target.evaluate((el) => el.getBoundingClientRect().top))
      .toBeGreaterThanOrEqual(0);
    await expect
      .poll(() => target.evaluate((el) => el.getBoundingClientRect().top))
      .toBeLessThan(100);
    await page.reload();
    await expect(target).toBeFocused();
  }
  await page.goto('/#/execution?section=unknown');
  await expect(page.locator('h1')).toHaveText('That page is not here.');
});

test('disclosures use keyboard semantics without history and remain open during section reading', async ({
  page,
}) => {
  await page.goto('/#/execution?section=continue');
  const hint = screen(page).locator('[data-explanation="paragraph-hint"]');
  const summary = hint.locator('summary');
  await expect(screen(page).locator('details')).toHaveCount(5);
  await expect(screen(page).locator('details[open]')).toHaveCount(0);
  const entry = await page.evaluate(() => ({
    length: history.length,
    state: history.state,
    hash: location.hash,
  }));
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(hint).toHaveAttribute('open', '');
  await expect(summary).toBeFocused();
  expect(await summary.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Space');
  await expect(hint).not.toHaveAttribute('open');
  await page.keyboard.press('Enter');
  await screen(page).locator('[data-explanation="paragraph-reasoning"] summary').click();
  await expect(screen(page).locator('details[open]')).toHaveCount(2);
  expect(
    await page.evaluate(() => ({
      length: history.length,
      state: history.state,
      hash: location.hash,
    })),
  ).toEqual(entry);
  await screen(page).getByRole('link', { name: 'Continue to changed plans', exact: true }).click();
  await expect(screen(page).locator('#change')).toBeFocused();
  await expect(screen(page).locator('details[open]')).toHaveCount(2);
  await page.goBack();
  await expect(
    screen(page).getByRole('link', { name: 'Continue to changed plans', exact: true }),
  ).toBeFocused();
  await expect(screen(page).locator('details[open]')).toHaveCount(2);
  await page.reload();
  await expect(screen(page).locator('#continue')).toBeFocused();
  await expect(screen(page).locator('details[open]')).toHaveCount(0);
  await summary.click();
  await page.locator('.site-header a[href="#/loop"]').click();
  await page.locator('.site-header a[href="#/execution"]').click();
  await expect(screen(page).locator('details[open]')).toHaveCount(0);
});

test('section Back and Forward restore the issuing link and settled reading position', async ({
  page,
}) => {
  await page.goto('/#/execution');
  await page.evaluate(() => document.fonts.ready);
  const opener = screen(page).getByRole('link', { name: 'Read from the beginning', exact: true });
  await opener.scrollIntoViewIfNeeded();
  await opener.focus();
  const y = await page.evaluate(() => scrollY);
  await opener.press('Enter');
  await expect(screen(page).locator('#why')).toBeFocused();
  await page.goBack();
  await expect(opener).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
  await page.goForward();
  await expect(screen(page).locator('#why')).toBeFocused();
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
  await screen(page).getByRole('link', { name: 'Why this method exists', exact: true }).click();
  await expect(screen(page).locator('#why')).toBeFocused();
});

test('modified native links open the requested destination without changing the opener', async ({
  page,
  context,
}) => {
  await page.goto('/#/execution?section=continue');
  await screen(page).locator('summary').first().click();
  const hash = new URL(page.url()).hash;
  const state = await page.evaluate(() => history.state);
  const fresh = context.waitForEvent('page');
  await screen(page)
    .getByRole('link', { name: 'Revisit Flip the Switch', exact: true })
    .click({ modifiers: ['ControlOrMeta'] });
  const child = await fresh;
  await child.waitForLoadState();
  await expect(child.locator('.execution-screen #start')).toBeFocused();
  expect(new URL(page.url()).hash).toBe(hash);
  expect(await page.evaluate(() => history.state)).toEqual(state);
  await expect(screen(page).locator('details[open]')).toHaveCount(1);
  await child.close();
});

test('visiting execution preserves Standard Card draft and the accepted book-exit cancellation', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-standard').fill('Synthetic Work 80 draft.');
  await page.locator('.site-header a[href="#/execution"]').click();
  await expect(screen(page).locator('h1')).toBeFocused();
  await screen(page).locator('summary').first().click();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('Synthetic Work 80 draft.');
  await page.getByRole('link', { name: 'About the book', exact: true }).click();
  const opener = page.getByRole('link', { name: 'Explore the book and read a sample' });
  await page.locator('#main').focus();
  await opener.evaluate((el) =>
    el.addEventListener('mousedown', (event) => event.preventDefault(), { once: true }),
  );
  await opener.click();
  await expect(page.getByRole('button', { name: 'Stay here' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('Synthetic Work 80 draft.');
});

test('rendered reading and print preserve every paragraph once and unique IDs', async ({
  page,
}, info) => {
  for (const path of ['/#/execution', '/read/execution.html']) {
    await page.goto(path);
    const scope = path.includes('/read/')
      ? '[data-execution-surface="reading"]'
      : '.execution-screen';
    expect(await copies(page, scope)).toEqual(expectedCopy);
    const ids = await page.locator('[id]').evaluateAll((els) => els.map((el) => el.id));
    expect(new Set(ids).size).toBe(ids.length);
    await page.emulateMedia({ media: 'print' });
    const visible = await page
      .locator('[data-execution-copy]:visible')
      .evaluateAll((els) =>
        els.map((el) => [el.getAttribute('data-execution-copy'), el.textContent]),
      );
    expect(visible).toEqual(expectedCopy);
    await expect(page.locator('details:visible')).toHaveCount(0);
    if (info.project.name === 'chromium')
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath(
            (path.includes('/read/') ? 'native-' : 'enhanced-') + format + '.pdf',
          ),
          format,
          printBackground: true,
        });
    await page.emulateMedia({ media: 'screen' });
  }
});

for (const mode of ['no-js', 'blocked-script'])
  test(`${mode}: complete root fallback and native reader retain all targets and explanations`, async ({
    browser,
  }, info) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js' });
    const page = await context.newPage();
    if (mode === 'blocked-script') await page.route('**/assets/*.js', (route) => route.abort());
    for (const path of ['/#/execution?section=transfer', '/read/execution.html#transfer']) {
      await page.goto(new URL(path, info.project.use.baseURL).href);
      const root = !path.startsWith('/read/');
      const scope = `[data-execution-surface="${root ? 'root' : 'reading'}"]`;
      expect(await copies(page, scope)).toEqual(expectedCopy);
      await expect(page.locator(scope + ' details')).toHaveCount(0);
      for (const id of executionTargetIds) {
        expect(
          await page
            .locator(scope)
            .evaluate(
              (el, targetId) =>
                [...el.querySelectorAll('[id]')].some((node) => node.id === targetId),
              root ? '/execution?section=' + id : id,
            ),
        ).toBe(true);
      }
      const link = page
        .locator(scope)
        .getByRole('link', { name: 'When the plan needs to change', exact: true });
      await link.click();
      const heading = page.locator(scope + ' [data-section-heading="change"]');
      await expect
        .poll(() => heading.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
        .toBeLessThan(100);
      await page.emulateMedia({ media: 'print' });
      expect(await page.locator(scope + ' [data-execution-copy]:visible').count()).toBe(
        expectedCopy.length,
      );
      await page.emulateMedia({ media: 'screen' });
    }
    await context.close();
  });

for (const width of [320, 390, 1366])
  test(`workshop fits ${width}px, including open explanations and enlarged text`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/execution');
    await page.evaluate(() => document.fonts.ready);
    await fits(page);
    await page.screenshot({ path: info.outputPath('execution-' + width + '.png') });
    await page.goto('/#/execution?section=continue');
    for (const summary of await screen(page).locator('summary').all()) {
      await summary.click();
      const box = await summary.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await fits(page);
    await screen(page).locator('#continue').scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath('execution-expanded-' + width + '.png') });
    // CSSOM mutation models a user text-size override without bypassing the CSP.
    await page.evaluate(() =>
      document.styleSheets[0].insertRule('html { font-size: 200% !important; }', 0),
    );
    await fits(page);
    await expect(screen(page).locator('details[open]')).toHaveCount(5);
  });

test('reduced motion, forced colors, headings and disclosure accessibility remain usable', async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/#/execution?section=continue');
  const summary = screen(page).locator('summary').first();
  await summary.focus();
  await page.keyboard.press('Space');
  await expect(summary).toBeFocused();
  expect(await summary.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await fits(page);
  await page.emulateMedia({ forcedColors: 'none' });
  for (const path of ['/#/execution', '/read/execution.html']) {
    await page.goto(path);
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    if (path === '/#/execution') {
      for (const s of await screen(page).locator('summary').all())
        if (!(await s.locator('..').evaluate((el) => (el as HTMLDetailsElement).open)))
          await s.click();
      expect(
        (
          await new AxeBuilder({ page })
            .include('.execution-screen')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      const snapshot = await screen(page).ariaSnapshot();
      expect(snapshot).toContain('Read a hint');
      expect(snapshot).toContain('Read the discussion');
      for (const summary of await screen(page).locator('summary').all()) {
        await expect(summary).toHaveAccessibleName(
          /Read (a hint|the reasoning|the discussion): .+/,
        );
        await expect(summary.locator('..')).toHaveAttribute('open', '');
      }
      await info.attach('execution-accessibility-tree', {
        body: snapshot,
        contentType: 'text/plain',
      });
    }
  }
});

test('disposable legacy records stay unread and unchanged, without results, cookies or network activity', async ({
  page,
  context,
}) => {
  await page.addInitScript((legacy) => {
    for (const [key, value] of Object.entries(legacy)) localStorage.setItem(key, value);
    const storage = localStorage;
    const original = Storage.prototype.getItem;
    (window as any).__work80 = {
      calls: [],
      fixture: () =>
        Object.fromEntries(Object.keys(legacy).map((key) => [key, original.call(storage, key)])),
    };
    const hit = (name: string): never => {
      (window as any).__work80.calls.push(name);
      throw Error('Forbidden ' + name);
    };
    for (const method of ['getItem', 'setItem', 'removeItem', 'clear', 'key'])
      Object.defineProperty(Storage.prototype, method, { value: () => hit('Storage.' + method) });
    Object.defineProperty(window, 'localStorage', { get: () => hit('localStorage') });
    Object.defineProperty(window, 'sessionStorage', { get: () => hit('sessionStorage') });
    Object.defineProperty(window, 'indexedDB', { get: () => hit('indexedDB') });
    Object.defineProperty(document, 'cookie', {
      get: () => hit('cookie read'),
      set: () => hit('cookie write'),
    });
    window.fetch = () => hit('fetch');
    XMLHttpRequest.prototype.open = () => hit('XHR');
    navigator.sendBeacon = () => hit('beacon');
  }, records);
  const requests: { url: string; method: string }[] = [];
  page.on('request', (request) => requests.push({ url: request.url(), method: request.method() }));
  await page.goto('/#/execution');
  await expect(screen(page)).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const count = requests.length;
  for (const summary of await screen(page).locator('summary').all()) await summary.click();
  for (const section of executionSections)
    await screen(page)
      .locator('.execution-contents')
      .getByRole('link', { name: section.title, exact: true })
      .click();
  expect(requests.length).toBe(count);
  const origin = new URL(page.url()).origin;
  expect(requests.every((r) => r.method === 'GET' && r.url.startsWith(origin + '/'))).toBe(true);
  expect(await page.evaluate(() => (window as any).__work80.calls)).toEqual([]);
  expect(await page.evaluate(() => (window as any).__work80.fixture())).toEqual(records);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
  await expect(
    screen(page).locator('form, input, textarea, button, [contenteditable]'),
  ).toHaveCount(0);
});

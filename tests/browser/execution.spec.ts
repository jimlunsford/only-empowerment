import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { executionTargetIds, executionTexts } from '../../src/execution-content';
import {
  workshopScreens,
  workshopById,
  workshopHref,
  legacyWorkshopMap,
  eventCarry,
} from '../../src/execution-workshop-content';
import { records } from './helpers/legacy-records';
const screen = (page: Page) => page.locator('.execution-screen');
const heading = (page: Page) => screen(page).locator('h1');
const expectedCopy = executionTexts().map((p) => [p.id, p.text]);
const copies = async (page: Page, scope: string) =>
  page
    .locator(scope + ' [data-execution-copy]')
    .evaluateAll((els) =>
      els.map((el) => [el.getAttribute('data-execution-copy'), el.textContent]),
    );
const fits = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
const go = async (page: Page, id: string) => {
  await page.goto('/' + workshopHref(id));
  await expect(screen(page)).toHaveAttribute('data-workshop', id);
};
const next = (page: Page) => screen(page).getByRole('link', { name: /^Continue/ });

test('workshop is primary from home, both headers, footer and native reading', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.framework-options article')).toHaveCount(4);
  await page.getByRole('link', { name: 'Explore Pure Execution Mode', exact: true }).click();
  await expect(heading(page)).toHaveText('Pure Execution Mode');
  await expect(heading(page)).toBeFocused();
  await expect(page.locator('.site-header a[href="#/execution"]')).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(page.locator('.site-footer a[href="#/execution"]')).toHaveCount(1);
  await page.locator('.site-header a[href="#/period"]').click();
  await page.locator('.framework-switch a[href="#/execution"]').click();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'welcome');
  const readingTab = page.waitForEvent('popup');
  await screen(page)
    .getByRole('link', { name: 'Complete reading and print edition (new tab)', exact: true })
    .click();
  const reading = await readingTab;
  await expect(reading.locator('[data-execution-section]')).toHaveCount(9);
  await expect(reading.locator('[data-workshop-transcript]')).toHaveCount(workshopScreens.length);
  await reading.getByRole('link', { name: 'Open the guided workshop', exact: true }).click();
  await expect(screen(reading)).toHaveAttribute('data-workshop', 'welcome');
  await reading.close();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'welcome');
});

test('every screen supports direct entry, title, refresh and unforced Continue', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const s of workshopScreens) {
    await go(page, s.id);
    await expect(heading(page)).toHaveText(s.title);
    await expect(heading(page)).toHaveAttribute(
      'id',
      s.id === 'welcome' ? '/execution' : '/execution/' + s.id,
    );
    await expect(heading(page)).toBeFocused();
    expect(
      (await screen(page).locator('.workshop-position').boundingBox())!.y,
    ).toBeGreaterThanOrEqual(0);
    await expect(page).toHaveTitle(s.title + ' | Only Empowerment');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await page.reload();
    await expect(heading(page)).toBeFocused();
    if (s.next) {
      await next(page).click();
      await expect(screen(page)).toHaveAttribute('data-workshop', s.next);
      await expect(heading(page)).toBeFocused();
    }
  }
  await page.goto('/#/execution/welcome');
  await expect(heading(page)).toHaveAttribute('id', '/execution/welcome');
  await expect(heading(page)).toBeFocused();
  await page.reload();
  await expect(heading(page)).toBeFocused();
  await page.goto('/#/execution/unknown');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('That page is not here.');
});

test('all old section and step URLs map intentionally and retain original native destinations', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const [legacy, id] of Object.entries(legacyWorkshopMap)) {
    await page.goto('/#/execution?section=' + legacy);
    await expect(screen(page)).toHaveAttribute('data-workshop', id);
    await expect(heading(page)).toBeFocused();
    await expect(
      screen(page).getByRole('link', { name: 'Read the original section in full' }),
    ).toHaveAttribute('href', '/read/execution.html#' + legacy);
    await page.reload();
    await expect(heading(page)).toBeFocused();
  }
});

for (const s of workshopScreens.filter((s) => s.action))
  test('demonstration: ' + s.id, async ({ page }) => {
    await go(page, s.id);
    const entry = await page.evaluate(() => ({
      hash: location.hash,
      length: history.length,
      state: history.state,
    }));
    const reveal = screen(page).getByRole('button', { name: s.action!.label, exact: true });
    await reveal.press('Enter');
    await expect(
      screen(page).getByRole('heading', { name: 'What changed', exact: true }),
    ).toBeFocused();
    await expect(screen(page).getByText(s.action!.result, { exact: true })).toBeVisible();
    await expect(screen(page).getByText(s.action!.remains, { exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => ({
        hash: location.hash,
        length: history.length,
        state: history.state,
      })),
    ).toEqual(entry);
    await next(page).click();
    await page.goBack();
    await expect(screen(page).getByText(s.action!.result, { exact: true })).toBeVisible();
    await page.reload();
    await expect(screen(page).getByText(s.action!.result, { exact: true })).toHaveCount(0);
  });

for (const s of workshopScreens.filter((s) => s.options && !s.deferred))
  test('every authored consequence and branch: ' + s.id, async ({ page }) => {
    await go(page, s.id);
    for (const option of s.options!) {
      const entry = await page.evaluate(() => ({
        hash: location.hash,
        length: history.length,
        state: history.state,
      }));
      await screen(page).getByRole('button', { name: option.label, exact: true }).press('Enter');
      await expect(
        screen(page).getByRole('heading', { name: 'What this choice does' }),
      ).toBeFocused();
      await expect(screen(page).locator('.workshop-feedback')).toContainText(option.consequence);
      await expect(screen(page).locator('.workshop-feedback')).toContainText(option.reasoning);
      expect(
        await page.evaluate(() => ({
          hash: location.hash,
          length: history.length,
          state: history.state,
        })),
      ).toEqual(entry);
      await expect(next(page)).toHaveAttribute('href', workshopHref(option.next || s.next!));
      await next(page).click();
      await expect(screen(page)).toHaveAttribute('data-workshop', option.next || s.next!);
      await page.goBack();
      await expect(
        screen(page).getByRole('button', { name: option.label, exact: true }),
      ).toHaveAttribute('aria-pressed', 'true');
      await screen(page)
        .getByRole('button', { name: 'Reconsider this decision', exact: true })
        .click();
      await expect(screen(page).locator('#workshop-question')).toBeFocused();
      await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(0);
    }
    await screen(page)
      .getByRole('button', { name: 'Compare every option and read the explanation', exact: true })
      .click();
    for (const option of s.options!) {
      await expect(screen(page).locator('#workshop-comparison')).toContainText(option.consequence);
      await expect(screen(page).locator('#workshop-comparison')).toContainText(option.reasoning);
    }
  });

test('independent sequence carries all initial choices, defers feedback, and compares every outcome', async ({
  page,
}) => {
  for (const first of workshopById('event').options!) {
    await go(page, 'event');
    await screen(page).getByRole('button', { name: first.label, exact: true }).click();
    await expect(screen(page).locator('.workshop-feedback')).toHaveCount(0);
    await next(page).click();
    await expect(screen(page).locator('.workshop-carry')).toHaveText(
      eventCarry({ event: first.id }),
    );
    await screen(page)
      .getByRole('button', { name: workshopById('event-wait').options![0].label, exact: true })
      .click();
    await next(page).click();
    await screen(page)
      .getByRole('button', { name: workshopById('event-close').options![0].label, exact: true })
      .click();
    await next(page).click();
    await expect(screen(page)).toHaveAttribute('data-workshop', 'compare');
    await expect(screen(page)).toContainText(first.consequence);
    for (const summary of await screen(page).locator('.workshop-review summary').all())
      await summary.click();
    for (const id of ['event', 'event-wait', 'event-close'])
      for (const option of workshopById(id).options!) {
        await expect(screen(page)).toContainText(option.consequence);
        await expect(screen(page)).toContainText(option.reasoning);
      }
    await screen(page)
      .locator('.workshop-review')
      .first()
      .getByRole('link', { name: 'Revisit this decision' })
      .click();
    await screen(page)
      .getByRole('button', { name: 'Reconsider this decision', exact: true })
      .click();
    await screen(page)
      .getByRole('link', { name: 'Skip practice and compare the reasoning now' })
      .click();
    await expect(screen(page).getByText('No choice in this session.', { exact: true })).toHaveCount(
      3,
    );
  }
});

for (const decision of workshopScreens.filter((s) => s.deferred))
  test('independent selection and comparison: ' + decision.id, async ({ page }) => {
    for (const option of decision.options!) {
      await go(page, decision.id);
      await screen(page).getByRole('button', { name: option.label, exact: true }).click();
      await expect(
        screen(page).getByRole('button', { name: option.label, exact: true }),
      ).toHaveAttribute('aria-pressed', 'true');
      await expect(screen(page).locator('.workshop-feedback')).toHaveCount(0);
      await screen(page)
        .getByRole('link', { name: 'Skip practice and compare the reasoning now' })
        .click();
      const review = screen(page).getByRole('region', { name: decision.title });
      await expect(review).toContainText('Your choice: ' + option.label);
      await expect(review).toContainText(option.consequence);
      await expect(review).toContainText(option.reasoning);
    }
  });

test('visible Back follows the chosen recovery branch', async ({ page }) => {
  await go(page, 'take-over');
  await screen(page)
    .getByRole('button', { name: workshopById('take-over').options![0].label, exact: true })
    .click();
  await next(page).click();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'recover');
  await screen(page)
    .getByRole('button', { name: workshopById('recover').options![1].label, exact: true })
    .click();
  await next(page).click();
  await expect(screen(page).getByRole('link', { name: /^Back:/ })).toHaveAttribute(
    'href',
    workshopHref('recover'),
  );
  await screen(page)
    .getByRole('link', { name: /^Back:/ })
    .click();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'recover');
  await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(1);
  await go(page, 'take-over');
  await screen(page)
    .getByRole('button', { name: workshopById('take-over').options![1].label, exact: true })
    .click();
  await next(page).click();
  await expect(screen(page).getByRole('link', { name: /^Back:/ })).toHaveAttribute(
    'href',
    workshopHref('take-over'),
  );
  await go(page, 'recover');
  await expect(screen(page).locator('.workshop-carry')).toHaveCount(0);
});

test('Back, Forward, skip, route exit, refresh, restart and modified links respect the session', async ({
  page,
  context,
}) => {
  await go(page, 'take-over');
  const option = workshopById('take-over').options![1];
  await screen(page).getByRole('button', { name: option.label, exact: true }).click();
  await next(page).click();
  await page.goBack();
  await expect(screen(page).locator('[aria-pressed="true"]')).toContainText(option.label);
  await page.goForward();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'arrange');
  await screen(page)
    .getByRole('link', { name: 'Skip this practice and continue to changed facts' })
    .click();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'access');
  const fresh = context.waitForEvent('page');
  await screen(page)
    .getByRole('link', { name: 'Work independently', exact: true })
    .click({ modifiers: ['ControlOrMeta'] });
  const child = await fresh;
  await child.waitForLoadState();
  await expect(child.locator('.execution-screen')).toHaveAttribute('data-workshop', 'event');
  await expect(screen(page)).toHaveAttribute('data-workshop', 'access');
  await child.close();
  await screen(page).getByRole('button', { name: 'Restart workshop', exact: true }).click();
  await expect(screen(page)).toHaveAttribute('data-workshop', 'welcome');
  await screen(page).getByRole('link', { name: 'Take over', exact: true }).click();
  await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(0);
  await screen(page).getByRole('button', { name: option.label, exact: true }).click();
  await page.reload();
  await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(0);
  await screen(page).getByRole('button', { name: option.label, exact: true }).click();
  await page.locator('.site-header a[href="#/loop"]').click();
  await page.goBack();
  await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(0);
  await screen(page).getByRole('button', { name: option.label, exact: true }).click();
  // Reading links now preserve the workshop in another tab. A whole-document
  // departure must still clear the session, including a return through Back.
  await page.goto('/read/execution.html');
  await page.goBack();
  await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
});

for (const width of [320, 390, 1366])
  test(`all screens reflow at ${width}px and 200 percent text`, async ({ page }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    for (const s of workshopScreens) {
      await go(page, s.id);
      await page.evaluate(() => document.fonts.ready);
      await fits(page);
      if (s.options && !s.deferred) {
        await screen(page).getByRole('button', { name: s.options[0].label, exact: true }).click();
        await screen(page)
          .getByRole('button', {
            name: 'Compare every option and read the explanation',
            exact: true,
          })
          .click();
      }
      if (s.action)
        await screen(page).getByRole('button', { name: s.action.label, exact: true }).click();
      await fits(page);
      if (['welcome', 'take-over', 'access', 'event', 'compare'].includes(s.id))
        await page.screenshot({
          path: info.outputPath('workshop-' + s.id + '-' + width + '.png'),
          fullPage: true,
        });
      for (const button of await screen(page).locator('button').all())
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.evaluate(() =>
        document.styleSheets[0].insertRule('html { font-size: 200% !important; }', 0),
      );
      await fits(page);
      await page.evaluate(() => document.styleSheets[0].deleteRule(0));
    }
  });

test('keyboard, reduced motion, forced colors, understandable feedback and axe coverage', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await go(page, 'take-over');
  await heading(page).press('Tab');
  const first = screen(page).locator('.workshop-options button').first();
  await expect(first).toBeFocused();
  await page.keyboard.press('Space');
  await expect(screen(page).getByRole('heading', { name: 'What this choice does' })).toBeFocused();
  expect(
    await screen(page)
      .getByRole('heading', { name: 'What this choice does' })
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe('none');
  await page.emulateMedia({ forcedColors: 'none' });
  for (const id of ['welcome', 'switch', 'take-over', 'access', 'event', 'compare', 'reference']) {
    await go(page, id);
    const s = workshopById(id);
    if (s.options && !s.deferred)
      await screen(page).getByRole('button', { name: s.options[0].label, exact: true }).click();
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
  }
  await page.goto('/read/execution.html');
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await info.attach('workshop-accessibility-tree', {
    body: await page.locator('main').ariaSnapshot(),
    contentType: 'text/plain',
  });
});
test('visiting execution preserves Standard Card draft and the accepted book-exit cancellation', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-standard').fill('Synthetic Work 82 draft.');
  await page.locator('.site-header a[href="#/execution"]').click();
  await expect(screen(page).locator('h1')).toBeFocused();
  await screen(page).locator('summary').first().click();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('Synthetic Work 82 draft.');
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
  await expect(page.locator('#period-standard')).toHaveValue('Synthetic Work 82 draft.');
});

test('rendered reading and print preserve every paragraph once and unique IDs', async ({
  page,
}, info) => {
  for (const path of ['/#/execution', '/read/execution.html']) {
    await page.goto(path);
    const scope = path.includes('/read/')
      ? '[data-execution-surface="reading"]'
      : '.execution-print';
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
    await expect(page.locator('[data-workshop-option]:visible')).toHaveCount(
      workshopScreens.reduce((count, s) => count + (s.options?.length || 0), 0),
    );
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
  await screen(page).getByRole('link', { name: 'Take over', exact: true }).click();
  await screen(page).getByRole('button', { name: 'Set the shelf aside.', exact: false }).click();
  await screen(page)
    .getByRole('link', { name: /^Continue/ })
    .click();
  await screen(page).getByRole('button', { name: 'Keep the return open.', exact: false }).click();
  await screen(page).getByRole('button', { name: 'Restart workshop', exact: true }).click();
  expect(requests.length).toBe(count);
  const origin = new URL(page.url()).origin;
  expect(requests.every((r) => r.method === 'GET' && r.url.startsWith(origin + '/'))).toBe(true);
  expect(await page.evaluate(() => (window as any).__work80.calls)).toEqual([]);
  expect(await page.evaluate(() => (window as any).__work80.fixture())).toEqual(records);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
  await expect(screen(page).locator('form, input, textarea, [contenteditable]')).toHaveCount(0);
});

for (const s of workshopScreens.filter((s) => s.options && !s.deferred))
  test('reselection clears stale status: ' + s.id, async ({ page }) => {
    await go(page, s.id);
    const status = screen(page).getByRole('status', { includeHidden: true });
    for (const index of [0, 0, 1, 1]) {
      const option = s.options![index];
      const button = screen(page).getByRole('button', { name: option.label, exact: true });
      await button.press('Enter');
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(1);
      await expect(screen(page).locator('.workshop-feedback')).toContainText(option.consequence);
      await expect(
        screen(page).getByRole('heading', { name: 'What this choice does' }),
      ).toBeFocused();
      await expect(status).toBeEmpty();
      await expect(
        screen(page).getByText(
          'Choice cleared. You can choose again or continue without choosing.',
          { exact: true },
        ),
      ).toHaveCount(0);
      await screen(page)
        .getByRole('button', { name: 'Reconsider this decision', exact: true })
        .click();
      await expect(screen(page).locator('[aria-pressed="true"]')).toHaveCount(0);
      await expect(screen(page).locator('.workshop-feedback')).toHaveCount(0);
      await expect(status).toHaveText(
        'Choice cleared. You can choose again or continue without choosing.',
      );
      await expect(screen(page).locator('#workshop-question')).toBeFocused();
    }
  });

test('deferred reselection retains status and dependent-choice rules', async ({ page }) => {
  const ids = ['event', 'event-wait', 'event-close'];
  const select = async (id: string, index: number) => {
    await screen(page)
      .getByRole('button', { name: workshopById(id).options![index].label, exact: true })
      .click();
    await expect(screen(page).getByRole('status')).toHaveText(
      'Choice kept for comparison. Continue when you are ready. Changing this choice clears later decisions in this sequence.',
    );
    await expect(screen(page).locator('.workshop-feedback')).toHaveCount(0);
  };
  await go(page, 'event');
  for (const id of ids) {
    await select(id, 0);
    await next(page).click();
  }
  const revisit = (index: number) =>
    screen(page)
      .locator('.workshop-review')
      .nth(index)
      .getByRole('link', { name: 'Revisit this decision' })
      .click();
  const compare = () =>
    screen(page).getByRole('link', { name: 'Skip practice and compare the reasoning now' }).click();
  await revisit(0);
  await select('event', 0);
  await compare();
  await expect(screen(page).getByText('No choice in this session.', { exact: true })).toHaveCount(
    0,
  );
  await revisit(1);
  await select('event-wait', 1);
  await compare();
  await expect(screen(page).getByText('No choice in this session.', { exact: true })).toHaveCount(
    1,
  );
  await revisit(2);
  await select('event-close', 0);
  await compare();
  await revisit(0);
  await select('event', 1);
  await compare();
  await expect(screen(page).getByText('No choice in this session.', { exact: true })).toHaveCount(
    2,
  );
  await revisit(0);
  await screen(page).getByRole('button', { name: 'Reconsider this decision', exact: true }).click();
  await expect(screen(page).getByRole('status')).toHaveText(
    'Choice cleared. You can choose again or continue without choosing.',
  );
  await expect(screen(page).locator('#workshop-question')).toBeFocused();
  await select('event', 1);
  await compare();
  await expect(screen(page).getByText('No choice in this session.', { exact: true })).toHaveCount(
    2,
  );
});

import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import approved from '../fixtures/work32-homepage-copy.json' with { type: 'json' };
import { homepage as c } from '../../src/period-homepage-content';
const target = (page: Page, id: string) => page.locator(`[id="${id}"]`);
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const copy = async (page: Page) => {
  const text = (await page.locator('.homepage').innerText()).replace(/\s+/g, ' ');
  let after = 0;
  for (const line of approved) {
    const index = text.indexOf(line, after);
    expect(index, `Approved copy missing or out of sequence: ${line}`).toBeGreaterThanOrEqual(
      after,
    );
    after = index + line.length;
  }
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(
    page.locator('.homepage :is(form, input, select, textarea, button, details)'),
  ).toHaveCount(0);
  expect(text).not.toContain('Keep your answer to yourself. There is nothing to submit.');
};
const visibleTarget = async (page: Page, id: string) => {
  await expect(target(page, id)).toBeFocused();
  const box = await target(page, id).boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(50);
};

test('approved copy, always-visible comparison, privacy and exact attribution', async ({
  page,
}) => {
  await page.goto('/');
  await copy(page);
  await expect(page.locator('.home-limits')).toContainText(c.comparison.adaptation);
  await expect(page.locator('.home-access')).toContainText(
    "The card's draft stays only in the open tab",
  );
  await expect(page.locator('.home-book a')).toHaveAttribute('href', c.bookUrl);
  await expect(page.locator('.founder-copyright')).toHaveText(
    'Copyright © Jim Lunsford. All rights reserved. A Phoenix 2:33 LLC Project.',
  );
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('first moment and Why PERIOD support direct entry, keyboard, repetition, reload and history', async ({
  page,
}) => {
  for (const [id, label] of [
    ['/period/first-moment', c.start],
    ['/period/why', c.whyHeading],
  ]) {
    await page.goto('/#' + id);
    await visibleTarget(page, id);
    await page.reload();
    await visibleTarget(page, id);
    await page.getByRole('link', { name: label, exact: true }).focus();
    await page.keyboard.press('Enter');
    await visibleTarget(page, id);
    await page.evaluate(() => scrollTo(0, 0));
    await page.getByRole('link', { name: label, exact: true }).click();
    await visibleTarget(page, id);
    await page.evaluate(() => scrollTo(0, 650));
    await page.locator('.home-access a').evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page.locator('h1')).toHaveText('Your answers are not ours to collect.');
    await page.goBack();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
    await page.goForward();
    await expect(page.locator('h1')).toHaveText('Your answers are not ours to collect.');
  }
  for (const [native, app] of [
    ['first-moment', '/period/first-moment'],
    ['why-period', '/period/why'],
    ['teaching-order', '/period/teaching-order'],
  ]) {
    await page.goto('/#' + native);
    await visibleTarget(page, app);
  }
});

test('modified anchor clicks retain native new-tab semantics without moving the original page', async ({
  browser,
  baseURL,
}) => {
  // Ctrl/Meta + Shift opens the native destination in a foreground tab.
  // This avoids headless background-tab suspension while exercising the link.
  for (const label of [c.start, c.whyHeading, 'Explore the values']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(baseURL! + '/');
    await page.bringToFront();
    const link = page.getByRole('link', { name: label, exact: true });
    const before = page.url();
    const popup = context.waitForEvent('page');
    await link.click({ modifiers: ['ControlOrMeta', 'Shift'], noWaitAfter: true });
    const next = await popup;
    await next.bringToFront();
    expect(page.url()).toBe(before);
    const id = (await link.getAttribute('href'))!.slice(1);
    await visibleTarget(next, id);
    await context.close();
  }
});

test('disabled and failed JavaScript retain the teaching, native anchors and complete readings', async ({
  browser,
  baseURL,
}) => {
  for (const mode of ['disabled', 'failed']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode === 'failed') await context.route('**/*.js', (route) => route.abort());
    const page = await context.newPage();
    await page.goto(baseURL! + '/');
    await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
    await copy(page);
    await expect(page.locator('footer')).toHaveCount(1);
    await expect(page.locator('.home-access')).toContainText(c.readingBoundary);
    await expect(page.locator('.home-access')).toContainText(c.legacy);
    await expect(
      page.getByRole('heading', { name: 'Ownership', exact: true, level: 2 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Purpose.', exact: true, level: 2 }),
    ).toBeVisible();
    for (const [id, label] of [
      ['first-moment', c.start],
      ['why-period', c.whyHeading],
      ['teaching-order', 'Explore the values'],
    ]) {
      await page.getByRole('link', { name: label, exact: true }).focus();
      await page.keyboard.press('Enter');
      await visibleTarget(page, id);
      await page.reload();
      await expect(target(page, id)).toBeInViewport();
      await page.getByRole('link', { name: label, exact: true }).click();
      await visibleTarget(page, id);
    }
    await page.goBack();
    await expect(page).toHaveURL(/#why-period$/);
    await page.goForward();
    await expect(page).toHaveURL(/#teaching-order$/);
    for (const id of ['first-moment', 'why-period']) {
      await page.goto(baseURL! + '/#' + id);
      await expect(target(page, id)).toBeInViewport();
    }
    // Native new-tab navigation is exercised with JavaScript disabled. The
    // failed-script mode separately verifies fallback reading and all anchors.
    if (mode === 'disabled') {
      await page.bringToFront();
      const newReading = context.waitForEvent('page');
      await page
        .getByRole('link', { name: c.start, exact: true })
        .click({ modifiers: ['ControlOrMeta', 'Shift'], noWaitAfter: true });
      const next = await newReading;
      await next.bringToFront();
      await expect(target(next, 'first-moment')).toBeInViewport();
      await next.close();
    }
    await context.close();
  }
});

test('homepage navigation neither reads storage nor loses an existing Standard Card draft', async ({
  page,
}) => {
  await page.addInitScript(() => {
    for (const key of ['localStorage', 'sessionStorage', 'indexedDB'])
      Object.defineProperty(window, key, {
        get() {
          throw new Error('Unexpected visitor storage access: ' + key);
        },
      });
  });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#/period/standard');
  const marker = '  SYNTHETIC Work 33\nMy words remain mine.  ';
  await page.locator('#period-standard').fill(marker);
  for (const label of ['Why PERIOD?', 'Explore the values'])
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: label, exact: true })
      .click();
  await page.getByRole('link', { name: c.start, exact: true }).click();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue(marker);
  expect(errors).toEqual([]);
});

test('desktop and mobile openings, full pages, text enlargement and reflow remain usable', async ({
  browser,
  baseURL,
}, info) => {
  test.setTimeout(120000);
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled, deviceScaleFactor: 1 });
    const page = await context.newPage();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({
        width,
        height: width === 1440 ? 900 : width === 390 ? 844 : 740,
      });
      await page.goto(baseURL! + '/');
      await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
      expect(await fits(page)).toBe(true);
      const moment = await page.locator('.home-moment h2').boundingBox();
      expect(moment!.y).toBeLessThan(width === 1440 ? 600 : 740);
      const stem = `work33-${javaScriptEnabled ? 'app' : 'reading'}-${width}`;
      // Chromium produces the requested uninterrupted full-resolution evidence.
      // All engines still verify the complete document's geometry and reading.
      if (['chromium', 'mobile-chromium'].includes(info.project.name)) {
        await page.screenshot({ path: info.outputPath(stem + '-viewport.png') });
        await page.screenshot({ path: info.outputPath(stem + '-full.png'), fullPage: true });
      }
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(await fits(page)).toBe(true);
    if (['chromium', 'mobile-chromium'].includes(info.project.name))
      await page.screenshot({
        path: info.outputPath(`work33-${javaScriptEnabled ? 'app' : 'reading'}-320-text200.png`),
      });
    await context.close();
  }
});

test('reduced motion, forced colors, missing fonts and text spacing preserve reading and focus', async ({
  page,
}) => {
  await page.route('**/*.woff2', (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
    const s = document.createElement('style');
    s.textContent =
      '.homepage *, .site-header * {line-height:1.5!important; letter-spacing:.12em!important; word-spacing:.16em!important} .homepage p {margin-bottom:2em!important}';
    document.head.append(s);
  });
  expect(await fits(page)).toBe(true);
  await page.getByRole('link', { name: c.start, exact: true }).focus();
  await page.keyboard.press('Enter');
  await visibleTarget(page, '/period/first-moment');
  expect(
    await target(page, '/period/first-moment').evaluate((e) => getComputedStyle(e).outlineStyle),
  ).toBe('solid');
});

test('A4 and Letter retain full homepage teaching and the complete root reading', async ({
  browser,
  baseURL,
}, info) => {
  test.skip(
    info.project.name !== 'chromium',
    'PDF export uses desktop Chromium; other projects verify layout and reading.',
  );
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled });
    const page = await context.newPage();
    await page.goto(baseURL! + '/');
    await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
    await page.emulateMedia({ media: 'print' });
    const text = (await page.locator('.homepage').innerText()).replace(/\s+/g, ' ');
    for (const line of approved.filter((s) => ![c.start, c.continue].includes(s)))
      expect(text).toContain(line);
    await expect(page.locator('.founder-copyright')).toHaveCount(1);
    await expect(page.locator('.footer-print-urls')).toContainText('No warranty');
    for (const format of ['A4', 'Letter'] as const)
      await page.pdf({
        path: info.outputPath(`work33-${javaScriptEnabled ? 'app' : 'reading'}-${format}.pdf`),
        format,
        printBackground: true,
        margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
        tagged: true,
      });
    await context.close();
  }
});

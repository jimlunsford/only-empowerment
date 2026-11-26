import { loopRestartPaths } from '../../src/loop-practice-content';
import { openSiteMenu } from './helpers/site-menu';
import { test, expect, type Page, type Locator } from '@playwright/test';

const lessons = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
const rebuild = ['line', 'structure', 'return', 'trust', 'negotiation', 'help'];
const entries = [
  '/',
  '/period',
  ...lessons.map((id) => '/period/values/' + id),
  '/rebuild',
  ...rebuild.map((id) => '/rebuild/' + id),
  '/rebuild/end',
  '/rebuild/complete',
  '/loop',
  '/loop/practice',
  '/loop/practice?state=miss',
  '/missing',
  '/rebuild/missing',
];
async function opening(page: Page) {
  await expect(page.locator('#app h1')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('#app h1')).toBeInViewport();
}
for (const route of entries)
  test(`Work72 initial entry, reload and new tab open at the beginning: ${route}`, async ({
    page,
    context,
  }) => {
    // A direct document load is the browser lifecycle shared by pasted and bookmarked URLs.
    await page.goto('/#' + route);
    await opening(page);
    const heading = await page.locator('#app h1').textContent();
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.reload();
    await opening(page);
    const tab = await context.newPage();
    await tab.goto(page.url());
    await opening(tab);
    await expect(tab.locator('#app h1')).toHaveText(heading!);
    await tab.close();
    // Cross-document history must not resurrect the native fallback's former scroll.
    await page.goto('/read/index.html');
    await page.goBack();
    await opening(page);
    await page.goForward();
    await expect(page).toHaveURL(/\/read\/index\.html$/);
  });

test('Work72 a reading position chosen immediately after enhancement survives the first frame', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const observer = new MutationObserver(() => {
      if (
        document.querySelector('#app .homepage') &&
        !document.getElementById('educational-fallback')
      ) {
        scrollTo(0, 500);
        document.documentElement.dataset.work72ChosenPosition = String(scrollY);
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('/#/period');
  await expect(page.locator('html')).toHaveAttribute('data-work72-chosen-position', '500');
  const position = await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return scrollY;
  });
  expect(position).toBe(500);
});

test('Work72 internal framework and Rebuild lesson navigation retains heading focus and history', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/');
  for (const [label, route] of [
    ['Explore The PERIOD Code', '/period'],
    ['Explore How to Rebuild Yourself', '/rebuild'],
    ['Explore The Discipline Loop', '/loop'],
  ]) {
    const link = page.getByRole('link', { name: label, exact: true });
    await link.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(new RegExp('#' + route + '$'));
    await expect(page.locator('#app h1')).toBeFocused();
    await page.goBack();
    await expect(page.locator('.framework-hub')).toBeVisible();
    await page.goForward();
    await expect(page.locator('#app h1')).toBeVisible();
    await page.locator('.site-header a[href="#/"]').first().click();
  }
  for (const id of rebuild) {
    await page.getByRole('link', { name: 'Explore How to Rebuild Yourself', exact: true }).click();
    await page.locator('.module-list a[href="#/rebuild/' + id + '"]').click();
    await expect(page.locator('#app h1')).toBeFocused();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await page.goBack();
    await expect(page.locator('.module-list')).toBeVisible();
    await page.goForward();
    await expect(page.locator('#app h1')).toBeVisible();
    await page.locator('.site-header a[href="#/"]').first().click();
  }
});

test('Work72 valid section deep links still align, focus, refresh and traverse history', async ({
  page,
}) => {
  for (const [route, selector] of [
    ['/rebuild/line?section=example', '#app #example'],
    ['/rebuild/line?section=note-3', '#app #note-3'],
    ['/loop?section=part-3', '#app #part-3'],
    ['/period/discipline/pattern/miss', '[id="/period/discipline/pattern/miss"]'],
    ['/period/teaching-order', '[id="/period/teaching-order"]'],
  ]) {
    await page.goto('/#' + route);
    await expect(page.locator(selector)).toBeFocused();
    await expect(page.locator(selector)).toBeInViewport();
    await page.reload();
    await expect(page.locator(selector)).toBeFocused();
    await expect(page.locator(selector)).toBeInViewport();
    const home = page.locator('.site-header a[href="#/"]').first();
    await home.scrollIntoViewIfNeeded();
    const departureScroll = await page.evaluate(() => scrollY);
    await home.click();
    await page.goBack();
    await expect.poll(() => new URL(page.url()).hash).toBe('#' + route);
    await expect
      .poll(() => page.evaluate((y) => Math.abs(scrollY - y), departureScroll))
      .toBeLessThan(1);
    await page.goForward();
    await expect(page.locator('.framework-hub')).toBeVisible();
  }
});

for (const width of [1440, 768, 390, 320])
  for (const route of ['/loop', '/loop/practice'])
    test(`Work72 entire Loop heading outline clears text at ${width}px: ${route}`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      const heading = page.locator('#app h1');
      async function check(mode: string) {
        await expect(heading).toBeFocused();
        await page.evaluate(() => document.fonts.ready);
        const g = await heading.evaluate((h) => {
          const r = h.getBoundingClientRect(),
            s = getComputedStyle(h);
          const footprint = parseFloat(s.outlineWidth) + parseFloat(s.outlineOffset);
          return {
            above: r.top - footprint - h.previousElementSibling!.getBoundingClientRect().bottom,
            below: h.nextElementSibling!.getBoundingClientRect().top - r.bottom - footprint,
            outlineWidth: parseFloat(s.outlineWidth),
            outlineOffset: parseFloat(s.outlineOffset),
            outlineStyle: s.outlineStyle,
            top: r.top - footprint,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        await info.attach(mode + '-geometry', {
          body: JSON.stringify(g),
          contentType: 'application/json',
        });
        await info.attach(mode + '-focus', {
          body: await page.screenshot(),
          contentType: 'image/png',
        });
        expect(g.above).toBeGreaterThanOrEqual(7.5);
        expect(g.below).toBeGreaterThanOrEqual(7.5);
        expect(g.outlineWidth).toBe(3);
        expect(g.outlineOffset).toBe(5);
        expect(g.outlineStyle).toBe('solid');
        expect(g.top).toBeGreaterThanOrEqual(0);
        expect(g.overflow).toBe(false);
      }
      await page.goto('/#' + route);
      // Initial document entry keeps native tab order. Exercise the actual heading outline.
      await heading.focus();
      await check('direct');
      await page.reload();
      await heading.focus();
      await check('reload');
      await page.locator('.site-header a[href="#/"]').first().click();
      const entry = page.getByRole('link', { name: 'Explore The Discipline Loop', exact: true });
      await entry.focus();
      await page.keyboard.press('Enter');
      if (route.endsWith('practice')) {
        await page.getByRole('link', { name: 'Try a pressure point', exact: true }).focus();
        await page.keyboard.press('Enter');
      }
      await check('keyboard-navigation');
    });

test('Work72 every restart entrance and exit remains causal and matches both static editions', async ({
  page,
}) => {
  test.setTimeout(90000);
  const paths = [
    [1, 2, 0], // Overbuilt plan -> spiral -> restart, no phone cause established.
    [2, 1, 0], // Miss -> spiral -> restart.
    [2, 0], // Miss -> restart.
    [2, 2, 0], // Miss -> hide -> restart.
    [3, 2, 1], // Changed capacity -> rest escape -> restart.
  ];
  const expectedPaths = Object.values(loopRestartPaths);
  const keys = ['overbuilt', 'spiral', 'miss', 'hide', 'rest_escape'] as const;
  for (const [index, path] of paths.entries())
    for (const [exit, next] of ['correction', 'rest', 'spiral'].entries()) {
      await page.goto('/#/loop/practice');
      await page.getByRole('button', { name: 'Reset example', exact: true }).click();
      for (const choice of path) await page.locator('.loop-choices button').nth(choice).click();
      await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'restart');
      const actual = await page.locator('.loop-scenario > p').allTextContents();
      const expected = loopRestartPaths[keys[index]];
      expect(actual[0]).toBe(expected.fact);
      expect(actual[2]).toBe(expected.action);
      expect(actual.join(' ')).toContain('Neither does pretending it did not matter.');
      await page.locator('.loop-choices button').nth(exit).click();
      await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', next);
      await expect(page.locator('#loop-scenario-heading')).toBeFocused();
    }
  for (const route of ['/read/loop.html', '/read/loop-practice.html']) {
    await page.goto(route + '#loop-state-restart');
    const paragraphs = await page.locator('#loop-state-restart > p').allTextContents();
    for (const expected of expectedPaths) {
      expect(paragraphs).toContain(expected.fact);
      expect(paragraphs).toContain(expected.action);
    }
    expect(paragraphs[0]).toContain('Find the break in the path you followed.');
  }
});

test('Work72 Reset replaces the miss entry; reload, Back and Forward agree with the visible start', async ({
  page,
}) => {
  await page.goto('/#/loop');
  await page.getByRole('link', { name: 'Try the restart example', exact: true }).click();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'miss');
  const length = await page.evaluate(() => history.length);
  await page
    .getByRole('button', { name: 'Tell the truth and locate the break', exact: true })
    .click();
  await expect(page).toHaveURL(/state=miss$/); // Choices are still in memory only.
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  await expect(page).toHaveURL(/#\/loop\/practice$/);
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  expect(await page.evaluate(() => history.length)).toBe(length);
  await page.reload();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  await page.goBack();
  await expect(page).toHaveURL(/#\/loop$/);
  await page.goForward();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  await page.locator('.loop-choices button').first().click();
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  await expect(page.locator('#loop-scenario-heading')).toBeFocused();
  await page.reload();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  for (const value of ['proof', 'unknown', 'miss&answer=x']) {
    await page.goto('/#/loop/practice?state=' + value);
    await expect(page.locator('h1')).toHaveText('That page is not here.');
  }
});

test('Work72 PERIOD lesson queries do not change lesson identity or accept unknown paths', async ({
  page,
}) => {
  for (const id of lessons) {
    await page.goto('/#/period/values/' + id);
    const heading = await page.locator('#app h1').textContent();
    for (const query of ['section=x', 'section=part-3&state=miss']) {
      await page.goto('/#/period/values/' + id + '?' + query);
      await expect(page.locator('#app h1')).toHaveText(heading!);
      await page.reload();
      await expect(page.locator('#app h1')).toHaveText(heading!);
    }
  }
  for (const id of ['unknown', 'ownership/extra', 'ownership-extra']) {
    await page.goto('/#/period/values/' + id + '?section=x');
    await expect(page.locator('#app h1')).toHaveText('Choose a value');
  }
});

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((e) => e === document.activeElement)) return;
  }
  throw Error('Keyboard traversal did not reach the authored link');
}
for (const width of [1440, 768, 390, 320])
  test(`Work72 keyboard Rebuild alternatives retain the whole focus outline at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    for (const note of [3, 4]) {
      await page.goto('/#/rebuild/line');
      await tabTo(page, page.locator('.quotesheet .q' + note));
      await page.keyboard.press('Enter');
      for (const mode of ['keyboard', 'reload']) {
        if (mode === 'reload') await page.reload();
        const panel = page.locator('#note-' + note);
        await expect(panel).toBeFocused();
        const g = await panel.evaluate((e) => {
          const s = getComputedStyle(e);
          return {
            top: e.getBoundingClientRect().top,
            width: parseFloat(s.outlineWidth),
            offset: parseFloat(s.outlineOffset),
            visible: e.matches(':focus-visible'),
            style: s.outlineStyle,
          };
        });
        await info.attach(`${note}-${mode}-geometry`, {
          body: JSON.stringify(g),
          contentType: 'application/json',
        });
        await info.attach(`${note}-${mode}-focus`, {
          body: await page.screenshot(),
          contentType: 'image/png',
        });
        expect(g.visible).toBe(true);
        expect(g.width).toBe(3);
        expect(g.offset).toBe(3);
        expect(g.style).toBe('solid');
        expect(g.top - g.width - g.offset).toBeGreaterThanOrEqual(9.5);
      }
    }
  });

test('Work72 no-script root introduces all frameworks and retains real native reading anchors', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(90000);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL! + '/');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  {
    await openSiteMenu(page);
    await expect(nav.getByRole('link')).toHaveText([
      'Frameworks',
      'The PERIOD Code',
      'How to Rebuild Yourself',
      'The Discipline Loop',
      'Pure Execution Mode',
    ]);
  }
  {
    await openSiteMenu(page);
    await nav.getByRole('link', { name: 'The PERIOD Code', exact: true }).click();
  }
  await expect(page.locator('#why-period')).toBeInViewport();
  for (const [name, path, title] of [
    ['How to Rebuild Yourself', '/read/rebuild.html', 'How to Rebuild Yourself: Complete reading'],
    ['The Discipline Loop', '/read/loop.html', 'The Discipline Loop'],
    ['Pure Execution Mode', '/read/execution.html', 'Pure Execution Mode'],
  ]) {
    await page.goto(baseURL! + '/');
    {
      await openSiteMenu(page);
      await nav.getByRole('link', { name, exact: true }).click();
    }
    expect(new URL(page.url()).pathname).toBe(path);
    await expect(page.locator('h1')).toHaveText(title);
  }
  for (const id of [
    '/rebuild',
    ...rebuild.map((x) => '/rebuild/' + x),
    '/loop',
    '/loop?section=five-parts',
    'reading-ownership',
  ]) {
    await page.goto(baseURL! + '/#' + id);
    const target = page.locator('[id="' + id + '"]');
    await expect(target).toBeInViewport();
    await expect(page.locator('#educational-fallback')).toBeVisible();
    await expect(page.locator('#app h1')).toHaveCount(0);
  }
  await context.close();
});

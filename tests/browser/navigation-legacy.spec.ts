import { test, expect, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { seed } from './helpers/legacy-records';

const values = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
const tools = [
  'decision-room',
  'next-move',
  'build-a-standard',
  'reset',
  'rebuild-map',
  'do-it-now',
];
const routes = [
  '/',
  '/period/teaching-order',
  '/period/values',
  ...values.map((v) => '/period/values/' + v),
  '/period/practice',
  '/period/practice/responses',
  '/period/practice/follow-through',
  '/period/practice/connected-code',
  '/period/purpose/evening',
  '/period/resilience/pressure',
  '/period/integrity/record',
  '/period/discipline/pattern',
  '/period/values/discipline/examine',
  ...[
    'promise',
    'first-action',
    'repeated-action',
    'miss',
    'return',
    'changed-capacity',
    'continuation',
  ].map((anchor) => '/period/discipline/pattern/' + anchor),
  '/period/empowerment/conversation',
  '/period/standard',
  '/period/book',
  '/tools',
  '/saved',
  '/approach',
  '/privacy',
  ...tools.map((t) => '/tools/' + t),
  '/missing',
];
const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });
const footer = (page: Page) => page.getByRole('contentinfo');
const dataButton = (page: Page) =>
  page.getByRole('button', { name: 'Delete legacy tool data', exact: true });
const snapshot = (page: Page) =>
  page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
const privateDraft = 'SYNTHETIC WORK23: Keep my words.\nOne intended behavior, not proof.';
test('every retained hash route shares three primary links and two visible footer groups', async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const route of routes) {
    await page.goto('/#' + route);
    await expect(page.locator('h1')).toBeVisible();
    if (route !== '/missing')
      await expect(page.locator('h1')).not.toHaveText('That page is not here.');
    await expect(mainNav(page).getByRole('link')).toHaveText([
      'Why PERIOD?',
      'Explore the values',
      'Optional Standard Card',
    ]);
    expect(
      await mainNav(page)
        .getByRole('link')
        .evaluateAll((links) => links.map((l) => l.getAttribute('href'))),
    ).toEqual(['#/', '#/period/teaching-order', '#/period/standard']);
    await expect(
      footer(page).getByRole('navigation', { name: 'About this site' }).getByRole('link'),
    ).toHaveText(['About the book', 'Privacy & source']);
    await expect(
      footer(page).getByRole('navigation', { name: 'Existing work' }).getByRole('link'),
    ).toHaveText(['Legacy tools', 'Saved work']);
    await expect(footer(page).getByRole('link', { name: 'AGPL-3.0-or-later' })).toHaveAttribute(
      'href',
      '/LICENSE.txt',
    );
    await mainNav(page).getByRole('link', { name: 'Explore the values' }).click();
    await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
    await expect(
      page.getByRole('navigation', { name: 'PERIOD teaching order' }).getByRole('link'),
    ).toHaveCount(6);
    await expect(mainNav(page).getByRole('link', { name: 'Explore the values' })).toHaveAttribute(
      'aria-current',
      'location',
    );
  }
});

test('same-page teaching order, repeat activation, Back and Forward retain location, focus and reading position', async ({
  page,
}) => {
  await page.goto('/');
  const explore = mainNav(page).getByRole('link', { name: 'Explore the values' });
  await explore.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
  await page.evaluate(() => scrollTo(0, 650));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await footer(page)
    .getByRole('link', { name: 'Legacy tools', exact: true })
    .evaluate((e: HTMLElement) => e.click());
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(650);
  await page.goForward();
  await expect(page.locator('h1')).toHaveText('Legacy tools');
  await explore.click();
  await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
  await page.evaluate(() => scrollTo(0, 0));
  await explore.click();
  await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
  await mainNav(page).getByRole('link', { name: 'Why PERIOD?', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
  await expect(
    mainNav(page).getByRole('link', { name: 'Why PERIOD?', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
});

test('six raw legacy records survive navigation and reopening; deletion is bounded and leaves the separate card intact', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await seed(page);
  const original = await snapshot(page);
  await mainNav(page).getByRole('link', { name: 'Optional Standard Card' }).click();
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill(privateDraft);
  await page.locator('#period-nextApplication').fill('SYNTHETIC: Give the next update honestly.');
  await footer(page).getByRole('link', { name: 'Legacy tools', exact: true }).click();
  await page.getByRole('link', { name: 'About the legacy tools', exact: true }).click();
  await footer(page).getByRole('link', { name: 'Saved work', exact: true }).click();
  expect(await snapshot(page)).toEqual(original);
  for (const [type, tool] of [
    ['Execution Card', 'next-move'],
    ['Decision Record', 'decision-room'],
    ['Personal Standard', 'build-a-standard'],
    ['Reset Plan', 'reset'],
    ['Rebuild Map', 'rebuild-map'],
    ['Action Record', 'do-it-now'],
  ]) {
    await page.getByRole('button', { name: new RegExp('^Open ' + type) }).click();
    await expect(page).toHaveURL(new RegExp('#/tools/' + tool + '$'));
    await expect(page.getByRole('button', { name: /^Copy / })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Print/ })).toBeVisible();
    await footer(page).getByRole('link', { name: 'Saved work', exact: true }).click();
    expect(await snapshot(page)).toEqual(original);
  }
  await dataButton(page).click();
  await expect(page.getByRole('dialog')).toContainText('Standard Card draft will not be cleared');
  await page.keyboard.press('Escape');
  expect(await snapshot(page)).toEqual(original);
  await dataButton(page).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete legacy tool data', exact: true })
    .click();
  await expect(page.locator('.local-delete [role="status"]')).toContainText('removal was verified');
  await expect(page.locator('.local-delete [role="status"]')).toContainText(
    'Standard Card draft was not cleared',
  );
  expect(await snapshot(page)).toEqual({ 'unrelated-work23': 'leave intact' });
  await mainNav(page).getByRole('link', { name: 'Optional Standard Card' }).click();
  await expect(page.locator('#period-standard')).toHaveValue(privateDraft);
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await page.getByRole('button', { name: 'Keep writing' }).click();
  await expect(page.locator('#period-standard')).toHaveValue(privateDraft);
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('');
  expect(await snapshot(page)).toEqual({ 'unrelated-work23': 'leave intact' });
  await writeFile(
    info.outputPath('work23-fictional-records.json'),
    JSON.stringify(original, null, 2),
  );
});

test('denied storage deletion reports failure accurately and preserves the separate draft', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-standard').fill(privateDraft);
  await page.evaluate(() =>
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('synthetic denied storage');
      },
    }),
  );
  await footer(page).getByRole('link', { name: 'Privacy & source', exact: true }).click();
  await dataButton(page).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete legacy tool data', exact: true })
    .click();
  await expect(page.locator('.local-delete [role="status"]')).toContainText(
    'could not be verified',
  );
  await expect(page.locator('.local-delete [role="status"]')).toContainText(
    'Standard Card draft was not cleared',
  );
  await mainNav(page).getByRole('link', { name: 'Optional Standard Card' }).click();
  await expect(page.locator('#period-standard')).toHaveValue(privateDraft);
});

for (const width of [1440, 390, 320])
  test(`shared navigation and support pages reflow at ${width} CSS pixels`, async ({
    page,
  }, info) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    if (info.project.name === 'chromium') {
      await page.goto('/#/saved');
      await expect(
        page.getByRole('heading', { name: 'No saved work in this browser on this site.' }),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: info.outputPath(`work23-saved-empty-${width}.png`),
        fullPage: true,
      });
    }
    await seed(page);
    for (const [name, route] of [
      ['home', '/'],
      ['lesson', '/period/values/ownership'],
      ['legacy', '/tools'],
      ['saved', '/saved'],
    ]) {
      await page.goto('/#' + route);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const mark = page.locator('.wordmark');
      const markBounds = await mark.boundingBox();
      expect(markBounds).not.toBeNull();
      expect(markBounds!.x).toBeGreaterThanOrEqual(0);
      expect(markBounds!.x + markBounds!.width).toBeLessThanOrEqual(width);
      expect(await mark.evaluate((el) => el.getClientRects().length)).toBe(1);
      await page.keyboard.press('Tab');
      for (const link of await mainNav(page).getByRole('link').all()) {
        await link.focus();
        await expect(link).toBeFocused();
        expect(await link.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
      }
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      if (info.project.name === 'chromium') {
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          scrollTo(0, 0);
        });
        await page.screenshot({
          path: info.outputPath(`work23-${name}-${width}.png`),
          fullPage: true,
        });
        await footer(page).screenshot({
          path: info.outputPath(`work23-${name}-footer-${width}.png`),
        });
      }
    }
  });

test('new shell supports keyboard sequence, text spacing, enlarged text and emulated contrast and reduced motion', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/#/tools');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Only Empowerment home' })).toBeFocused();
  for (const link of await mainNav(page).getByRole('link').all()) {
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
  }
  const footerLinks = await footer(page).getByRole('link').all();
  await footerLinks[0].focus();
  for (const link of footerLinks.slice(1)) {
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
  }
  for (const route of ['/tools', '/saved', '/period/values/ownership', '/']) {
    await page.evaluate((r) => {
      location.hash = r;
    }, route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
      for (const element of document.querySelectorAll<HTMLElement>('*')) {
        element.style.setProperty('letter-spacing', '.12em', 'important');
        element.style.setProperty('word-spacing', '.16em', 'important');
        element.style.setProperty('line-height', '1.5', 'important');
        if (element.tagName === 'P') element.style.setProperty('margin-bottom', '2em', 'important');
      }
    });
    const overflow = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .filter((el) => el.scrollWidth > el.clientWidth + 1)
        .slice(0, 15)
        .map((el) => ({
          tag: el.tagName,
          class: el.className,
          right: el.getBoundingClientRect().right,
          scroll: el.scrollWidth,
          client: el.clientWidth,
          text: el.textContent?.slice(0, 80),
        })),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      JSON.stringify({ route, overflow }),
    ).toBe(true);
  }
  if (info.project.name === 'chromium')
    await page.screenshot({
      path: info.outputPath('work23-320-enlarged-spacing-forced-colors.png'),
      fullPage: true,
    });
});

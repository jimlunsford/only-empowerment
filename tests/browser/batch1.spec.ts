import { test, expect, type Locator } from '@playwright/test';
import { loopScenario } from '../../src/loop-practice-content';
import {
  workshopScreens,
  workshopHref,
  legacyWorkshopMap,
} from '../../src/execution-workshop-content';

test('Batch 1.1: shared outcomes fit every reported incoming path and match both readings', async ({
  page,
}) => {
  const scenario = page.locator('.loop-scenario');
  const choose = async (label: string) =>
    page.getByRole('button', { name: label, exact: true }).click();
  await page.goto('/#/loop/practice?state=miss');
  await choose('Tell the truth and locate the break');
  await choose('Capacity is limited; arrange help or a return');
  await expect(scenario).toHaveAttribute('data-state', 'rest');
  await expect(scenario).not.toContainText(/go to bed|after sleep|inadequate sleep|put the phone/);
  await expect(scenario).toContainText(
    'arrange help or a realistic return that fits your capacity',
  );
  for (const afterMinimum of [false, true]) {
    await page.goto('/#/loop/practice');
    await choose('Reset example');
    if (afterMinimum) await choose('Clear one usable space, then stop');
    await choose(
      afterMinimum
        ? 'Meet a different pressure tomorrow'
        : 'Explore a night when sleep must come first',
    );
    await expect(scenario).toHaveAttribute('data-state', 'fatigue');
    await expect(scenario).not.toContainText('Continuing a house reset');
    await expect(scenario).toContainText('Taking on more work');
  }
  await page.goto('/#/loop/practice');
  await choose('Reset example');
  await choose('Plan a complete house reset tonight');
  await choose('Call the whole effort ruined and avoid it');
  await choose('Name the miss and begin correction');
  await choose('Take the specific corrective action');
  await expect(scenario).toHaveAttribute('data-state', 'correction');
  await expect(scenario).not.toContainText('phone');
  await expect(scenario).toContainText('address the break you identified');
  for (const path of ['/read/loop.html', '/read/loop-practice.html']) {
    await page.goto(path);
    for (const id of ['rest', 'fatigue', 'correction'] as const) {
      const state = loopScenario.states[id];
      const outcome = page.locator('#loop-state-' + id);
      for (const text of [...state.body, ...(state.loop || []).map((entry) => entry.text)])
        await expect(outcome).toContainText(text);
    }
  }
});

test('Batch 1.2: every workshop reading link declares a safe new tab, including legacy entries', async ({
  page,
}) => {
  test.setTimeout(90000);
  const routes = [
    ...workshopScreens.map((screen) => workshopHref(screen.id)),
    ...Object.keys(legacyWorkshopMap).map((id) => '#/execution?section=' + id),
  ];
  for (const route of routes) {
    await page.goto('/' + route);
    const links = page.locator('.workshop a[href^="/read/"]');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).toContainText('(new tab)');
    }
  }
});

test('Batch 1.2: opening and closing a reading retains a choice without persisting it', async ({
  page,
}) => {
  await page.goto('/#/execution/take-over');
  const option = page.locator('.workshop-options button').first();
  await option.click();
  await expect(option).toHaveAttribute('aria-pressed', 'true');
  const readingPromise = page.waitForEvent('popup');
  await page
    .getByRole('link', { name: 'Complete reading and print edition (new tab)', exact: true })
    .click();
  const reading = await readingPromise;
  await expect(reading).toHaveURL(/\/read\/execution\.html$/);
  expect(await reading.evaluate(() => window.opener === null)).toBe(true);
  await reading.close();
  await expect(page).toHaveURL(/#\/execution\/take-over$/);
  await expect(option).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(option).toHaveAttribute('aria-pressed', 'false');
});

for (const width of [320, 1366])
  test(`Batch 1.3: homepage and four frameworks use loaded Source fonts at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/#/period',
      '/#/rebuild',
      '/#/loop',
      '/#/loop/practice',
      '/#/execution',
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const main = page.locator('#app main');
      await expect(main.getByRole('heading', { level: 1 })).toHaveCSS(
        'font-family',
        /Source Serif/,
      );
      await expect(main.locator(route === '/#/rebuild' ? '.introbody p' : 'p').first()).toHaveCSS(
        'font-family',
        /Source Sans/,
      );
      expect(
        await page.evaluate(() =>
          [...document.fonts].some(
            (font) => font.family.includes('Source Serif') && font.status === 'loaded',
          ),
        ),
      ).toBe(true);
      expect(
        await page.evaluate(() =>
          [...document.fonts].some(
            (font) => font.family.includes('Source Sans') && font.status === 'loaded',
          ),
        ),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });

async function focusOutline(heading: Locator, visible: boolean) {
  await expect(heading).toBeFocused();
  await expect(heading).toHaveAttribute('tabindex', '-1');
  await expect(heading).toHaveCSS('outline-style', visible ? 'solid' : 'none');
  if (visible) {
    await expect(heading).toHaveCSS('outline-width', '3px');
    await expect(heading).toHaveCSS('outline-offset', '5px');
  }
}
for (const forcedColors of ['none', 'active'] as const)
  test(`Batch 1.4: route headings retain focus with keyboard-only outlines (${forcedColors})`, async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ forcedColors });
    for (const [route, link] of [
      ['/', 'Explore The Discipline Loop'],
      ['/#/loop', 'Try a pressure point'],
      ['/', 'Explore Pure Execution Mode'],
      ['/#/execution', 'Continue'],
    ]) {
      await page.goto(route);
      const entry = page
        .getByRole('link', {
          name: link === 'Continue' ? /^Continue/ : link,
          exact: link !== 'Continue',
        })
        .first();
      if (isMobile) await entry.tap();
      else await entry.click();
      await focusOutline(page.locator('#app main').getByRole('heading', { level: 1 }), false);
      await page.goto(route);
      const keyboardEntry = page
        .getByRole('link', {
          name: link === 'Continue' ? /^Continue/ : link,
          exact: link !== 'Continue',
        })
        .first();
      await keyboardEntry.focus();
      await page.keyboard.press('Enter');
      await focusOutline(page.locator('#app main').getByRole('heading', { level: 1 }), true);
      const heading = page.locator('#app main').getByRole('heading', { level: 1 });
      // Switching input method must update an already focused heading too.
      if (isMobile) await heading.tap();
      else await heading.click();
      await focusOutline(heading, false);
      await page.keyboard.press('ArrowRight');
      await focusOutline(heading, true);
      await page.emulateMedia({ media: 'print' });
      await expect(heading).toHaveCSS('outline-style', 'none');
      await page.emulateMedia({ media: 'screen' });
    }
  });

test('Batch 1.5: served notices preserve the OFL with encoding-independent Source quotes', async ({
  request,
}) => {
  const response = await request.get('/THIRD_PARTY_NOTICES.txt');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  expect(text.match(/Reserved Font Name 'Source'/g)).toHaveLength(2);
  expect(text).toContain('SIL OPEN FONT LICENSE Version 1.1');
  expect(text).not.toMatch(/â€|\u2018Source\u2019/);
});

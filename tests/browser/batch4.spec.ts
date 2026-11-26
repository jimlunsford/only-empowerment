import { readdirSync } from 'node:fs';
import { rebuildTrees } from '../../src/rebuild-content';
import { practiceViews } from '../../src/period-practice-content';
import { lessonLinkName } from './helpers/period-link-name';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { workshopScreens } from '../../src/execution-workshop-content';
import { loopRestartPaths } from '../../src/loop-practice-content';

const lessons = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
test('Batch 4 visible labels pass the explicit axe rule across the app and every workshop screen', async ({
  page,
}) => {
  test.setTimeout(240000);
  const routes = [
    '/',
    '/period',
    '/privacy',
    '/loop',
    '/loop/practice',
    '/rebuild',
    ...Object.keys(rebuildTrees).map((id) => '/rebuild/' + id),
    '/period/standard',
    '/period/why',
    '/period/teaching-order',
    '/period/book',
    '/loop/practice?state=miss',
    '/period/purpose/evening',
    '/period/resilience/pressure',
    '/period/integrity/record',
    '/period/discipline/pattern',
    '/period/empowerment/conversation',
    ...practiceViews.map((view) => view.path),
    '/missing',
    ...lessons.map((id) => '/period/values/' + id),
    ...workshopScreens.map((s) => '/execution/' + s.id),
  ];
  for (const route of routes) {
    await page.goto('/#' + route);
    await expect(page.locator('.site-header .wordmark')).toHaveAccessibleName(
      'Only Empowerment home',
    );
    expect(await page.locator('.site-header .wordmark').textContent()).not.toContain('\u00ad');
    const result = await new AxeBuilder({ page })
      .withRules(['label-content-name-mismatch'])
      .analyze();
    expect(result.violations, route).toEqual([]);
    if (route.startsWith('/execution/')) {
      for (const link of await page.locator('.workshop-navigation a').all()) {
        const text = (await link.innerText()).replace(/\s+/g, ' ').trim();
        await expect(link).toHaveAccessibleName(text);
      }
    }
  }
  for (const file of readdirSync('dist/read').filter((file) => file.endsWith('.html'))) {
    await page.goto('/read/' + file);
    const result = await new AxeBuilder({ page })
      .withRules(['label-content-name-mismatch'])
      .analyze();
    expect(result.violations, file).toEqual([]);
  }
});

test('Batch 4 Privacy leads with memory-only facts and preserves safe keyboard confirmation', async ({
  page,
}) => {
  await page.goto('/#/privacy');
  await expect(page.locator('main')).toContainText('No accounts. No tracking is enabled');
  const headings = await page.locator('main h2').allTextContents();
  expect(headings.indexOf('Delete legacy tool data')).toBeGreaterThan(
    headings.indexOf('Analytics and tracking boundaries'),
  );
  const trigger = page.getByRole('button', { name: 'Delete legacy tool data', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true }),
  ).toBeFocused();
  await expect(
    page
      .getByRole('dialog')
      .getByRole('button', { name: 'Confirm deletion of legacy data', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.goto('/read/privacy.html');
  await expect(page.locator('main > p').first()).toContainText('No accounts. No tracking');
});

test('Batch 4 Discipline uses the six-lesson heading, subtitle and position-label style', async ({
  page,
}) => {
  let reference: unknown;
  for (const [index, value] of lessons.entries()) {
    await page.goto('/#/period/values/' + value);
    await expect(page.locator('.lesson-heading h1')).toHaveText(
      value[0].toUpperCase() + value.slice(1) + '.',
    );
    await expect(page.locator('.lesson-heading .position')).toHaveText(
      `${index + 1} of 6 in the teaching order`,
    );
    for (const label of lessons) {
      const name = label[0].toUpperCase() + label.slice(1);
      const link = page.locator('.lesson-value-link[href="#/period/values/' + label + '"]');
      await expect(link).toHaveAccessibleName(
        lessonLinkName(name, await link.locator('.path-role').isVisible()),
      );
      await expect(link).toHaveAccessibleDescription(
        (await link.locator('.path-role').textContent()) ?? '',
      );
    }
    const style = await page.locator('.lesson-heading').evaluate((el) =>
      ['h1', '.lead', '.position'].map((selector) => {
        const s = getComputedStyle(el.querySelector(selector)!);
        return [s.fontFamily, s.fontSize, s.fontWeight, s.lineHeight, s.color, s.textTransform];
      }),
    );
    if (reference) expect(style).toEqual(reference);
    else reference = style;
  }
  await page.goto('/#/period/values/discipline');
  await expect(page.locator('.lesson-heading .lead')).toHaveText(
    'Put your values into practice when the feeling fades.',
  );
  await page.goto('/read/discipline.html');
  await expect(page.locator('h1')).toHaveText('Discipline.');
  await expect(page.locator('.discipline-heading .lead')).toHaveText(
    'Put your values into practice when the feeling fades.',
  );
});

test('Batch 4 Loop history stays private and direct entry retains the complete fallback', async ({
  page,
}) => {
  await page.goto('/#/loop/practice');
  await page.locator('.loop-choices button').nth(2).click();
  await page.locator('.loop-choices button').nth(0).click();
  await expect(page.locator('.loop-scenario')).toContainText(loopRestartPaths.miss.fact);
  await expect(page.locator('#loop-scenario-heading')).toBeFocused();
  await expect(page).toHaveURL(/#\/loop\/practice$/);
  await page.getByRole('button', { name: 'Previous choice', exact: true }).click();
  await page.locator('.loop-choices button').nth(2).click();
  await page.locator('.loop-choices button').nth(0).click();
  await expect(page.locator('.loop-scenario')).toContainText(loopRestartPaths.hide.fact);
  await expect(page.locator('.loop-scenario')).not.toContainText(loopRestartPaths.miss.fact);
  await page.reload();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
  await page.goto('/#/loop/practice?state=miss');
  await page.locator('.loop-choices button').nth(0).click();
  await expect(page.locator('.loop-scenario')).toContainText(
    'Did you avoid the task, expand it beyond what you could sustain, hide the miss, or use it to condemn the whole effort?',
  );
  await expect(page).toHaveURL(/state=miss$/);
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  await expect(page.locator('.loop-scenario')).toHaveAttribute('data-state', 'pressure');
});

test('Batch 4 no-JavaScript wordmark and reading parity remain accessible', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('.site-header .wordmark')).toHaveAccessibleName(
    'Only Empowerment home',
  );
  expect(await page.locator('.site-header .wordmark').textContent()).not.toContain('\u00ad');
  for (const route of ['/read/loop.html', '/read/loop-practice.html']) {
    await page.goto(route);
    for (const copy of Object.values(loopRestartPaths)) {
      await expect(page.locator('#loop-state-restart')).toContainText(copy.fact);
      await expect(page.locator('#loop-state-restart')).toContainText(copy.action);
    }
  }
  await context.close();
});

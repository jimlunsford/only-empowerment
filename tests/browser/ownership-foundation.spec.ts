import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import approved from '../fixtures/work37-ownership-copy.json' with { type: 'json' };
import { periodValues } from '../../src/period-content';
import { practiceCopy, practiceViews } from '../../src/period-practice-content';

const f = approved.ownershipFoundation;
const anchors = [
  'reading-ownership-practice',
  'reading-ownership-responses',
  'reading-ownership-follow-through',
  'reading-ownership-connected-code',
];
const headings = [
  'Meaning',
  f.whyFirst.heading,
  periodValues[0].lesson.misconceptionHeading,
  f.explanation.heading,
  'Everyday example',
  f.help.heading,
  f.evidence.heading,
  'Put it into practice',
  f.connected.heading,
  'Put Ownership into an ordinary moment',
  'Why Purpose comes next',
];
const newText = Object.values(f).flatMap((value) =>
  typeof value === 'string' ? [value] : value.paragraphs,
);
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('complete foundation is in reading order, exact and optional, with no author story', async ({
  page,
}) => {
  await page.goto('/#/period/values/ownership');
  const lesson = page.getByRole('article', { name: 'Ownership lesson' });
  await expect(lesson.locator('h2')).toHaveText(headings);
  for (const text of newText) await expect(lesson.getByText(text, { exact: true })).toHaveCount(1);
  await expect(lesson).toContainText(periodValues[0].lesson.meaning);
  await expect(lesson).not.toContainText('Read the meaning, see an ordinary example');
  await expect(lesson).not.toContainText('What I had to own');
  await expect(lesson.locator('input, textarea, select, button')).toHaveCount(0);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await lesson.getByRole('link', { name: 'Continue to Purpose', exact: true }).focus();
  const previousY = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toHaveText('Purpose.');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  // The old link was unmounted. The established router restores its position
  // and uses the new page heading as the accessible focus fallback.
  await expect(page.locator('h1')).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(previousY, 0);
  await lesson.getByRole('link', { name: 'Practice Ownership', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toHaveText(practiceViews[0].title);
  await expect(page.locator('h1')).toBeFocused();
});

test('bridges belong only to Situation and connected Code; existing views remain independently reachable', async ({
  page,
}) => {
  for (const [index, view] of practiceViews.entries()) {
    await page.goto('/#' + view.path);
    const article = page.locator('.practice-body');
    await expect(article.getByText(practiceCopy.lessonBridge, { exact: true })).toHaveCount(
      index === 0 ? 1 : 0,
    );
    await expect(article.getByText(practiceCopy.purposeBridge, { exact: true })).toHaveCount(
      index === 3 ? 1 : 0,
    );
    await expect(
      page.getByRole('navigation', { name: 'Practice Ownership views' }).getByRole('link'),
    ).toHaveCount(4);
  }
  const action = page.locator('.practice-take-action');
  await expect(action.locator('p')).toHaveText([
    practiceCopy.takeAction,
    practiceCopy.purposeBridge,
    'Carry that responsibility into the next ordinary choice. Purpose will help you decide what deserves your time and effort.',
  ]);
});

test('four native reading aliases resolve existing app views on direct entry, reload and keyboard history', async ({
  page,
}) => {
  for (const [index, anchor] of anchors.entries()) {
    await page.goto('/#' + anchor);
    await expect(page.locator('h1')).toHaveText(practiceViews[index].title);
    await page.reload();
    await expect(page.locator('h1')).toHaveText(practiceViews[index].title);
  }
  await page.goto('/#/period/values/ownership');
  // A native incoming fragment link exercises alias activation, not an added app control.
  for (const [index, anchor] of anchors.entries()) {
    await page.evaluate((id) => {
      const link = document.createElement('a');
      link.href = '#' + id;
      link.id = 'incoming-reading-link';
      link.textContent = 'Incoming reading link';
      document.body.append(link);
    }, anchor);
    await page.locator('#incoming-reading-link').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('h1')).toHaveText(practiceViews[index].title);
    await expect(page.locator('h1')).toBeFocused();
    await page.locator('#incoming-reading-link').evaluate((element) => element.remove());
  }
  await page.goBack();
  await expect(page.locator('h1')).toHaveText(practiceViews[2].title);
  await page.goForward();
  await expect(page.locator('h1')).toHaveText(practiceViews[3].title);
});

for (const mode of ['disabled', 'failed'] as const) {
  test(`complete native reading and four anchors with scripts ${mode}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode === 'failed') await context.route('**/*.js', (route) => route.abort());
    const page = await context.newPage();
    try {
      await page.goto(baseURL! + '/');
      const reading = page.locator('.period-reading');
      for (const text of [...newText, practiceCopy.lessonBridge, practiceCopy.purposeBridge])
        await expect(reading.getByText(text, { exact: true })).toHaveCount(1);
      await expect(reading).not.toContainText('What I had to own');
      await expect(reading.locator('input, textarea, button, select')).toHaveCount(0);
      await page.getByRole('link', { name: 'Practice Ownership', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#' + anchors[0])).toBeFocused();
      for (const anchor of anchors) {
        await page.goto(baseURL! + '/#' + anchor);
        await expect(page.locator('#' + anchor)).toBeInViewport();
        await page.reload();
        await expect(page.locator('#' + anchor)).toBeInViewport();
        // Native heading IDs must support incoming keyboard links independently of app scripts.
        await page.evaluate((id) => {
          const link = document.createElement('a');
          link.href = '#' + id;
          link.id = 'incoming-reading-link';
          link.textContent = 'Incoming reading link';
          document.body.prepend(link);
        }, anchor);
        await page.locator('#incoming-reading-link').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#' + anchor)).toBeFocused();
        await page.locator('#incoming-reading-link').evaluate((element) => element.remove());
      }
      await page.goBack();
      await expect(page).toHaveURL(new RegExp('#' + anchors[2] + '$'));
      await expect(page.locator('#' + anchors[2])).toBeInViewport();
      await page.goForward();
      await expect(page).toHaveURL(new RegExp('#' + anchors[3] + '$'));
      await expect(page.locator('#' + anchors[3])).toBeInViewport();
      // Axe injects scripts into a frame and cannot run with browser JavaScript
      // disabled. That mode retains the explicit semantic and keyboard checks.
      // Failed app scripts still allow the independent injected accessibility audit.
      if (mode === 'failed')
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test('foundation and practice reflow at 1440, 390 and 320, with 200 percent text', async ({
  browser,
  baseURL,
}, info) => {
  test.setTimeout(120000);
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();
  const routes = [
    ['ownership', '/period/values/ownership'],
    ...practiceViews.map((v) => [v.id, v.path]),
    ['purpose', '/period/values/purpose'],
  ];
  const metrics = [];
  try {
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
      for (const [name, path] of routes) {
        await page.goto(baseURL! + '/#' + path);
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('h1')).toHaveCount(1);
        expect(await fits(page)).toBe(true);
        metrics.push({
          name,
          width,
          scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
        });
        if (info.project.name === 'chromium')
          await page.screenshot({
            path: info.outputPath(`work37-${name}-${width}.png`),
            fullPage: true,
          });
      }
    }
    for (const [name, path] of routes.slice(0, -1)) {
      await page.goto(baseURL! + '/#' + path);
      await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
      expect(await fits(page)).toBe(true);
      if (info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`work37-${name}-text200-320.png`),
          fullPage: true,
        });
    }
    await writeFile(
      info.outputPath('work37-responsive-metrics.json'),
      JSON.stringify(metrics, null, 2),
    );
  } finally {
    await context.close();
  }
});

test('A4 and Letter preserve complete lesson and all practice branches with legal/source notices', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.skip(
    info.project.name !== 'chromium',
    'PDF export uses desktop Chromium; other projects verify reading and reflow.',
  );
  test.setTimeout(120000);
  const textEvidence: Record<string, string> = {};
  async function capture(name: string, target: Page) {
    await target.evaluate(() => document.fonts.ready);
    await target.emulateMedia({ media: 'print' });
    await expect(target.locator('.founder-copyright')).toBeVisible();
    await expect(target.locator('.footer-print-urls')).toBeVisible();
    const text = await target.locator('body').innerText();
    if (name === 'ownership' || name === 'root-reading')
      for (const line of newText) expect(text.replace(/\s+/g, ' ')).toContain(line);
    for (const format of ['A4', 'Letter'] as const) {
      const file = `work37-${name}-${format}.pdf`;
      await target.pdf({
        path: info.outputPath(file),
        format,
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' },
      });
      textEvidence[file] = text;
    }
    await target.emulateMedia({ media: 'screen' });
  }
  await page.goto('/#/period/values/ownership');
  await capture('ownership', page);
  for (const view of practiceViews) {
    await page.goto('/#' + view.path);
    await capture(view.id, page);
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const reading = await context.newPage();
    await reading.goto(baseURL! + '/');
    await capture('root-reading', reading);
  } finally {
    await context.close();
  }
  await writeFile(
    info.outputPath('work37-print-expected.json'),
    JSON.stringify(textEvidence, null, 2),
  );
});

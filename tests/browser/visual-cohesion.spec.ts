import { test, expect, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { periodValues } from '../../src/period-content';
import { purposeLesson } from '../../src/period-purpose-content';
import { resilienceContent } from '../../src/period-resilience-content';
import { integrityContent } from '../../src/period-integrity-content';
import { disciplineContent } from '../../src/period-discipline-content';
import { empowermentContent } from '../../src/period-empowerment-content';
import { founderCopyright } from '../../src/site-footer-content';

const values = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
const ownership = periodValues[0].lesson;
const paragraphs: Record<string, readonly string[]> = {
  ownership: [
    ownership.meaning,
    ownership.example,
    ownership.misconception,
    ownership.application,
    ownership.reflection,
    ownership.connection,
  ],
  purpose: purposeLesson.flatMap((s) => s.paragraphs),
  resilience: resilienceContent.lesson.flatMap((s) => s.paragraphs),
  integrity: integrityContent.lesson.flatMap((s) => s.paragraphs),
  discipline: [
    ...disciplineContent.lesson.intro,
    ...disciplineContent.lesson.sections.flatMap((s) => s.paragraphs),
  ],
  empowerment: [
    ...empowermentContent.lesson.intro,
    ...empowermentContent.lesson.sections.flatMap((s) => s.paragraphs),
  ],
};
const treatments: Record<string, string[]> = {
  ownership: ['.ownership-example', '.guardrail', '.transition'],
  purpose: ['.purpose-contrast', '.purpose-connections', '.purpose-pressure'],
  resilience: ['.resilience-standard', '.resilience-support'],
  integrity: ['.integrity-evidence', '.integrity-correction'],
  discipline: [
    '.discipline-repetition',
    '.discipline-resistance',
    '.discipline-limits',
    '.discipline-correction',
  ],
  empowerment: ['[data-lesson-section="room-for-a-reply"]', '.necessary-care'],
};
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
async function notices(page: Page) {
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  const line = page.locator('.founder-copyright');
  await expect(line).toHaveText(founderCopyright);
  await expect(line.getByRole('link')).toHaveText(['Jim Lunsford', 'Phoenix 2:33 LLC']);
  await expect(line.getByRole('link', { name: 'Jim Lunsford', exact: true })).toHaveAttribute(
    'href',
    'https://jimlunsford.com/',
  );
  await expect(line.getByRole('link', { name: 'Phoenix 2:33 LLC', exact: true })).toHaveAttribute(
    'href',
    'https://phoenix233.com/',
  );
  await expect(page.locator('.footer-software')).toContainText('No warranty.');
  await expect(page.locator('.footer-software')).toContainText(
    'does not limit these software permissions',
  );
  await expect(page.locator('.footer-software a')).toHaveAttribute('href', '/LICENSE.txt');
}
test('six lessons retain their full paragraphs, common geometry and distinct treatments at 1440, 390 and 320', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const geometry = [];
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [index, value] of values.entries()) {
      await page.goto('/#/period/values/' + value);
      await page.evaluate(() => document.fonts.ready);
      const shell = page.locator('.value-lesson');
      await expect(shell).toBeVisible();
      const expected = paragraphs[value];
      const text = await shell.locator('.lesson-copy').textContent();
      let last = -1;
      for (const paragraph of expected) {
        const at = text!.indexOf(paragraph, last + 1);
        expect(at, value + ': ' + paragraph).toBeGreaterThan(last);
        last = at;
      }
      await expect(shell.locator('.position')).toHaveText(
        `${index + 1} of 6 in the teaching order`,
      );
      await expect(shell.locator('.path a[aria-current="page"] .path-name')).toHaveText(
        value[0].toUpperCase() + value.slice(1),
      );
      const order = await shell.evaluate((el) => Array.from(el.children).map((c) => c.className));
      expect(order[0]).toContain('lesson-heading');
      expect(order[1]).toContain('period-sequence');
      expect(order.at(-1)).toContain('lesson-copy');
      const heading = (await shell.locator('.lesson-heading').boundingBox())!;
      const rail = (await shell.locator('.period-sequence').boundingBox())!;
      const article = (await shell.locator('.lesson-copy').boundingBox())!;
      expect(await fits(page)).toBe(true);
      if (width === 1440) {
        expect(rail.x).toBeCloseTo(120, 0);
        expect(rail.width).toBeCloseTo(280, 0);
        expect(heading.x).toBeCloseTo(480, 0);
        expect(article.x).toBeCloseTo(heading.x, 0);
        expect(heading.y).toBeCloseTo(rail.y, 0);
      } else {
        expect(rail.y).toBeGreaterThanOrEqual(heading.y + heading.height);
        expect(article.y).toBeGreaterThan(rail.y + rail.height);
        const links = await shell
          .locator('.path li')
          .evaluateAll((els) =>
            els.map((el) => ({ x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y })),
          );
        if (width === 390) expect(links[0].y).toBe(links[1].y);
        else expect(links[1].y).toBeGreaterThan(links[0].y);
      }
      await notices(page);
      geometry.push({ value, width, heading, rail, article, paragraphs: expected.length });
      if (info.project.name === 'chromium') {
        await page.screenshot({ path: info.outputPath(`${value}-${width}.png`), fullPage: true });
        await page.screenshot({ path: info.outputPath(`${value}-${width}-opening.png`) });
        for (const [n, selector] of treatments[value].entries())
          await shell
            .locator(selector)
            .screenshot({ path: info.outputPath(`${value}-${width}-treatment-${n + 1}.png`) });
        await page
          .getByRole('contentinfo')
          .screenshot({ path: info.outputPath(`${value}-${width}-footer.png`) });
      }
    }
  }
  await writeFile(
    info.outputPath('work26-lesson-geometry.json'),
    JSON.stringify(geometry, null, 2),
  );
});
test('new lesson composition supports tablet, keyboard, text enlargement, spacing and forced colors', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  for (const value of values) {
    await page.setViewportSize({ width: 800, height: 1000 });
    await page.goto('/#/period/values/' + value);
    const shell = page.locator('.value-lesson');
    expect((await shell.locator('.period-sequence').boundingBox())!.width).toBeCloseTo(220, 0);
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await fits(page), value + ' enlarged text').toBe(true);
    await page.addStyleTag({
      content:
        '.value-lesson * {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important} .value-lesson p{margin-bottom:2em!important}',
    });
    expect(await fits(page), value + ' text spacing').toBe(true);
    await page.reload();
    await page.emulateMedia({ forcedColors: 'active' });
    const active = shell.locator('.path a[aria-current="page"]');
    await active.focus();
    await expect(active).toBeFocused();
    expect(await active.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(
      await active.evaluate((el) => parseFloat(getComputedStyle(el).borderLeftWidth)),
    ).toBeGreaterThanOrEqual(2);
    if (info.project.name === 'chromium')
      await page.screenshot({ path: info.outputPath(`${value}-forced-colors.png`) });
    await page.emulateMedia({ forcedColors: 'none' });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
test('script-free readings and failed application mount retain one complete footer', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const path of ['/', ...values.slice(2).map((v) => '/read/' + v + '.html')]) {
    await page.goto(baseURL + path);
    await notices(page);
    const build = await (await context.request.get(baseURL + '/build.json')).json();
    if (!build.dirty)
      await expect(page.locator('.footer-meta a')).toHaveAttribute('href', build.source);
    await expect(page.locator('.footer-app-note')).toContainText('require JavaScript');
  }
  await context.close();
  const failed = await browser.newContext();
  await failed.route('**/*.js', (route) => route.abort());
  const fallback = await failed.newPage();
  await fallback.goto(baseURL!);
  await expect(fallback.locator('#educational-fallback')).toBeVisible();
  await notices(fallback);
  await failed.close();
});

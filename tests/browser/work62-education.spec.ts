import { expectReadingNavigation } from './helpers/reading-navigation';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import approved from '../fixtures/work62-approved.json' with { type: 'json' };

const { rebuild, period } = approved;
const examples = [
  {
    lesson: 'structure',
    headings: [rebuild.structure[0], rebuild.structure[2]],
    title: 'Find the next real study period',
    person: 'Nia',
    alternatives: 4,
  },
  {
    lesson: 'return',
    headings: [rebuild.return[0]],
    title: 'Follow a correction to the people affected',
    person: 'Sima',
    alternatives: 3,
  },
  {
    lesson: 'trust',
    headings: [rebuild.trust[0], rebuild.trust[2]],
    title: 'Read the record in both directions',
    person: 'Inez',
    alternatives: 3,
  },
];

test.describe('JavaScript-independent teaching', () => {
  test.use({ javaScriptEnabled: false });
  for (const lesson of ['structure', 'return', 'trust']) {
    test(`Rebuild ${lesson} fragment survives cold fonts and repeated native reloads`, async ({
      page,
    }) => {
      // Routing disables the HTTP cache, exposing late font delivery on every reload.
      await page.route('**/fonts/*.woff2', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        await route.continue();
      });
      await page.goto(`/read/rebuild.html#/rebuild/complete?section=${lesson}-example`);
      const heading = page.locator(`#${lesson}-example`);
      for (let refresh = 0; refresh < 3; refresh++) {
        await expect(heading).toBeInViewport();
        await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
        await expect(heading).toBeInViewport();
        await page.reload();
      }
      await expect(heading).toBeInViewport();
      await expectReadingNavigation(page);
      await expect(page.locator('script:not([src="/read/navigation.js"])')).toHaveCount(0);
    });
  }
  for (const path of ['/', '/read/rebuild.html']) {
    for (const { lesson, headings, title, person, alternatives } of examples) {
      test(`${path} ${lesson} links reach the actual example and leave teaching and alternatives as siblings`, async ({
        page,
        baseURL,
      }) => {
        const direct = '#/rebuild/' + lesson + '?section=example';
        const complete = '#/rebuild/complete?section=' + lesson + '-example';
        const fonts = new Set<string>();
        page.on('request', (request) => {
          if (request.resourceType() === 'font') fonts.add(request.url());
        });
        await page.goto(path + direct);
        const article = page.locator('article#' + lesson);
        const wrapper = article.locator(':scope > [id="' + complete.slice(1) + '"]');
        const heading = wrapper.locator(':scope > h3:only-child');
        await expect(article.locator(':scope > .prose > h3')).toHaveText(headings);
        await expect(heading).toHaveAttribute('id', lesson + '-example');
        await expect(heading).toHaveText(title);
        await expect(heading.locator(':scope > span:target')).toHaveText(title);
        await expect(heading).toBeInViewport();
        await expect(wrapper.locator('xpath=following-sibling::*[1]')).toHaveText(
          new RegExp('^' + person),
        );
        await expect(article.locator(':scope > .flatstate')).toHaveCount(alternatives);
        await page.goto(path + complete);
        await expect(wrapper).toHaveId(complete.slice(1));
        await expect(page.locator(':target')).toHaveText(title);
        await expect(heading).toBeInViewport();
        for (let refresh = 0; refresh < 3; refresh++) {
          await page.reload();
          await expect(page).toHaveURL(new URL(path + complete, page.url()).href);
          await expect(heading).toBeInViewport();
          await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
          await expect(heading).toBeInViewport();
        }
        const backToCase = article.getByRole('link', { name: 'Return to the example' });
        await expect(backToCase).toHaveAttribute('href', '#' + lesson + '-example');
        await backToCase.press('Enter');
        await expect(page.locator('h3:target')).toHaveText(title);
        await expect(heading).toBeInViewport();
        await page.goBack();
        await expect(page.locator(':target')).toHaveAttribute('id', complete.slice(1));
        await page.goForward();
        await expect(page.locator('h3:target')).toHaveText(title);
        if (path === '/read/rebuild.html') {
          await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
          const origin = new URL(baseURL!).origin;
          const allowedFonts = [
            'SourceSerif4-Regular.otf.woff2',
            'SourceSerif4-Semibold.otf.woff2',
            'SourceSerif4-It.otf.woff2',
            'SourceSans3-Regular.otf.woff2',
            'SourceSans3-Semibold.otf.woff2',
            'SourceSans3-Bold.otf.woff2',
          ].map((file) => new URL('/fonts/' + file, baseURL!).href);
          for (const font of fonts) {
            expect(new URL(font).origin, 'Font requests must stay on the test site').toBe(origin);
            expect(allowedFonts, `Unexpected font request: ${font}`).toContain(font);
          }
          expect([...fonts]).toEqual(
            expect.arrayContaining([
              new URL('/fonts/SourceSerif4-Regular.otf.woff2', baseURL!).href,
              new URL('/fonts/SourceSans3-Regular.otf.woff2', baseURL!).href,
            ]),
          );
        }
      });
    }
    test(`${path} restores each Line note and both paper links`, async ({ page }) => {
      for (const [i, label] of [
        'The wish',
        'The line',
        'When a fact is missing',
        'The return',
      ].entries()) {
        await page.goto(path + '#/rebuild/line?section=note-' + (i + 1));
        const target = page.locator(':target');
        await expect(target).toHaveClass('flatstate');
        await expect(target).toContainText(label);
        await expect(target).toBeInViewport();
      }
      for (const entry of ['end', 'complete']) {
        await page.goto(path + '#/rebuild/' + entry + '?section=paper');
        await expect(page.locator(':target')).toHaveText('Take one question with you');
        await expect(page.locator(':target')).toBeInViewport();
        await expect(page.locator('#paper dd')).toHaveCount(4);
        await expect(page.locator('#paper dd').last()).toHaveText(rebuild.fourthQuestion);
      }
    });
  }
});

test('the four authorized PERIOD decisions reach their specific interactive states and static readings', async ({
  page,
}) => {
  await page.goto('/#/period/practice/responses');
  await page.getByText('Promise a late finish', { exact: true }).click();
  await expect(page.getByText(period.O15, { exact: true })).toBeVisible();
  await page.goto('/#/period/values/resilience');
  await expect(page.locator('#resilience-L07 p').first()).toHaveText(period.R08);
  await page.goto('/#/period/discipline/pattern');
  const miss = page.locator('[data-occasion="miss"]');
  await expect(miss.locator('.discipline-interpretation')).toHaveText(period.D22);
  await page.locator('input[value="rigid-effort"]').check();
  await expect(miss.locator('.discipline-interpretation')).toHaveText(period.D23);
  await page.emulateMedia({ media: 'print' });
  await expect(miss.getByText(period.D21, { exact: true })).toBeVisible();
  await expect(miss.locator('.discipline-interpretation')).toBeHidden();
  await page.emulateMedia({ media: 'screen' });
  await page.goto('/#/period/empowerment/conversation');
  await page.getByRole('radio', { name: 'Decline this offer' }).check();
  await expect(
    page.locator('.empowerment-screen').getByText(period.E24, { exact: true }),
  ).toBeVisible();
  for (const [value, word] of [
    ['ownership', period.O15],
    ['resilience', period.R08],
    ['discipline', period.D21],
    ['empowerment', period.E24],
  ]) {
    await page.goto('/read/' + value + '.html');
    await expect(page.getByText(word, { exact: true })).toHaveCount(1);
    await expect(page.getByText(word, { exact: true })).toBeVisible();
  }
});

for (const width of [320, 390, 1366]) {
  test(`new Rebuild teaching reflows and preserves heading and keyboard access at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const { lesson, headings, title } of examples) {
      await page.goto('/#/rebuild/' + lesson);
      await expect(page.locator('.setup h2')).toHaveText(headings);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.getByRole('link', { name: 'Examine the example' }).press('Enter');
      const target = page.locator('.case#example');
      await expect(target).toBeFocused();
      await expect(target.getByRole('heading', { name: title })).toBeInViewport();
    }
    await page.goto('/#/rebuild/trust');
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

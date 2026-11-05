import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import {
  disciplineContent as content,
  disciplineWayfinding,
} from '../../src/period-discipline-content';
import { disciplineAnchor, disciplineLessonAnchor } from '../../src/period-discipline-navigation';

const lessonPath = '/#/period/values/discipline';
const patternPath = '/#/period/discipline/pattern';
const copy = content.interaction;
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const radio = (page: Page, index: number) =>
  page.getByRole('radio', { name: copy.choices[index].label, exact: true });
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function checkLesson(page: Page) {
  for (const text of [
    content.lesson.deck,
    ...content.lesson.intro,
    ...content.lesson.sections.flatMap((s) => [s.title, ...s.paragraphs]),
    content.lesson.cardDescription,
    content.lesson.nextDescription,
    content.lesson.bookDescription,
  ]) {
    await expect(page.getByRole('main').getByText(text, { exact: true })).toBeVisible();
  }
}
async function checkPattern(page: Page, selected: 'strong-start' | 'rigid-effort') {
  await expect(page.locator('.discipline-occasion')).toHaveCount(7);
  for (const m of copy.moments) {
    const occasion = page.locator(`[data-occasion="${m.id}"]`);
    await expect(occasion.locator('h2')).toHaveText(m.title);
    await expect(occasion.locator('.discipline-context')).toHaveText(m.context);
    await expect(occasion.locator('[data-pattern="reference"]')).toContainText(m.reference);
    await expect(occasion.locator(`[data-pattern="${selected}"] h3`)).toHaveText(
      copy.choices.find((c) => c.id === selected)!.label,
    );
    await expect(occasion.locator(`[data-pattern="${selected}"] p`)).toHaveText(m[selected]);
    await expect(occasion.locator('.discipline-interpretation')).toHaveText(
      m.interpretations[selected],
    );
    await expect(occasion.locator('.discipline-correction')).toHaveText(m.correction);
    await expect(
      occasion.locator(
        `[data-pattern="${selected === 'strong-start' ? 'rigid-effort' : 'strong-start'}"]`,
      ),
    ).not.toBeVisible();
  }
}

test('the complete approved lesson stands alone and the header offers six full lessons', async ({
  page,
}) => {
  await page.goto(lessonPath);
  await expect(page.locator('h1')).toHaveText('Discipline');
  await checkLesson(page);
  await expect(page.locator('.discipline-lesson > section h2')).toHaveCount(11);
  await expect(page.locator('main input, main textarea, main select')).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link'),
  ).toHaveText(['Why PERIOD?', 'Explore the values', 'Optional Standard Card']);
  await expect(
    page
      .getByRole('navigation', { name: 'PERIOD teaching order' })
      .getByRole('link', { name: 'Discipline', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: content.lesson.nextLink, exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Empowerment.');
  await expect(page.getByRole('main')).toContainText('All six values have full lessons.');
  await expect(page.getByRole('main')).not.toContainText(
    'full Empowerment lesson is not yet available',
  );
  await axe(page);
});

test('both selections retain all seven shared occasions and exact pair-specific interpretations', async ({
  page,
}) => {
  await page.goto(patternPath);
  await expect(radio(page, 0)).toBeChecked();
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(page.getByRole('group', { name: copy.choiceLegend })).toBeVisible();
  await checkPattern(page, 'strong-start');
  await axe(page);
  await radio(page, 1).check();
  await checkPattern(page, 'rigid-effort');
  await axe(page);
  await page.reload();
  await expect(radio(page, 0)).toBeChecked();
  await expect(page.getByRole('status')).toBeEmpty();
});

test('native keyboard radios retain focus and scroll and announce only one concise change', async ({
  page,
}, info) => {
  await page.goto(patternPath);
  await radio(page, 0).focus();
  await radio(page, 0).scrollIntoViewIfNeeded();
  const y = await page.evaluate(() => scrollY);
  await page.evaluate(() => {
    (window as any).__announcements = [];
    new MutationObserver(() =>
      (window as any).__announcements.push(document.querySelector('[role="status"]')!.textContent),
    ).observe(document.querySelector('[role="status"]')!, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  await radio(page, 0).press('ArrowRight');
  await expect(radio(page, 1)).toBeFocused();
  await expect(radio(page, 1)).toBeChecked();
  await expect(page.getByRole('status')).toHaveText(copy.choices[1].status);
  expect(Math.abs((await page.evaluate(() => scrollY)) - y)).toBeLessThan(3);
  expect(await page.evaluate(() => (window as any).__announcements)).toEqual([
    copy.choices[1].status,
  ]);
  await radio(page, 1).press('Space');
  expect(await page.evaluate(() => (window as any).__announcements)).toHaveLength(1);
  await radio(page, 1).press('ArrowLeft');
  await expect(radio(page, 0)).toBeFocused();
  await expect(page.getByRole('status')).toHaveText(copy.choices[0].status);
  await expect(page.locator('.discipline-comparison[aria-live]')).toHaveCount(0);
  await writeFile(
    info.outputPath('discipline-accessibility-tree.txt'),
    await page.locator('.discipline-controls').ariaSnapshot(),
  );
});

test('ordinary native wayfinding focuses stable headings without changing the comparison, including reload and Back', async ({
  page,
}) => {
  await page.goto(lessonPath);
  await page.getByRole('link', { name: content.lesson.interactionLink, exact: true }).click();
  await radio(page, 1).check();
  for (const item of disciplineWayfinding) {
    await page
      .getByRole('navigation', { name: 'Within the comparison' })
      .getByRole('link', { name: item.label, exact: true })
      .click();
    const heading = page.locator(`[id="${disciplineAnchor(item.id)}"]`);
    await expect(heading).toBeFocused();
    expect((await heading.boundingBox())!.y).toBeGreaterThanOrEqual(0);
    expect((await heading.boundingBox())!.y).toBeLessThan(50);
    await expect(radio(page, 1)).toBeChecked();
    await expect(page.locator('.discipline-occasion')).toHaveCount(7);
  }
  await page.reload();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await expect(radio(page, 0)).toBeChecked();
  await expect(page.locator(`[id="${disciplineAnchor('changed-capacity')}"]`)).toBeFocused();
  await page.getByRole('link', { name: copy.backLink, exact: true }).click();
  await expect(page.locator(`[id="${disciplineLessonAnchor}"]`)).toBeFocused();
  await page.goBack();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await page.goto('/#/period/discipline/pattern/unknown');
  await expect(page.locator('h1')).toHaveText('That page is not here.');
});

test('six-value navigation preserves Integrity teaching and both onward destinations', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Start with Ownership' })).toHaveClass(/primary/);
  await expect(
    page
      .getByRole('navigation', { name: 'PERIOD teaching order' })
      .getByRole('link', { name: 'Discipline', exact: true }),
  ).toHaveAttribute('href', '#/period/values/discipline');
  for (const from of ['/#/period/values/integrity', '/#/period/integrity/record']) {
    await page.goto(from);
    await page.getByRole('link', { name: 'Continue to Discipline', exact: true }).click();
    await expect(page.locator('h1')).toHaveText('Discipline');
  }
  await page.goto('/read/integrity.html');
  await page.getByRole('link', { name: 'Continue to Discipline', exact: true }).first().click();
  await expect(page).toHaveURL(/\/read\/discipline.html$/);
});

test('direct reading and blocked application scripts retain every occasion and equivalent wayfinding', async ({
  browser,
}, info) => {
  for (const mode of ['disabled', 'blocked']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    const page = await context.newPage();
    if (mode === 'blocked') await page.route('**/assets/*.js', (r) => r.abort());
    await page.goto('/');
    await page
      .getByRole('link', {
        name: 'Read the complete Discipline lesson and comparison',
        exact: true,
      })
      .click();
    await checkLesson(page);
    await expect(page.locator('script,input,button')).toHaveCount(0);
    for (const m of copy.moments) {
      const section = page.locator(`[data-occasion="${m.id}"]`);
      for (const text of [
        m.context,
        m.reference,
        m['strong-start'],
        m['rigid-effort'],
        m.interpretation,
        m.correction,
      ])
        await expect(section.getByText(text, { exact: true }).first()).toBeVisible();
    }
    for (const item of disciplineWayfinding) {
      await page
        .getByRole('navigation', { name: 'Within the comparison' })
        .getByRole('link', { name: item.label, exact: true })
        .click();
      await expect(page.locator(`#occasion-${item.id}`)).toBeFocused();
    }
    await page.goto('/read/discipline.html');
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await fits(page)).toBe(true);
      if (mode === 'disabled' && info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`discipline-reading-${width}.png`),
          fullPage: true,
        });
    }
    await context.close();
  }
});

test('desktop, mobile and narrow compositions pair actions within each occasion and retain every word', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(lessonPath);
    await page.evaluate(() => document.fonts.ready);
    expect(await fits(page)).toBe(true);
    await checkLesson(page);
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`discipline-lesson-${width}.png`),
        fullPage: true,
      });
    await page.goto(patternPath);
    for (const [index, option] of copy.choices.entries()) {
      await radio(page, index).check();
      await checkPattern(page, option.id);
      expect(await fits(page)).toBe(true);
      const section = page.locator('[data-occasion="repeated-action"]');
      const reference = await section.locator('[data-pattern="reference"]').boundingBox();
      const alternative = await section.locator(`[data-pattern="${option.id}"]`).boundingBox();
      if (width < 700) expect(alternative!.y).toBeGreaterThan(reference!.y + reference!.height);
      else expect(Math.abs(alternative!.y - reference!.y)).toBeLessThan(1);
      if (info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`discipline-${option.id}-${width}.png`),
          fullPage: true,
        });
    }
    await axe(page);
  }
});

test('200 percent text, spacing, font failure, 320px reflow, reduced motion and forced colors preserve content and focus', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.route('**/fonts/**', (r) => r.abort());
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  for (const path of [lessonPath, patternPath, '/read/discipline.html']) {
    await page.goto(path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
      document.querySelectorAll<HTMLElement>('.period-shell *').forEach((el) => {
        el.style.setProperty('line-height', '1.5', 'important');
        el.style.setProperty('letter-spacing', '.12em', 'important');
        el.style.setProperty('word-spacing', '.16em', 'important');
        if (el.tagName === 'P') el.style.setProperty('margin-bottom', '2em', 'important');
      });
    });
    expect(await fits(page)).toBe(true);
    if (path === patternPath) {
      await radio(page, 0).press('ArrowRight');
      await expect(radio(page, 1)).toBeFocused();
      expect(await radio(page, 1).evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe(
        'none',
      );
    }
  }
});

test('printing either selection includes all three patterns and full interpretations in A4 and Letter', async ({
  page,
  browserName,
}, info) => {
  for (const [index, option] of copy.choices.entries()) {
    await page.goto(patternPath);
    await radio(page, index).check();
    await page.emulateMedia({ media: 'print' });
    await expect(
      page.getByRole('heading', { name: 'All three fictional patterns', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.discipline-controls')).not.toBeVisible();
    for (const m of copy.moments) {
      const section = page.locator(`[data-occasion="${m.id}"]`);
      for (const pattern of ['reference', 'strong-start', 'rigid-effort'])
        await expect(section.locator(`[data-pattern="${pattern}"]`)).toBeVisible();
      await expect(section.getByText(m.interpretation, { exact: true }).last()).toBeVisible();
      await expect(section.locator('.discipline-interpretation')).not.toBeVisible();
    }
    if (browserName === 'chromium' && info.project.name === 'chromium')
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath(`discipline-${option.id}-${format}.pdf`),
          format,
          margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
        });
    await page.emulateMedia({ media: 'screen' });
  }
  for (const path of [lessonPath, '/read/discipline.html']) {
    await page.goto(path);
    await page.emulateMedia({ media: 'print' });
    await checkLesson(page);
    if (browserName === 'chromium' && info.project.name === 'chromium')
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath(
            `discipline-${path === lessonPath ? 'lesson' : 'reading'}-${format}.pdf`,
          ),
          format,
          margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
        });
  }
});

test('Discipline can preselect only a blank card, with existing text, print, copy and the first field preserved', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(lessonPath);
  await page.getByRole('link', { name: content.lesson.cardLink, exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('discipline');
  const first = await page.locator('#period-valueId').boundingBox();
  expect(first!.y + first!.height).toBeLessThan(900);
  await page.locator('#period-standard').fill('SYNTHETIC: I give accurate updates.');
  await page.locator('#period-nextApplication').fill('SYNTHETIC: Correct the handover.');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Explore the values' })
    .click();
  await page
    .getByRole('navigation', { name: 'PERIOD teaching order' })
    .getByRole('link', { name: 'Discipline', exact: true })
    .click();
  await page.getByRole('link', { name: content.lesson.cardLink, exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('SYNTHETIC: I give accurate updates.');
  await page.locator('#period-valueId').selectOption('purpose');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Explore the values' })
    .click();
  await page
    .getByRole('navigation', { name: 'PERIOD teaching order' })
    .getByRole('link', { name: 'Discipline', exact: true })
    .click();
  await page.getByRole('link', { name: content.lesson.cardLink, exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('purpose');
});

test('comparison selection does not write storage, cookies, network payloads or history data', async ({
  page,
}) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), body: r.postData() }),
  );
  await page.goto(patternPath);
  await radio(page, 1).check();
  await radio(page, 0).check();
  await page.getByRole('link', { name: 'Changed capacity', exact: true }).click();
  const state = await page.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
    cookies: document.cookie,
    history: history.state,
  }));
  expect(state.local).toEqual([]);
  expect(state.session).toEqual([]);
  expect(state.cookies).toBe('');
  expect(JSON.stringify(state.history)).not.toMatch(/strong-start|rigid-effort|changed-capacity/);
  const origin = new URL(page.url()).origin;
  expect(
    requests.every(
      (r) => new URL(r.url).origin === origin && r.method === 'GET' && r.body === null,
    ),
  ).toBe(true);
  await page.reload();
  await expect(radio(page, 0)).toBeChecked();
});

test('Discipline text, control boundaries and focus retain measured contrast', async ({
  page,
}, info) => {
  const measurements: {
    state: string;
    selector: string;
    kind: string;
    foreground: string;
    background: string;
    ratio: number;
  }[] = [];
  async function measure(state: string, selector: string, kind = 'text') {
    const element = page.locator(selector).first();
    if (kind === 'focus') {
      await page.keyboard.press('Tab');
      await element.focus();
    }
    const result = await element.evaluate((node, requestedKind) => {
      const css = getComputedStyle(node);
      const foreground =
        requestedKind === 'focus'
          ? css.outlineColor
          : requestedKind === 'boundary'
            ? css.borderTopColor
            : css.color;
      let ancestor: Element | null = requestedKind === 'text' ? node : node.parentElement;
      let background = 'rgb(255, 255, 255)';
      while (ancestor) {
        const color = getComputedStyle(ancestor).backgroundColor;
        if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          background = color;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      const luminance = (color: string) => {
        const channels = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      const a = luminance(foreground),
        b = luminance(background);
      return {
        foreground,
        background,
        ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        outline: css.outlineStyle,
      };
    }, kind);
    if (kind === 'focus') expect(result.outline).not.toBe('none');
    expect(result.ratio, `${state} ${selector} ${kind}`).toBeGreaterThanOrEqual(
      kind === 'text' ? 4.5 : 3,
    );
    measurements.push({
      state,
      selector,
      kind,
      foreground: result.foreground,
      background: result.background,
      ratio: result.ratio,
    });
  }
  await page.goto(lessonPath);
  for (const selector of [
    'h1',
    '.discipline-heading .lead',
    '.discipline-lesson p',
    '.path-note',
    '.discipline-reading-link a',
  ])
    await measure('lesson', selector);
  await page.goto(patternPath);
  for (const [index, choice] of copy.choices.entries()) {
    await radio(page, index).check();
    for (const selector of [
      'h1',
      '.discipline-context',
      '.discipline-pattern p',
      '.discipline-controls label',
      '.discipline-interpretation',
      '.discipline-correction',
    ])
      await measure(choice.id, selector);
    await measure(choice.id, '.discipline-controls', 'boundary');
    await measure(choice.id, `input[value="${choice.id}"]`, 'focus');
  }
  await page.goto('/read/discipline.html');
  for (const selector of ['h1', '.discipline-lesson p', '.discipline-pattern p', '.source-note'])
    await measure('reading', selector);
  await writeFile(
    info.outputPath('discipline-contrast.json'),
    JSON.stringify(measurements, null, 2),
  );
});

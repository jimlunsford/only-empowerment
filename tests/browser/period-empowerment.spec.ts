import { homepage } from '../../src/period-homepage-content';
import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import {
  empowermentContent as content,
  empowermentAvailability,
  empowermentNavigation,
  type EmpowermentReply,
} from '../../src/period-empowerment-content';

const lessonPath = '/#/period/values/empowerment';
const conversationPath = '/#/period/empowerment/conversation';
const copy = content.conversation;
const screen = (page: Page) => page.locator('.empowerment-screen');
const radio = (page: Page, index: number) =>
  page.getByRole('radio', { name: copy.states[index].label, exact: true });
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function checkLesson(scope: Locator) {
  for (const text of [
    content.lesson.deck,
    ...content.lesson.intro,
    ...content.lesson.sections.flatMap((s) => [
      s.title,
      ...s.paragraphs,
      ...('connections' in s ? s.connections.flatMap((c) => [c.value, c.text]) : []),
      ...('after' in s ? s.after : []),
    ]),
    content.lesson.cardNote,
    content.lesson.bookNote,
  ]) {
    await expect(scope.getByText(text, { exact: true }).first()).toBeVisible();
  }
}
async function checkReply(scope: Locator, state: EmpowermentReply) {
  for (const text of [
    state.heading,
    state.recipient,
    state.helper,
    ...('confirmation' in state ? [state.confirmation] : []),
    ...state.agreement.flat(),
    state.actionTitle,
    state.action,
    state.interpretation,
    state.uncertainty,
  ])
    await expect(scope.getByText(text, { exact: true }).first()).toBeVisible();
}

test('seven complete sections, founder refinement, all six relationships and optional exits stand alone', async ({
  page,
}) => {
  await page.goto(lessonPath);
  await expect(page.locator('h1')).toHaveText(content.lesson.title);
  await checkLesson(screen(page));
  await expect(screen(page).locator('[data-lesson-section]')).toHaveCount(7);
  await expect(page.locator('main input,main textarea,main select')).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link'),
  ).toHaveText(['Why PERIOD?', 'Explore the values']);
  await expect(
    page
      .getByRole('navigation', { name: 'PERIOD teaching order' })
      .getByRole('link', { name: 'Empowerment', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(screen(page).locator('.path-note')).toHaveText(empowermentAvailability);
  await axe(page);
});

test('three independent replies preserve exact agreement, unfinished work and both visible cautionary examples', async ({
  page,
}) => {
  await page.goto(conversationPath);
  await expect(radio(page, 0)).toBeChecked();
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(page.getByRole('group', { name: copy.controlLegend })).toBeVisible();
  for (const [index, state] of copy.states.entries()) {
    await radio(page, index).check();
    await expect(screen(page).locator('.empowerment-reply')).toHaveCount(1);
    await checkReply(screen(page).locator('.empowerment-reply'), state);
    for (const text of [
      ...copy.setup,
      copy.request.text,
      copy.offer.text,
      copy.offerNote,
      ...copy.alternatives.flatMap((a) => [a.title, a.message, a.effect, a.correction]),
      ...copy.close,
      copy.transfer,
    ])
      await expect(screen(page).getByText(text, { exact: true })).toBeVisible();
    await axe(page);
  }
  await page.reload();
  await expect(radio(page, 0)).toBeChecked();
  await expect(page.getByRole('status')).toBeEmpty();
});

test('native keyboard selection retains focus, scroll and URL with one concise status mutation per change', async ({
  page,
}, info) => {
  await page.goto(conversationPath);
  await radio(page, 0).focus();
  await radio(page, 0).scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => ({
    y: scrollY,
    url: location.href,
    length: history.length,
  }));
  await page.evaluate(() => {
    (window as any).__announcements = [];
    new MutationObserver(() =>
      (window as any).__announcements.push(document.querySelector('[role="status"]')!.textContent),
    ).observe(document.querySelector('[role="status"]')!, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  });
  await radio(page, 0).press('ArrowRight');
  await expect(radio(page, 1)).toBeFocused();
  await expect(radio(page, 1)).toBeChecked();
  await expect(page.getByRole('status')).toHaveText(copy.states[1].status);
  expect(await page.evaluate(() => (window as any).__announcements)).toEqual([
    copy.states[1].status,
  ]);
  await radio(page, 1).press('Space');
  expect(await page.evaluate(() => (window as any).__announcements)).toHaveLength(1);
  await radio(page, 1).press('ArrowRight');
  await expect(radio(page, 2)).toBeFocused();
  await expect(radio(page, 2)).toBeChecked();
  await radio(page, 2).press('ArrowLeft');
  await expect(radio(page, 1)).toBeFocused();
  const after = await page.evaluate(() => ({
    y: scrollY,
    url: location.href,
    length: history.length,
  }));
  expect(Math.abs(after.y - before.y)).toBeLessThan(3);
  expect(after.url).toBe(before.url);
  expect(after.length).toBe(before.length);
  expect(await page.evaluate(() => (window as any).__announcements)).toEqual([
    copy.states[1].status,
    copy.states[2].status,
    copy.states[1].status,
  ]);
  await expect(screen(page).locator('.empowerment-reply[aria-live]')).toHaveCount(0);
  await writeFile(
    info.outputPath('empowerment-accessibility-tree.txt'),
    await screen(page).ariaSnapshot(),
  );
});

test('recipient confirmation precedes negotiated responsibilities and actions in every reading form', async ({
  page,
}) => {
  await page.goto(conversationPath);
  await radio(page, 1).check();
  const reply = screen(page).locator('[data-reply="negotiate"]');
  await expect(reply.locator('.empowerment-confirmation')).toHaveText(copy.states[1].confirmation);
  for (const scope of [reply]) {
    const text = await scope.innerText();
    expect(text.indexOf(copy.states[1].confirmation)).toBeLessThan(
      text.indexOf('What is actually agreed'),
    );
    expect(text.indexOf('What is actually agreed')).toBeLessThan(
      text.indexOf(copy.states[1].action),
    );
  }
  await page.goto('/read/empowerment.html');
  const text = await page.locator('[data-reply="negotiate"]').innerText();
  expect(text.indexOf(copy.states[1].confirmation)).toBeLessThan(
    text.indexOf('What is actually agreed'),
  );
});

test('complete reading is independently served with scripts disabled or blocked and all anchors usable', async ({
  browser,
  baseURL,
}, info) => {
  test.setTimeout(90000);
  for (const mode of ['disabled', 'blocked']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled', baseURL });
    const page = await context.newPage();
    if (mode === 'blocked') await page.route('**/*.js', (r) => r.abort());
    await page.goto(lessonPath);
    await page
      .getByRole('link', {
        name: 'Read the complete Empowerment lesson and all three replies without JavaScript',
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/\/read\/empowerment.html$/);
    await expect(page.locator('script,input,button,details,[hidden]')).toHaveCount(0);
    await checkLesson(page.locator('main'));
    for (const state of copy.states)
      await checkReply(page.locator(`[data-reply="${state.id}"]`), state);
    for (const label of [
      'Lesson',
      'Original offer',
      ...copy.states.map((s) => s.label),
      'Conclusion',
    ]) {
      const link = page
        .getByRole('navigation', { name: 'Within the complete reading' })
        .getByRole('link', { name: label, exact: true });
      const href = await link.getAttribute('href');
      await link.click();
      await expect(page.locator(`[id="${href!.slice(1)}"]`)).toBeInViewport();
    }
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await fits(page)).toBe(true);
      if (mode === 'disabled' && info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`empowerment-reading-${width}.png`),
          fullPage: true,
        });
    }
    await context.close();
  }
});

test('1440, 390 and 320 compositions retain exact copy, visible speakers and full labels', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(lessonPath);
    await page.evaluate(() => document.fonts.ready);
    await checkLesson(screen(page));
    expect(await fits(page)).toBe(true);
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`empowerment-lesson-${width}.png`),
        fullPage: true,
      });
    await page.goto(conversationPath);
    for (const [i, state] of copy.states.entries()) {
      await radio(page, i).check();
      await checkReply(screen(page).locator('.empowerment-reply'), state);
      expect(await fits(page)).toBe(true);
      const panels = screen(page).locator('.empowerment-response .empowerment-speaker');
      const first = await panels.nth(0).boundingBox(),
        second = await panels.nth(1).boundingBox();
      if (width < 700) expect(second!.y).toBeGreaterThan(first!.y + first!.height);
      else expect(Math.abs(second!.y - first!.y)).toBeLessThan(1);
      const label = await radio(page, i).locator('..').boundingBox();
      // Firefox can report a 48px CSS box as 47.999969px. Preserve the 48px requirement.
      expect(Math.round(label!.height * 1000) / 1000).toBeGreaterThanOrEqual(48);
      if (info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`empowerment-${state.id}-${width}.png`),
          fullPage: true,
        });
    }
  }
});

test('200 percent text with spacing, font failure, forced colors and reduced motion survives 320px reflow', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.route('**/fonts/**', (r) => r.abort());
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  for (const path of [lessonPath, conversationPath, '/read/empowerment.html']) {
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
    if (path === conversationPath) {
      await radio(page, 0).press('ArrowRight');
      await expect(radio(page, 1)).toBeFocused();
      expect(await radio(page, 1).evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe(
        'none',
      );
      await expect(radio(page, 1)).toBeInViewport();
      if (info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath('empowerment-forced-colors-200-percent.png'),
        });
    }
  }
});

test('A4 and Letter print every lesson paragraph and all three replies from either route and every selection', async ({
  page,
  browserName,
}, info) => {
  test.setTimeout(120000);
  const texts: string[] = [];
  for (const [index, state] of copy.states.entries()) {
    await page.goto(conversationPath);
    await radio(page, index).check();
    await page.emulateMedia({ media: 'print' });
    await expect(screen(page)).not.toBeVisible();
    const print = page.locator('.empowerment-print-reading');
    await checkLesson(print);
    for (const state of copy.states)
      await checkReply(print.locator(`[data-reply="${state.id}"]`), state);
    texts.push(await print.innerText());
    if (browserName === 'chromium' && info.project.name === 'chromium')
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath(`empowerment-${state.id}-${format}.pdf`),
          format,
          margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
        });
    await page.emulateMedia({ media: 'screen' });
  }
  expect(texts[1]).toBe(texts[0]);
  expect(texts[2]).toBe(texts[0]);
  for (const path of [lessonPath, '/read/empowerment.html']) {
    await page.goto(path);
    await page.emulateMedia({ media: 'print' });
    const print =
      path === lessonPath ? page.locator('.empowerment-print-reading') : page.locator('main');
    await checkLesson(print);
    for (const state of copy.states)
      await checkReply(print.locator(`[data-reply="${state.id}"]`), state);
    if (path === lessonPath) expect(await print.innerText()).toBe(texts[0]);
    if (browserName === 'chromium' && info.project.name === 'chromium')
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath(
            `empowerment-${path === lessonPath ? 'lesson' : 'reading'}-${format}.pdf`,
          ),
          format,
          margin: { top: '18mm', right: '18mm', bottom: '18mm', left: '18mm' },
        });
    await page.emulateMedia({ media: 'screen' });
  }
  await writeFile(
    info.outputPath('empowerment-print-parity.json'),
    JSON.stringify(
      { allSelectionsAndLessonEqual: true, characters: texts[0].length, formats: ['A4', 'Letter'] },
      null,
      2,
    ),
  );
});

test('six-lesson surfaces and revisit links reach real lessons, with normal Back and route focus', async ({
  page,
}) => {
  for (const value of ['Ownership', 'Purpose']) {
    await page.goto('/read/empowerment.html');
    await page.getByRole('link', { name: `Read ${value}`, exact: true }).click();
    await expect(page.locator('h1')).toContainText(value);
  }
  await page.goto('/');
  await expect(page.getByText(homepage.lead, { exact: true })).toBeVisible();
  await page.goto('/#/period/practice/connected-code');
  await expect(
    page.getByText(empowermentNavigation.connectedCodeAvailability, { exact: true }),
  ).toBeVisible();
  await page.goto('/#/period/values/discipline');
  await page.getByRole('link', { name: 'Continue to Empowerment', exact: true }).first().click();
  await expect(page.locator('h1')).toBeFocused();
  await screen(page)
    .getByRole('link', { name: content.lesson.practiceLink, exact: true })
    .first()
    .click();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await expect(page.locator('h1')).toBeFocused();
  await radio(page, 2).check();
  await page.goBack();
  await expect(page.locator('h1')).toHaveText(content.lesson.title);
  await screen(page).getByRole('link', { name: content.lesson.returnLink, exact: true }).click();
  await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
  await page.reload();
  await expect(page.locator('[id="/period/teaching-order"]')).toBeFocused();
  for (const fragment of ['/period/empowerment/conversation/unknown', 'constructor', 'toString']) {
    await page.goto('/#' + fragment);
    await expect(page.locator('h1')).toHaveText('That page is not here.');
  }
});

test('partially authored Standard Cards survive lesson, conversation, return and value selection', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(lessonPath);
  await screen(page).getByRole('link', { name: content.lesson.cardLink, exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#period-valueId')).toHaveValue('empowerment');
  const first = await page.locator('#period-valueId').boundingBox();
  expect(first!.y + first!.height).toBeLessThan(900);
  if (info.project.name === 'chromium')
    await page.screenshot({ path: info.outputPath('empowerment-standard-card-390.png') });
  await page.locator('#period-standard').fill('SYNTHETIC: Keep my exact words.\nSecond line.');
  await page.getByRole('link', { name: 'Read about Empowerment', exact: true }).click();
  await screen(page)
    .getByRole('link', { name: content.lesson.practiceLink, exact: true })
    .first()
    .click();
  await radio(page, 1).check();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue(
    'SYNTHETIC: Keep my exact words.\nSecond line.',
  );
  await expect(page.locator('#period-nextApplication')).toHaveValue('');
  await page.locator('#period-valueId').selectOption('integrity');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Explore the values' })
    .click();
  await page
    .getByRole('navigation', { name: 'PERIOD teaching order' })
    .getByRole('link', { name: 'Empowerment', exact: true })
    .click();
  await screen(page).getByRole('link', { name: content.lesson.cardLink, exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await expect(page.locator('#period-standard')).toHaveValue(
    'SYNTHETIC: Keep my exact words.\nSecond line.',
  );
});

test('reply selection creates no persistence, telemetry, cookies or hidden story history', async ({
  page,
}) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), body: r.postData() }),
  );
  await page.goto(conversationPath);
  const before = await page.evaluate(() => ({
    history: history.state,
    length: history.length,
    url: location.href,
  }));
  for (const index of [1, 2, 0, 2, 1]) await radio(page, index).check();
  expect(
    await page.evaluate(() => ({
      history: history.state,
      length: history.length,
      url: location.href,
    })),
  ).toEqual(before);
  expect(
    await page.evaluate(() => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      cookies: document.cookie,
    })),
  ).toEqual({ local: [], session: [], cookies: '' });
  const origin = new URL(page.url()).origin;
  expect(
    requests.every(
      (r) => new URL(r.url).origin === origin && r.method === 'GET' && r.body === null,
    ),
  ).toBe(true);
  await page.reload();
  await expect(radio(page, 0)).toBeChecked();
  await expect(page.getByRole('status')).toBeEmpty();
});

test('Empowerment text, speaker surfaces, control boundaries and focus retain measured contrast', async ({
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
    '.empowerment-heading .lead',
    '.empowerment-lesson p',
    '.path-note',
    '.empowerment-links a',
  ])
    await measure('lesson', selector);
  await page.goto(conversationPath);
  for (const [index, choice] of copy.states.entries()) {
    await radio(page, index).check();
    for (const selector of [
      'h1',
      '.empowerment-offer-note',
      '.empowerment-speaker blockquote',
      '.empowerment-controls label',
      '.empowerment-reflection',
      '.empowerment-agreement dd',
    ])
      await measure(choice.id, selector);
    await measure(choice.id, '.empowerment-controls label', 'boundary');
    await measure(choice.id, `input[value="${choice.id}"]`, 'focus');
  }
  await page.goto('/read/empowerment.html');
  for (const selector of [
    'h1',
    '.empowerment-lesson p',
    '.empowerment-speaker blockquote',
    '.source-note',
  ])
    await measure('reading', selector);
  await writeFile(
    info.outputPath('empowerment-contrast.json'),
    JSON.stringify(measurements, null, 2),
  );
});

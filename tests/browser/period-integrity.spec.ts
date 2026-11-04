import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import { integrityContent as content } from '../../src/period-integrity-content';
import { periodExercise } from '../../src/period-content';

const lessonPath = '/#/period/values/integrity';
const recordPath = '/#/period/integrity/record';
const copy = content.case;
const nav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });
const summaries = (page: Page) => page.locator('.integrity-annotations summary');
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
async function checkLesson(page: Page) {
  const lesson = page.getByRole('article', { name: 'Integrity lesson', exact: true });
  for (const section of content.lesson) {
    await expect(lesson.getByRole('heading', { name: section.heading, exact: true })).toBeVisible();
    for (const text of section.paragraphs)
      await expect(lesson.getByText(text, { exact: true })).toBeVisible();
  }
  for (const text of [content.card, content.book, content.availability])
    await expect(lesson.getByText(text, { exact: true })).toBeVisible();
}
async function checkFixedRecord(page: Page) {
  for (const text of [
    copy.original,
    ...copy.facts,
    copy.challenge,
    copy.reflection,
    copy.correction,
    copy.correction_note,
    ...copy.continuation,
    copy.evidence,
    copy.limits,
    copy.bridge,
  ])
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  for (const response of copy.responses)
    for (const text of response) await expect(page.getByText(text, { exact: true })).toBeVisible();
}

test('ten complete sections, truthful availability and the connected Code are readable without input', async ({
  page,
}) => {
  await page.goto(lessonPath);
  await expect(page.locator('h1')).toHaveText(content.title);
  await checkLesson(page);
  await expect(page.locator('main input, main textarea, main select, main button')).toHaveCount(0);
  await expect(nav(page).getByRole('link')).toHaveText(content.navigation.header);
  await expect(nav(page).getByRole('link', { name: 'Integrity', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(
    page.getByRole('navigation', { name: 'PERIOD teaching order' }).getByRole('link'),
  ).toHaveText(['Ownership', 'Purpose', 'Resilience', 'Integrity', 'Discipline', 'Empowerment']);
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Empowerment', exact: true }),
  ).toHaveCount(1);
  await axe(page);
});

test('all eight native disclosure combinations preserve the facts, independent focus and visible continuation', async ({
  page,
}) => {
  await page.goto(recordPath);
  const details = page.locator('.integrity-annotations details');
  await expect(details).toHaveCount(3);
  for (let mask = 0; mask < 8; mask++) {
    for (let i = 0; i < 3; i++) {
      const want = Boolean(mask & (1 << i));
      if ((await details.nth(i).evaluate((el: HTMLDetailsElement) => el.open)) !== want) {
        await summaries(page).nth(i).focus();
        await summaries(page)
          .nth(i)
          .press(mask % 2 ? 'Enter' : 'Space');
        await expect(summaries(page).nth(i)).toBeFocused();
      }
    }
    expect(
      await details.evaluateAll((els) => els.map((el) => (el as HTMLDetailsElement).open)),
    ).toEqual([0, 1, 2].map((i) => Boolean(mask & (1 << i))));
    for (let i = 0; i < 3; i++) {
      await expect(summaries(page).nth(i)).toContainText(copy.notes[i].claim);
      const body = details.nth(i).locator('.integrity-note-body');
      if (mask & (1 << i)) {
        for (const text of [
          copy.notes[i].fact,
          copy.notes[i].explanation,
          copy.notes[i].replacement,
          copy.notes[i].action,
          copy.notes[i].limit,
        ])
          await expect(body.getByText(text, { exact: true })).toBeVisible();
      } else await expect(body).not.toBeVisible();
    }
    await checkFixedRecord(page);
  }
  const reflectionBeforeNotes = await page
    .locator('.integrity-reflection')
    .evaluate((el) =>
      Boolean(
        el.compareDocumentPosition(document.querySelector('.integrity-annotations')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    );
  expect(reflectionBeforeNotes).toBe(true);
  await summaries(page).nth(0).focus();
  await page.keyboard.press('Tab');
  await expect(summaries(page).nth(1)).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(summaries(page).nth(0)).toBeFocused();
  await expect(
    page.locator(
      '.integrity-annotations [aria-expanded],.integrity-annotations [aria-live],.integrity-annotations button',
    ),
  ).toHaveCount(0);
  await axe(page);
});

test('disclosure accessible names and expanded state are exposed natively', async ({
  page,
  browserName,
}, info) => {
  await page.goto(recordPath);
  const collapsed = await page.locator('.integrity-annotations').ariaSnapshot();
  for (const note of copy.notes) {
    expect(collapsed).toContain(note.label);
    expect(collapsed).toContain(note.claim);
  }
  expect(collapsed).not.toContain(copy.notes[0].fact);
  const cdp = browserName === 'chromium' ? await page.context().newCDPSession(page) : null;
  const nativeStates = async () => {
    const tree = await cdp!.send('Accessibility.getFullAXTree');
    return tree.nodes
      .filter((node) => node.role?.value === 'DisclosureTriangle')
      .map((node) => ({
        name: node.name?.value,
        expanded: node.properties?.find((property) => property.name === 'expanded')?.value.value,
      }));
  };
  const nativeCollapsed = cdp ? await nativeStates() : null;
  if (nativeCollapsed)
    expect(nativeCollapsed.map((node) => node.expanded)).toEqual([false, false, false]);
  await summaries(page).nth(0).press('Enter');
  const expanded = await page.locator('.integrity-annotations').ariaSnapshot();
  expect(expanded).toContain(copy.notes[0].fact);
  if (cdp) {
    const nativeExpanded = await nativeStates();
    expect(nativeExpanded.map((node) => node.expanded)).toEqual([true, false, false]);
    await writeFile(
      info.outputPath('integrity-native-disclosure-states.json'),
      JSON.stringify({ collapsed: nativeCollapsed, creditOpen: nativeExpanded }, null, 2),
    );
    await cdp.detach();
  }
  await writeFile(
    info.outputPath('integrity-accessibility-tree.txt'),
    `COLLAPSED\n${collapsed}\nCREDIT OPEN\n${expanded}`,
  );
  await expect(nav(page).getByRole('link', { name: 'Integrity', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await expect(
    page
      .getByRole('navigation', { name: 'Integrity learning' })
      .getByRole('link', { name: 'Examine a fictional record' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    page
      .getByRole('navigation', { name: 'PERIOD teaching order' })
      .getByRole('link', { name: 'Integrity (lesson focus)' }),
  ).not.toHaveAttribute('aria-current');
});

test('direct entry, deliberate route focus, Back restoration and unknown routes retain useful navigation', async ({
  page,
}) => {
  await page.goto(lessonPath);
  const invitation = page.locator('.integrity-invitation a');
  await invitation.scrollIntoViewIfNeeded();
  await invitation.focus();
  const y = await page.evaluate(() => scrollY);
  await invitation.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await page.goBack();
  await expect(page.locator('h1')).toHaveText(content.title);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
  await page.goForward();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await summaries(page).nth(0).press('Enter');
  await page.getByRole('link', { name: 'Return to Integrity', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
  await page
    .getByRole('navigation', { name: 'Integrity learning' })
    .getByRole('link', { name: 'Examine a fictional record' })
    .click();
  await expect(page.locator('.integrity-annotations details[open]')).toHaveCount(0);
  for (const path of ['/#/period/values/unknown']) {
    await page.goto(path);
    await expect(page.locator('h1')).toHaveText('Choose a value');
    await expect(page.getByText(content.navigation.unavailable, { exact: true })).toBeVisible();
  }
  await page.goto('/#/period/integrity/missing');
  await expect(page.locator('h1')).toHaveText('That page is not here.');
});

test('bounded navigation keeps Ownership first and connects both Resilience endings to Integrity', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText(content.navigation.home_lead, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start with Ownership', exact: true })).toHaveClass(
    /primary/,
  );
  for (const path of ['/#/period/values/resilience', '/#/period/resilience/pressure']) {
    await page.goto(path);
    await page.getByRole('link', { name: 'Continue to Integrity', exact: true }).click();
    await expect(page.locator('h1')).toHaveText(content.title);
  }
  await page.goto('/read/resilience.html');
  await page.getByRole('link', { name: 'Continue to Integrity', exact: true }).first().click();
  await expect(page).toHaveURL(/\/read\/integrity.html$/);
  await checkLesson(page);
});

test('Integrity entry preselects only a blank card and preserves existing private text through reading and external exit', async ({
  page,
  context,
}) => {
  for (const path of [lessonPath, recordPath]) {
    await page.goto(path);
    await page.reload();
    await page
      .getByRole('link', {
        name: path === lessonPath ? 'Write an optional Standard Card' : 'Optional Standard Card',
        exact: true,
      })
      .click();
    await expect(page.locator('#period-valueId')).toHaveValue('integrity');
    await expect(
      page.getByRole('link', { name: 'Read about Integrity', exact: true }),
    ).toHaveAttribute('href', '#/period/values/integrity');
  }
  const marker = 'PRIVATE-WORK13 <b>unchanged</b> 👩🏽‍💻\n  exact';
  await page.locator('#period-valueId').selectOption('purpose');
  await page.locator('#period-standard').fill(marker);
  await nav(page).getByRole('link', { name: 'Integrity', exact: true }).click();
  await page.getByRole('link', { name: "Explore the book on Jim's website", exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  const popupEvent = context.waitForEvent('page');
  await page.getByRole('link', { name: content.navigation.static_link, exact: true }).click();
  const popup = await popupEvent;
  await popup.waitForLoadState();
  await expect(popup.getByRole('main')).not.toContainText(marker);
  await popup.close();
  await page.getByRole('link', { name: 'Write an optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('purpose');
  await expect(page.locator('#period-standard')).toHaveValue(marker);
});

test('native annotations add no persistence, private history, telemetry or network submissions', async ({
  page,
  context,
  baseURL,
}) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  const errors: string[] = [];
  page.on('request', (r) =>
    requests.push({ url: r.url(), method: r.method(), body: r.postData() }),
  );
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(recordPath);
  await page.evaluate(() => {
    localStorage.setItem('unrelated-work13', 'exact existing record');
    sessionStorage.setItem('unrelated-work13', 'exact session');
  });
  const before = await page.evaluate(() => [
    JSON.stringify(localStorage),
    JSON.stringify(sessionStorage),
    JSON.stringify(history.state),
  ]);
  for (let i = 0; i < 3; i++) await summaries(page).nth(i).press('Enter');
  for (let i = 0; i < 3; i++) await summaries(page).nth(i).press('Space');
  expect(
    await page.evaluate(() => [
      JSON.stringify(localStorage),
      JSON.stringify(sessionStorage),
      JSON.stringify(history.state),
    ]),
  ).toEqual(before);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
  expect(
    await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length)),
  ).toBe(0);
  expect(
    requests.every(
      (r) =>
        r.method === 'GET' && r.body === null && new URL(r.url).origin === new URL(baseURL!).origin,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await expect(page.locator('main input,main textarea,main select,main form')).toHaveCount(0);
});

test('direct static reading survives disabled, blocked and failing application scripts', async ({
  browser,
  baseURL,
}, info) => {
  test.setTimeout(90000);
  for (const mode of ['disabled', 'blocked', 'failing']) {
    const context = await browser.newContext({ javaScriptEnabled: mode !== 'disabled' });
    if (mode !== 'disabled')
      await context.route('**/*', (route) =>
        route.request().resourceType() === 'script'
          ? mode === 'blocked'
            ? route.abort()
            : route.fulfill({
                contentType: 'text/javascript',
                body: 'throw new Error("Intentional Work 13 startup failure");',
              })
          : route.continue(),
      );
    const page = await context.newPage();
    await page.goto(baseURL! + recordPath);
    await page
      .locator('#educational-fallback')
      .getByRole('link', {
        name: 'Read Integrity and the complete fictional record without JavaScript',
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(baseURL! + '/read/integrity.html');
    await checkLesson(page);
    await checkFixedRecord(page);
    const response = await context.request.get(baseURL! + '/read/integrity.html');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    const css = await context.request.get(baseURL! + '/read/integrity.css');
    expect(css.status()).toBe(200);
    expect(css.headers()['content-type']).toContain('text/css');
    await expect(page.locator('script,details,summary,input,textarea,select,button')).toHaveCount(
      0,
    );
    for (const note of copy.notes)
      for (const text of [note.fact, note.explanation, note.replacement, note.action, note.limit])
        await expect(page.getByText(text, { exact: true })).toBeVisible();
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await fits(page)).toBe(true);
      if (mode === 'disabled' && info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`integrity-static-${width}.png`),
          fullPage: true,
        });
    }
    await context.close();
  }
});

test('desktop, mobile and narrow layouts expose the actual lesson and all annotation states', async ({
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
        path: info.outputPath(`integrity-lesson-${width}.png`),
        fullPage: true,
      });
    await page.goto(recordPath);
    expect(await fits(page)).toBe(true);
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`integrity-record-${width}.png`),
        fullPage: true,
      });
    for (let i = 0; i < 3; i++) {
      await summaries(page).nth(i).press('Enter');
      expect(await fits(page)).toBe(true);
      if (i === 0 && info.project.name === 'chromium')
        await page.screenshot({
          path: info.outputPath(`integrity-credit-${width}.png`),
          fullPage: true,
        });
    }
    if (info.project.name === 'chromium')
      await page.screenshot({
        path: info.outputPath(`integrity-notes-${width}.png`),
        fullPage: true,
      });
    await axe(page);
  }
});

test('enlarged text, text spacing, font failure, forced colors and reduced motion retain reflow and focus', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.route('**/fonts/**', (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  for (const path of [lessonPath, recordPath, '/read/integrity.html']) {
    await page.goto(path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
      document.querySelectorAll<HTMLElement>('.period-shell *').forEach((element) => {
        element.style.setProperty('line-height', '1.5', 'important');
        element.style.setProperty('letter-spacing', '.12em', 'important');
        element.style.setProperty('word-spacing', '.16em', 'important');
        if (element.tagName === 'P') element.style.setProperty('margin-bottom', '2em', 'important');
      });
    });
    expect(await fits(page)).toBe(true);
    if (path === recordPath) {
      await summaries(page).nth(0).press('Enter');
      await expect(summaries(page).nth(0)).toBeFocused();
      expect(
        await summaries(page)
          .nth(0)
          .evaluate((el) => getComputedStyle(el).outlineStyle),
      ).not.toBe('none');
    }
  }
});

test('complete reading is accessible and prints every correction and limitation on A4 and Letter', async ({
  page,
  browserName,
}, info) => {
  await page.goto('/read/integrity.html');
  await axe(page);
  await page.emulateMedia({ media: 'print' });
  await checkLesson(page);
  await checkFixedRecord(page);
  for (const note of copy.notes)
    await expect(page.getByText(note.action, { exact: true })).toBeVisible();
  if (browserName === 'chromium')
    for (const format of ['A4', 'Letter'] as const)
      await page.pdf({
        path: info.outputPath(`integrity-reading-${format}.pdf`),
        format,
        printBackground: true,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      });
  await expect(page.locator('.integrity-static')).toContainText(content.attribution);
});

test('Integrity card output retains the existing intention distinction through copy, fallback and print', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copied = text;
        },
      },
    });
    window.print = () => {
      (window as any).printed = true;
    };
  });
  await page.goto(lessonPath);
  await page.getByRole('link', { name: 'Write an optional Standard Card', exact: true }).click();
  await page.locator('#period-standard').fill('Correct my factual claim.');
  await page.locator('#period-nextApplication').fill('Send the accurate information.');
  await page.getByRole('button', { name: 'Make my standard card', exact: true }).click();
  await page.getByRole('button', { name: 'Copy my card', exact: true }).click();
  const copied = await page.evaluate(() => (window as any).copied);
  expect(copied).toContain(periodExercise.footnote);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Copy my card', exact: true }).click();
  await expect(page.getByLabel('Card text to copy')).toHaveValue(copied);
  await page.getByRole('button', { name: 'Print my card', exact: true }).click();
  expect(await page.evaluate(() => (window as any).printed)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.period-card')).toContainText(periodExercise.footnote);
});

test('Integrity text, control boundaries and focus retain measured contrast', async ({
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
    '.integrity-heading .lead',
    '.integrity-lesson p',
    '.path-note',
    '.integrity-nav a[aria-current]',
    '.integrity-text-link',
  ])
    await measure('lesson', selector);
  await page.goto(recordPath);
  for (const state of ['collapsed', 'expanded']) {
    if (state === 'expanded')
      for (let i = 0; i < 3; i++) await summaries(page).nth(i).press('Enter');
    for (const selector of [
      'h1',
      '.integrity-message p',
      '.integrity-facts li',
      '.integrity-reflection',
      '.integrity-annotations summary',
      '.integrity-claim',
      '.integrity-correction blockquote',
      '.integrity-limits p',
    ])
      await measure(state, selector);
    for (const note of copy.notes) {
      await measure(state, `#integrity-note-${note.id}`, 'boundary');
      await measure(state, `#integrity-note-${note.id} summary`, 'focus');
    }
  }
  await page.goto('/read/integrity.html');
  for (const selector of [
    'h1',
    '.integrity-lesson p',
    '.integrity-reading-note p',
    '.integrity-correction blockquote',
    '.source-note',
  ])
    await measure('static', selector);
  await writeFile(
    info.outputPath('integrity-contrast.json'),
    JSON.stringify(measurements, null, 2),
  );
});

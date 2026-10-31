import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import {
  purposeLesson,
  purposeCopy as copy,
  purposeDirections,
  purposeCapacities,
  purposeExamples,
  purposeRelationships,
  purposeConnected,
  purposeBridge,
  purposeCardNote,
  purposeNavigationNote,
  purposeOwnershipHandoff,
  type PurposeExample,
} from '../../src/period-purpose-content';
import { periodExercise } from '../../src/period-content';

const lessonPath = '/#/period/values/purpose';
const eveningPath = '/#/period/purpose/evening';
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });
async function select(page: Page, example: PurposeExample) {
  await page
    .getByRole('button', { name: purposeDirections[example.direction].label, exact: true })
    .click();
  await page
    .getByRole('button', { name: purposeCapacities[example.capacity].label, exact: true })
    .click();
}
async function checkExample(page: Page, example: PurposeExample) {
  const current = page.getByRole('region', {
    name: `Fictional example: ${example.label}`,
    exact: true,
  });
  await expect(current).toBeVisible();
  await expect(page.locator('.purpose-showing')).toHaveText(`Showing: ${example.label}`);
  await expect(current.locator('.purpose-direction-panel p')).toHaveText(
    purposeDirections[example.direction].description,
  );
  await expect(page.locator('.purpose-capacity-description')).toHaveText(
    purposeCapacities[example.capacity].description,
  );
  await expect(current.locator('.purpose-time')).toHaveText(example.plan.map((row) => row.time));
  await expect(current.locator('.purpose-timeline h3')).toHaveText(
    example.plan.map((row) => row.title),
  );
  for (const text of [
    example.serves,
    example.cost,
    example.uncertain,
    example.compare,
    ...example.plan.map((row) => row.description),
  ])
    await expect(current.getByText(text, { exact: true })).toBeVisible();
  for (const [id, direction] of Object.entries(purposeDirections))
    await expect(page.getByRole('button', { name: direction.label, exact: true })).toHaveAttribute(
      'aria-pressed',
      String(id === example.direction),
    );
  for (const [id, capacity] of Object.entries(purposeCapacities))
    await expect(page.getByRole('button', { name: capacity.label, exact: true })).toHaveAttribute(
      'aria-pressed',
      String(id === example.capacity),
    );
}
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}

test('complete Purpose teaching, connected values and both editorial refinements are available without answers', async ({
  page,
}) => {
  await page.goto(lessonPath);
  await expect(page.locator('h1')).toHaveText('Purpose.');
  for (const section of purposeLesson) {
    await expect(page.getByRole('heading', { name: section.heading, exact: true })).toBeVisible();
    for (const text of section.paragraphs)
      await expect(page.getByText(text, { exact: true })).toBeVisible();
  }
  for (const text of [
    purposeConnected,
    ...purposeBridge,
    purposeCardNote,
    ...purposeRelationships.map((item) => item.connection),
  ])
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  await expect(page.locator('.purpose-connections h3')).toHaveText(
    purposeRelationships.map((item) => item.value),
  );
  await expect(page.locator('main input, main textarea, main select')).toHaveCount(0);
  await expect(
    page.locator(
      'a[href*="/values/resilience"], a[href*="/values/integrity"], a[href*="/values/discipline"], a[href*="/values/empowerment"]',
    ),
  ).toHaveCount(0);
  await expect(mainNav(page).getByRole('link', { name: 'Purpose', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await axe(page);
  await page.locator('.purpose-invitation a').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.getByText(copy.planDistinction, { exact: true })).toBeVisible();
  expect(
    await page
      .locator('.purpose-plan-distinction')
      .evaluate(
        (element) =>
          !!(
            element.compareDocumentPosition(document.querySelector('.purpose-current-example')!) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
  ).toBe(true);
  await expect(page.getByText(copy.same_evening, { exact: true })).toBeVisible();
  await expect(page.getByText(copy.same_evening_end, { exact: true })).toBeVisible();
  await expect(page.locator('main input, main textarea, main select')).toHaveCount(0);
  await expect(mainNav(page).getByRole('link', { name: 'Purpose', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
});

test('independent conditions expose all four exact tradeoffs, keep keyboard focus and announce only changes', async ({
  page,
}) => {
  await page.goto(eveningPath);
  await checkExample(page, purposeExamples.work_usual);
  await expect(page.getByRole('status')).toHaveText('');
  // Alternating one axis at a time must preserve the other axis.
  for (const [label, example] of [
    ['Less capacity tonight', purposeExamples.work_lower],
    ['Basic stability', purposeExamples.stability_lower],
    ['Usual capacity', purposeExamples.stability_usual],
    ['Steadier work', purposeExamples.work_usual],
  ] as const) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.focus();
    await page.keyboard.press('Space');
    await expect(button).toBeFocused();
    await checkExample(page, example);
    await expect(page.getByRole('status')).toHaveText(
      `Fictional example: ${purposeDirections[example.direction].label}, ${purposeCapacities[example.capacity].label.toLowerCase()}. Plan and tradeoffs updated.`,
    );
    await axe(page);
  }
  const before = await page.getByRole('status').textContent();
  await page.getByRole('status').evaluate((element) => {
    (window as any).purposeAnnouncements = 0;
    new MutationObserver(() => (window as any).purposeAnnouncements++).observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Steadier work', exact: true }).press('Enter');
  await expect(page.getByRole('status')).toHaveText(before!);
  expect(await page.evaluate(() => (window as any).purposeAnnouncements)).toBe(0);
  await checkExample(page, purposeExamples.work_usual);
});

test('native text disclosure gives every example without selecting it and stays open while conditions change', async ({
  page,
}) => {
  await page.goto(eveningPath);
  const details = page.locator('.purpose-reading');
  await expect(details).not.toHaveAttribute('open', '');
  await details.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('summary')).toBeFocused();
  for (const example of Object.values(purposeExamples)) {
    const reading = details
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: example.label, exact: true }) });
    for (const text of [
      purposeDirections[example.direction].description,
      purposeCapacities[example.capacity].description,
      example.serves,
      example.cost,
      example.uncertain,
      example.compare,
      ...example.plan.map((row) => row.description),
    ])
      await expect(reading.getByText(text, { exact: true })).toBeVisible();
    for (const row of example.plan)
      await expect(reading.getByText(`${row.time} · ${row.title}`, { exact: true })).toBeVisible();
  }
  await checkExample(page, purposeExamples.work_usual);
  await select(page, purposeExamples.stability_lower);
  await expect(details).toHaveAttribute('open', '');
  await checkExample(page, purposeExamples.stability_lower);
  await axe(page);
  await details.locator('summary').press('Space');
  await expect(details).not.toHaveAttribute('open', '');
});

test('two-value navigation preserves Ownership practice and honestly labels unfinished lessons', async ({
  page,
}) => {
  await page.goto('/');
  await expect(mainNav(page).getByRole('link')).toHaveText(['Why PERIOD?', 'Ownership', 'Purpose']);
  await expect(page.getByRole('link', { name: 'Start with Ownership' })).toHaveClass(/primary/);
  await page.getByRole('link', { name: 'Explore Purpose', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
  const path = page.getByRole('navigation', { name: 'PERIOD teaching order' });
  await expect(path.locator('li')).toHaveCount(6);
  await expect(path.getByRole('link')).toHaveText(['Ownership', 'Purpose']);
  await expect(path.getByRole('link', { name: 'Purpose', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(path.locator('.path-note')).toHaveText(purposeNavigationNote);
  await page.getByRole('link', { name: 'Return to Ownership', exact: true }).click();
  await expect(page.getByText(purposeOwnershipHandoff, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Continue to Purpose', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Purpose.');
  await page.goto('/#/period/practice/connected-code');
  await expect(page.getByText(purposeOwnershipHandoff, { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Continue to Purpose', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Purpose.');
  for (const value of ['resilience', 'integrity', 'discipline', 'empowerment']) {
    await page.goto(`/#/period/values/${value}`);
    await expect(page.locator('h1')).toHaveText('Choose a value');
    await expect(page.getByRole('main')).toContainText('not available');
    await expect(page.locator(`a[href="#/period/values/${value}"]`)).toHaveCount(0);
  }
});

test('Back and Forward restore reading positions and temporary example state without history payloads', async ({
  page,
}) => {
  await page.goto(lessonPath);
  const link = page.locator('.purpose-invitation a');
  await link.scrollIntoViewIfNeeded();
  await link.focus();
  const lessonY = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await select(page, purposeExamples.stability_lower);
  await page.evaluate(() => scrollTo(0, 700));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  await page.goBack();
  await expect(page.locator('h1')).toHaveText('Purpose.');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(lessonY, 0);
  // The lesson DOM was replaced. The existing restoration policy focuses its heading.
  await expect(page.locator('h1')).toBeFocused();
  await page.goForward();
  await checkExample(page, purposeExamples.stability_lower);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
  await page.reload();
  await checkExample(page, purposeExamples.work_usual);
});

test('Purpose card entry preselects only a completely blank draft and preserves selected-only and whitespace drafts', async ({
  page,
}) => {
  for (const route of [lessonPath, eveningPath]) {
    await page.goto(route);
    await page.reload();
    const entry =
      route === lessonPath ? 'Write an optional Standard Card' : 'Optional Standard Card';
    await page.getByRole('link', { name: entry, exact: true }).click();
    await expect(page.locator('#period-valueId')).toHaveValue('purpose');
    await expect(page.locator('#period-standard')).toHaveValue('');
  }
  await page.locator('#period-valueId').selectOption('integrity');
  await mainNav(page).getByRole('link', { name: 'Purpose', exact: true }).click();
  await page.getByRole('link', { name: 'Write an optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await page.reload();
  await page.locator('#period-standard').fill('  \n ');
  await mainNav(page).getByRole('link', { name: 'Purpose', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Purpose learning' })
    .getByRole('link', { name: 'Explore one evening' })
    .click();
  await select(page, purposeExamples.stability_lower);
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('');
  await expect(page.locator('#period-standard')).toHaveValue('  \n ');
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('#period-valueId')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue('  \n ');
});

test('full private card retains exact Unicode, edit, copy, manual fallback, print and cancellable clearing after Purpose', async ({
  page,
}) => {
  const standard = '  PRIVATE-WORK09 👩🏽‍💻 é العربية <b>my words</b>\n  ';
  const application = '\nSend my update.  ';
  const correction = '  Ask for help.\nReturn. ';
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
  await page.goto('/#/period/standard');
  await page.locator('#period-valueId').selectOption('ownership');
  await page.locator('#period-standard').fill(standard);
  await page.locator('#period-nextApplication').fill(application);
  await page.locator('.support summary').click();
  await page.locator('#period-returnPlan').fill(correction);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await mainNav(page).getByRole('link', { name: 'Purpose', exact: true }).click();
  await expect(page.getByRole('main')).not.toContainText('PRIVATE-WORK09');
  await page
    .getByRole('navigation', { name: 'Purpose learning' })
    .getByRole('link', { name: 'Explore one evening' })
    .click();
  for (const example of Object.values(purposeExamples)) {
    await select(page, example);
    await expect(page.getByRole('main')).not.toContainText('PRIVATE-WORK09');
  }
  await page.getByRole('link', { name: 'Return to Purpose', exact: true }).click();
  await page.getByRole('link', { name: 'Write an optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-card-title')).toBeVisible();
  for (const [field, text] of [
    ['standard', standard],
    ['nextApplication', application],
    ['returnPlan', correction],
  ])
    expect(await page.locator(`[data-field="${field}"]`).textContent()).toBe(text);
  await expect(page.locator('.period-card b')).toHaveCount(0);
  await page.getByRole('button', { name: 'Copy my card' }).click();
  const copied = await page.evaluate(() => (window as any).copied);
  for (const text of [standard, application, correction, periodExercise.footnote])
    expect(copied).toContain(text);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('denied');
        },
      },
    }),
  );
  await page.getByRole('button', { name: 'Copy my card' }).click();
  await expect(page.getByLabel('Card text to copy')).toHaveValue(copied);
  await page.getByRole('button', { name: 'Print my card' }).click();
  expect(await page.evaluate(() => (window as any).printed)).toBe(true);
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.period-card')).toBeVisible();
  await expect(page.locator('.period-card')).toContainText(periodExercise.footnote);
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Edit my card' }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('ownership');
  await expect(page.locator('#period-standard')).toHaveValue(standard);
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Keep writing' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#period-clear')).toBeFocused();
  await expect(page.locator('#period-standard')).toHaveValue(standard);
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('');
});

test('fictional exploration leaves private drafts, existing storage and all network boundaries intact', async ({
  page,
  context,
  baseURL,
}) => {
  const marker = 'PRIVATE-PURPOSE-9348';
  const requests: { url: string; method: string; headers: unknown; body: string | null }[] = [];
  const logs: string[] = [];
  page.on('request', (request) =>
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      body: request.postData(),
    }),
  );
  page.on('console', (message) => logs.push(message.text()));
  page.on('pageerror', (error) => logs.push(error.message));
  await page.goto('/#/period/standard');
  await page.evaluate(() => {
    localStorage.setItem('unrelated-existing-record', '  unchanged\n👩🏽‍💻  ');
    sessionStorage.setItem('unrelated-session', 'keep');
  });
  const storage = await page.evaluate(() => [
    JSON.stringify(localStorage),
    JSON.stringify(sessionStorage),
  ]);
  await page.locator('#period-standard').fill(marker);
  await mainNav(page).getByRole('link', { name: 'Purpose', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Purpose learning' })
    .getByRole('link', { name: 'Explore one evening' })
    .click();
  for (const example of Object.values(purposeExamples)) await select(page, example);
  await page.locator('.purpose-reading summary').click();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue(marker);
  expect(
    await page.evaluate(() => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)]),
  ).toEqual(storage);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
  expect(
    await page.evaluate(() =>
      navigator.serviceWorker.getRegistrations().then((registrations) => registrations.length),
    ),
  ).toBe(0);
  expect(await page.evaluate(() => JSON.stringify(history.state))).not.toContain(marker);
  expect(page.url()).not.toContain(marker);
  expect(logs.join(' ')).not.toContain(marker);
  expect(
    requests.every(
      (request) =>
        !JSON.stringify(request).includes(marker) &&
        request.method === 'GET' &&
        new URL(request.url).origin === new URL(baseURL!).origin,
    ),
  ).toBe(true);
});

test('complete Purpose and all four examples survive disabled JavaScript and blocked client loading', async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [false, true]) {
    const context = await browser.newContext({ javaScriptEnabled });
    if (javaScriptEnabled)
      await context.route('**/*', (route) =>
        route.request().resourceType() === 'script' ? route.abort() : route.continue(),
      );
    const page = await context.newPage();
    await page.goto(baseURL! + eveningPath);
    const lesson = page.getByRole('region', { name: 'Purpose linear reading', exact: true });
    for (const text of [
      ...purposeLesson.flatMap((section) => [section.heading, ...section.paragraphs]),
      purposeConnected,
      ...purposeRelationships.map((item) => item.connection),
      ...purposeBridge,
      purposeCardNote,
    ])
      await expect(lesson.getByText(text, { exact: true })).toBeVisible();
    const reading = page.getByRole('region', {
      name: 'Purpose evening linear reading',
      exact: true,
    });
    for (const text of [
      copy.title,
      copy.situation,
      copy.facts,
      copy.assumptions,
      copy.planDistinction,
      copy.same_evening,
      copy.same_evening_end,
      copy.close,
      copy.pressure,
      ...Object.values(purposeExamples).flatMap((example) => [
        example.label,
        example.serves,
        example.cost,
        example.uncertain,
        example.compare,
      ]),
    ])
      await expect(reading.getByText(text, { exact: true })).toBeVisible();
    for (const example of Object.values(purposeExamples)) {
      const exampleReading = reading
        .locator('section')
        .filter({ has: page.getByRole('heading', { name: example.label, exact: true }) });
      for (const row of example.plan) {
        await expect(
          exampleReading.getByText(`${row.time} · ${row.title}`, { exact: true }),
        ).toBeVisible();
        await expect(exampleReading.getByText(row.description, { exact: true })).toBeVisible();
      }
    }
    await expect(reading.locator('input, textarea, button, details')).toHaveCount(0);
    await context.close();
  }
});

test('lesson and all four examples reflow at 320, 390, 768 and 1440 with application review captures', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    if (info.project.name === 'chromium' && [390, 1440].includes(width)) {
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({
        path: info.outputPath(`two-value-introduction-${width}.png`),
        fullPage: true,
      });
    }
    await page.goto(lessonPath);
    await page.evaluate(() => document.fonts.ready);
    expect(await fits(page), `lesson ${width}`).toBe(true);
    if (info.project.name === 'chromium' && [390, 1440].includes(width))
      await page.screenshot({
        path: info.outputPath(`purpose-lesson-${width}.png`),
        fullPage: true,
      });
    await page.goto(eveningPath);
    for (const [key, example] of Object.entries(purposeExamples)) {
      await select(page, example);
      await checkExample(page, example);
      expect(await fits(page), `${key} ${width}`).toBe(true);
      for (const target of await page
        .locator('.purpose-controls button, .purpose-nav a, .purpose-reading summary')
        .all()) {
        const box = await target.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      if (info.project.name === 'chromium' && [390, 1440].includes(width)) {
        await page.locator('h1').focus();
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath(`purpose-${key}-${width}.png`),
          fullPage: true,
        });
        if (key === 'stability_lower') {
          await page.keyboard.press('Tab');
          await page.getByRole('button', { name: 'Basic stability', exact: true }).focus();
          await page.screenshot({
            path: info.outputPath(`purpose-keyboard-focus-${width}.png`),
            fullPage: true,
          });
        }
      }
    }
    await page.locator('.purpose-reading summary').click();
    expect(await fits(page), `expanded ${width}`).toBe(true);
    if (info.project.name === 'chromium' && [390, 1440].includes(width))
      await page.screenshot({
        path: info.outputPath(`purpose-reading-${width}.png`),
        fullPage: true,
      });
  }
});

test('Purpose supports enlarged text, spacing, missing fonts, reduced motion, forced colors and 400 percent equivalent reflow', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(60000);
  // 320 CSS pixels is the reflow width of a 1280-pixel viewport at 400%.
  // Device scaling is not native browser UI zoom; assistive technology review remains manual.
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    deviceScaleFactor: 4,
    reducedMotion: 'reduce',
    forcedColors: 'active',
  });
  await context.route('**/*.woff2', (route) => route.abort());
  const page = await context.newPage();
  for (const route of [lessonPath, eveningPath]) {
    await page.goto(baseURL! + route);
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
      document.querySelectorAll<HTMLElement>('.period-shell *').forEach((element) => {
        element.style.setProperty('line-height', '1.5', 'important');
        element.style.setProperty('letter-spacing', '.12em', 'important');
        element.style.setProperty('word-spacing', '.16em', 'important');
        if (element.tagName === 'P') element.style.setProperty('margin-bottom', '2em', 'important');
      });
    });
    expect(await fits(page), route).toBe(true);
    if (route === eveningPath) {
      for (const example of Object.values(purposeExamples)) {
        await select(page, example);
        expect(await fits(page), example.label).toBe(true);
      }
      await page.locator('.purpose-reading summary').press('Enter');
      await expect(page.locator('.purpose-reading')).toHaveAttribute('open', '');
      expect(await fits(page), 'all examples expanded').toBe(true);
      const selected = page.getByRole('button', { name: 'Basic stability', exact: true });
      // Reach the control with real keyboard navigation. Firefox correctly need not
      // show :focus-visible for a later programmatic focus after pointer use.
      for (let step = 0; step < 12; step++) {
        if (await selected.evaluate((element) => element === document.activeElement)) break;
        await page.keyboard.press('Shift+Tab');
      }
      await expect(selected).toBeFocused();
      const style = await selected.evaluate((element) => {
        const css = getComputedStyle(element);
        return {
          outline: css.outlineStyle,
          width: css.outlineWidth,
          border: css.borderStyle,
          animation: css.animationName,
        };
      });
      expect(style.outline).not.toBe('none');
      expect(parseFloat(style.width)).toBeGreaterThanOrEqual(2);
      expect(style.border).toBe('double');
      expect(style.animation).toBe('none');
    }
  }
  await context.close();
});

test('actual text, control boundaries and keyboard focus retain measured contrast in every state', async ({
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
    '.purpose-lesson p',
    '.purpose-lesson-heading .position',
    '.purpose-nav a',
    '.purpose-lesson-layout .path-note',
    '.purpose-lesson-layout .selected a',
    '.purpose-reminder p',
  ])
    await measure('lesson', selector);
  await measure('lesson', '.purpose-lesson-layout .selected a', 'focus');
  await page.goto(eveningPath);
  for (const [key, example] of Object.entries(purposeExamples)) {
    await select(page, example);
    for (const selector of [
      '.purpose-reflection',
      '.purpose-capacity-description',
      '.purpose-direction-panel p',
      '.purpose-time',
      '.purpose-consequences p',
      '.purpose-controls button[aria-pressed="true"]',
      '.purpose-controls button[aria-pressed="false"]',
      '.purpose-reading summary',
    ])
      await measure(key, selector);
    await measure(key, '.purpose-controls button[aria-pressed="false"]', 'boundary');
    await measure(key, '.purpose-controls button[aria-pressed="true"]', 'focus');
    await measure(key, '.purpose-reading summary', 'focus');
  }
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'script' ? route.abort() : route.continue(),
  );
  await page.reload();
  for (const selector of [
    '#reading-purpose p',
    '#reading-purpose-evening p',
    '#reading-purpose nav a',
  ])
    await measure('static reading', selector);
  await measure('static reading', '#reading-purpose nav a', 'focus');
  await writeFile(info.outputPath('purpose-contrast.json'), JSON.stringify(measurements, null, 2));
});

import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import { resilienceContent as content } from '../../src/period-resilience-content';
import { resilienceUi as ui, type PressureNote } from '../../src/period-resilience-state';
import { periodExercise } from '../../src/period-content';

const lessonPath = '/#/period/values/resilience';
const pressurePath = '/#/period/resilience/pressure';
const copy = content.activity;
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });
const select = (page: Page) =>
  page.getByRole('combobox', { name: copy.selectorLabel, exact: true });
async function axe(page: Page) {
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
}
async function checkCase(region: Locator, note: PressureNote, expanded = false) {
  for (const text of [
    note.name,
    note.facts,
    note.method,
    note.revision,
    note.retain,
    note.cost,
    note.review,
  ])
    await expect(region.getByText(text, { exact: true })).toBeVisible();
  for (const [index, response] of note.responses.entries()) {
    await expect(region.getByText(response.title, { exact: true })).toBeVisible();
    if (expanded || index === 0)
      await expect(region.getByText(response.text, { exact: true })).toBeVisible();
    else await expect(region.getByText(response.text, { exact: true })).not.toBeVisible();
  }
}
async function checkReading(page: Page) {
  for (const note of content.states) {
    const region = page.getByRole('region', {
      name: `Full pressure note: ${note.name}`,
      exact: true,
    });
    await checkCase(region, note, true);
    await expect(region.locator('details, input, textarea, select, button')).toHaveCount(0);
  }
  await expect(
    page
      .getByRole('region', { name: `Full pressure note: ${content.states[3].name}`, exact: true })
      .getByText(copy.returnStory, { exact: true }),
  ).toBeVisible();
}

test('twelve complete sections, six connected values and an honest Integrity transition are available without answers', async ({
  page,
}) => {
  await page.goto(lessonPath);
  await expect(page.locator('h1')).toHaveText(content.title);
  const lesson = page.getByRole('article', { name: 'Resilience lesson', exact: true });
  for (const section of content.lesson) {
    await expect(lesson.getByRole('heading', { name: section.heading, exact: true })).toBeVisible();
    for (const text of section.paragraphs)
      await expect(lesson.getByText(text, { exact: true })).toBeVisible();
  }
  for (const [, text] of content.values)
    await expect(lesson.getByText(text, { exact: true })).toBeVisible();
  await expect(lesson.locator('.resilience-connections h3')).toHaveText(
    content.values.map(([name]) => name),
  );
  await expect(lesson.getByText(content.lesson[9].availability, { exact: true })).toBeVisible();
  await expect(page.locator('main input, main textarea, main select')).toHaveCount(0);
  await expect(
    page.locator(
      'a[href*="/values/integrity"], a[href*="/values/discipline"], a[href*="/values/empowerment"]',
    ),
  ).toHaveCount(0);
  await expect(
    mainNav(page).getByRole('link', { name: 'Resilience', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await axe(page);
});

test('one native select updates every case coherently, preserves focus and only announces actual changes', async ({
  page,
}) => {
  await page.goto(pressurePath);
  const control = select(page);
  await expect(control).toHaveValue('slow');
  await expect(control).toHaveAttribute('aria-describedby', 'resilience-pressure-help');
  await expect(control.locator('option')).toHaveText(content.states.map((note) => note.name));
  await expect(page.getByRole('status')).toHaveText('');
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('main input, main textarea, main button')).toHaveCount(0);
  await expect(page.locator('main select')).toHaveCount(1);
  for (const note of content.states) {
    await control.focus();
    await control.selectOption(note.id);
    await expect(control).toBeFocused();
    await checkCase(page.locator('.resilience-current'), note);
    for (const text of [copy.aim, copy.standard, copy.shared, ui.refinement])
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    expect(
      await page
        .getByText(ui.refinement, { exact: true })
        .evaluate((element) => element.closest('details') === null),
    ).toBe(true);
    if (note.id !== 'slow')
      await expect(page.getByRole('status')).toHaveText(`Pressure note updated: ${note.name}.`);
    await axe(page);
  }
  await page.getByRole('status').evaluate((element) => {
    (window as any).resilienceAnnouncements = 0;
    new MutationObserver(() => (window as any).resilienceAnnouncements++).observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  });
  for (let count = 0; count < 3; count++) await control.selectOption('harm');
  expect(await page.evaluate(() => (window as any).resilienceAnnouncements)).toBe(0);
  await expect(page.getByRole('status')).toHaveText(
    'Pressure note updated: The setting is harmful.',
  );
});

test('case disclosures are independent, reset on a changed condition and leave complete reading open', async ({
  page,
}) => {
  await page.goto(pressurePath);
  const responses = page.locator('.resilience-current .resilience-responses details');
  await expect(responses.nth(0)).toHaveAttribute('open', '');
  await expect(responses.nth(1)).not.toHaveAttribute('open', '');
  await expect(responses.nth(2)).not.toHaveAttribute('open', '');
  for (const index of [1, 2]) {
    await responses.nth(index).locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(responses.nth(index).locator('summary')).toBeFocused();
    await expect(responses.nth(index)).toHaveAttribute('open', '');
  }
  await responses.nth(0).locator('summary').press('Space');
  await expect(responses.nth(0)).not.toHaveAttribute('open', '');
  await expect(responses.nth(1)).toHaveAttribute('open', '');
  const reading = page.locator('.resilience-reading');
  await expect(reading).not.toHaveAttribute('open', '');
  await reading.locator(':scope > summary').press('Enter');
  await checkReading(page);
  for (const note of [...content.states.slice(1), content.states[0]]) {
    await select(page).selectOption(note.id);
    await expect(reading).toHaveAttribute('open', '');
    await checkCase(page.locator('.resilience-current'), note);
    for (const [index, response] of note.responses.entries()) {
      const details = page
        .locator('.resilience-current details')
        .filter({ has: page.getByText(response.title, { exact: true }) });
      expect(await details.evaluate((element) => (element as HTMLDetailsElement).open)).toBe(
        index === 0,
      );
      if (index > 0) {
        await details.locator('summary').press('Enter');
        await expect(details.getByText(response.text, { exact: true })).toBeVisible();
      }
    }
  }
  await reading.locator(':scope > summary').press('Space');
  await expect(reading).not.toHaveAttribute('open', '');
});

test('the missed agreement distinguishes intention from actual action and resets its optional continuation', async ({
  page,
}) => {
  await page.goto(pressurePath);
  await select(page).selectOption('missed');
  const current = page.locator('.resilience-current');
  await expect(current.getByText(copy.returnTitle, { exact: true })).toBeVisible();
  await expect(current.getByText(copy.returnCopy, { exact: true })).toBeVisible();
  await expect(current.getByText(copy.returnStory, { exact: true })).not.toBeVisible();
  await current.getByText(ui.returnLabel, { exact: true }).press('Enter');
  await expect(current.getByText(copy.returnStory, { exact: true })).toBeVisible();
  await select(page).selectOption('slow');
  await select(page).selectOption('missed');
  await expect(current.locator('.resilience-return details')).not.toHaveAttribute('open', '');
  await expect(current.getByText(copy.returnStory, { exact: true })).not.toBeVisible();
});

test('keyboard selection, local routes, Back and Forward preserve reading positions without persisting conditions', async ({
  page,
}, info) => {
  await page.goto(lessonPath);
  const invitation = page.locator('.resilience-invitation a');
  await invitation.scrollIntoViewIfNeeded();
  await invitation.focus();
  const lessonY = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await expect(
    mainNav(page).getByRole('link', { name: 'Resilience', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
  const control = select(page);
  await control.focus();
  if (info.project.name !== 'mobile-chromium') {
    // Browser-engine keyboard events. This does not claim physical mobile picker testing.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(control).toHaveValue('blocked');
    await expect(control).toBeFocused();
  }
  await control.selectOption('harm');
  await page.evaluate(() => scrollTo(0, 700));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  await page.goBack();
  await expect(page.locator('h1')).toHaveText(content.title);
  await expect(page.locator('h1')).toBeFocused();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(lessonY, 0);
  await page.goForward();
  await expect(control).toHaveValue('slow');
  await expect(page.getByRole('status')).toHaveText('');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
  await control.selectOption('missed');
  await page.reload();
  await expect(control).toHaveValue('slow');
  await expect(page.getByRole('status')).toHaveText('');
});

test('homepage stays oriented to Ownership and the same-page three-lesson path reaches Resilience from Purpose', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText(content.homeLead, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start with Ownership' })).toHaveClass(/primary/);
  const before = page.url();
  await page.getByRole('link', { name: 'Explore the lessons', exact: true }).press('Enter');
  expect(page.url()).toBe(before);
  await expect(page.locator('#teaching-order')).toBeFocused();
  await expect(
    page.getByRole('navigation', { name: 'PERIOD teaching order' }).getByRole('link'),
  ).toHaveText(['Ownership', 'Purpose', 'Resilience']);
  await mainNav(page).getByRole('link', { name: 'Purpose', exact: true }).click();
  await page.getByRole('link', { name: 'Continue to Resilience', exact: true }).press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.locator('h1')).toHaveText(content.title);
  await expect(page.locator('.path-note')).toHaveText(content.availability);
  await page
    .getByRole('navigation', { name: 'Resilience learning' })
    .getByRole('link', { name: 'Explore a plan under pressure', exact: true })
    .click();
  await expect(page.locator('h1')).toHaveText(copy.title);
  await page.getByRole('link', { name: 'Return to Resilience', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
});

test('Resilience entry preselects only a genuinely blank Standard Card through both routes', async ({
  page,
}) => {
  for (const path of [lessonPath, pressurePath]) {
    await page.goto(path);
    await page.reload();
    const entry =
      path === lessonPath ? 'Write an optional Standard Card' : 'Optional Standard Card';
    await page.getByRole('link', { name: entry, exact: true }).click();
    await expect(page.locator('#period-valueId')).toHaveValue('resilience');
    await expect(page.locator('#period-standard')).toHaveValue('');
    await expect(
      page.getByRole('link', { name: 'Read about Resilience', exact: true }),
    ).toHaveAttribute('href', '#/period/values/resilience');
  }
  await page.locator('#period-valueId').selectOption('integrity');
  await mainNav(page).getByRole('link', { name: 'Resilience', exact: true }).click();
  await page.getByRole('link', { name: 'Write an optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await page.reload();
  await page.locator('#period-standard').fill('  \n ');
  await mainNav(page).getByRole('link', { name: 'Resilience', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Resilience learning' })
    .getByRole('link', { name: 'Explore a plan under pressure', exact: true })
    .click();
  await select(page).selectOption('harm');
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('');
  await expect(page.locator('#period-standard')).toHaveValue('  \n ');
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('#period-valueId')).toBeFocused();
});

test('a private completed card survives all conditions, the new-tab reading link, edit, copy fallback, print and cancelled clearing', async ({
  page,
  context,
}) => {
  const standard = '  PRIVATE-WORK11 👩🏽‍💻 é العربية <b>my words</b>\n  ';
  const application = '\nSend my update.  ',
    correction = '  Ask for help.\nReturn. ';
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
  await mainNav(page).getByRole('link', { name: 'Resilience', exact: true }).click();
  await expect(page.getByRole('main')).not.toContainText('PRIVATE-WORK11');
  await page
    .getByRole('navigation', { name: 'Resilience learning' })
    .getByRole('link', { name: 'Explore a plan under pressure', exact: true })
    .click();
  for (const note of content.states) {
    await select(page).selectOption(note.id);
    await expect(page.getByRole('main')).not.toContainText('PRIVATE-WORK11');
  }
  const popupPromise = context.waitForEvent('page');
  await page.getByRole('link', { name: /Read the text-only version/ }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  expect(new URL(popup.url()).pathname + new URL(popup.url()).hash).toBe(
    '/read/resilience.html#pressure-notes',
  );
  await expect(popup.getByRole('main')).not.toContainText('PRIVATE-WORK11');
  await popup.close();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
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

test('fictional conditions create no storage, history payload, submission, account or telemetry and never read private text', async ({
  page,
  context,
  baseURL,
}) => {
  const marker = 'PRIVATE-RESILIENCE-9348';
  const requests: { url: string; method: string; headers: unknown; body: string | null }[] = [],
    logs: string[] = [];
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
  await mainNav(page).getByRole('link', { name: 'Resilience', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Resilience learning' })
    .getByRole('link', { name: 'Explore a plan under pressure', exact: true })
    .click();
  for (const note of content.states) await select(page).selectOption(note.id);
  await page.locator('.resilience-reading > summary').click();
  await expect(page.getByRole('main')).not.toContainText(marker);
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

test('direct static reading and the root fallback work with JavaScript disabled, blocked and failing', async ({
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
                body: 'throw new Error("Intentional application load failure");',
              })
          : route.continue(),
      );
    const page = await context.newPage();
    await page.goto(baseURL! + pressurePath);
    const link = page.locator('#educational-fallback').getByRole('link', {
      name: 'Read Resilience and all five pressure notes without JavaScript',
      exact: true,
    });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(baseURL! + '/read/resilience.html');
    // Make a fresh document request; a same-document hash jump has no HTTP response.
    await page.goto('about:blank');
    const response = await page.goto(baseURL! + '/read/resilience.html#pressure-notes');
    expect(response!.status()).toBe(200);
    expect(response!.headers()['content-type']).toContain('text/html');
    await expect(page.locator('script, input, textarea, select, button, details')).toHaveCount(0);
    const lesson = page.getByRole('article', { name: 'Resilience lesson', exact: true });
    for (const section of content.lesson) {
      await expect(
        lesson.getByRole('heading', { name: section.heading, exact: true }),
      ).toBeVisible();
      for (const text of section.paragraphs)
        await expect(lesson.getByText(text, { exact: true })).toBeVisible();
    }
    for (const [, text] of content.values)
      await expect(lesson.getByText(text, { exact: true })).toBeVisible();
    for (const text of [copy.shared, ui.refinement, copy.aim, copy.standard])
      await expect(page.getByText(text, { exact: true })).toBeVisible();
    await checkReading(page);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await fits(page), `${mode} static ${width}`).toBe(true);
      if (mode === 'disabled' && info.project.name === 'chromium' && [390, 1440].includes(width))
        await page.screenshot({
          path: info.outputPath(`resilience-static-${width}.png`),
          fullPage: true,
        });
    }
    if (mode === 'disabled') {
      // Axe needs JavaScript, so use the identical static document in a separate context below.
      expect((await response!.text()).includes('<script')).toBe(false);
    }
    await context.close();
  }
});

test('a failed interactive render exposes every explanation as semantic reading', async ({
  page,
}) => {
  await page.goto(pressurePath);
  await page.evaluate(() => {
    const original = document.createElementNS.bind(document);
    document.createElementNS = ((...args: Parameters<typeof document.createElementNS>) => {
      if (args[1] === 'details') {
        document.createElementNS = original;
        throw new Error('Intentional one-time case render failure');
      }
      return original(...args);
    }) as typeof document.createElementNS;
  });
  await select(page).selectOption('blocked');
  await expect(page.getByText(ui.unavailable, { exact: true })).toBeVisible();
  await expect(select(page)).toHaveCount(0);
  await checkReading(page);
  await expect(page.getByText(ui.refinement, { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Read the text-only version/ })).toBeVisible();
});

test('lesson and five cases reflow at 320, 390, 768 and 1440 with real desktop and mobile captures', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const capture = async (name: string) => {
      if (info.project.name === 'chromium' && [390, 1440].includes(width)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: info.outputPath(`resilience-${name}-${width}.png`),
          fullPage: true,
        });
      }
    };
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await capture('homepage');
    await page.goto(lessonPath);
    await page.evaluate(() => document.fonts.ready);
    expect(await fits(page), `lesson ${width}`).toBe(true);
    await capture('lesson');
    await page.goto(pressurePath);
    for (const note of content.states) {
      await select(page).selectOption(note.id);
      await checkCase(page.locator('.resilience-current'), note);
      expect(await fits(page), `${note.id} ${width}`).toBe(true);
      for (const target of await page
        .locator(
          '.resilience-control select, .resilience-nav a, .resilience-current summary, .resilience-reading > summary',
        )
        .all()) {
        const box = await target.boundingBox();
        expect(box!.width).toBeGreaterThanOrEqual(44);
        expect(box!.height).toBeGreaterThanOrEqual(44);
      }
      await capture(note.id);
      if (note.id === 'missed') {
        await page.locator('.resilience-current .resilience-return summary').click();
        expect(await fits(page)).toBe(true);
        await capture('actual-return');
      }
    }
    await page.locator('.resilience-reading > summary').click();
    expect(await fits(page), `reading ${width}`).toBe(true);
    await capture('complete-reading');
  }
});

test('enlarged text, spacing, missing fonts, reduced motion, forced colors and 400 percent equivalent reflow preserve access', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(90000);
  // This is CSS reflow and text enlargement, not native browser UI zoom or physical-device testing.
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    deviceScaleFactor: 4,
    reducedMotion: 'reduce',
    forcedColors: 'active',
  });
  await context.route('**/*.woff2', (route) => route.abort());
  const page = await context.newPage();
  for (const path of [lessonPath, pressurePath, '/read/resilience.html']) {
    await page.goto(baseURL! + path);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
      document.querySelectorAll<HTMLElement>('.period-shell *').forEach((element) => {
        element.style.setProperty('line-height', '1.5', 'important');
        element.style.setProperty('letter-spacing', '.12em', 'important');
        element.style.setProperty('word-spacing', '.16em', 'important');
        if (element.tagName === 'P') element.style.setProperty('margin-bottom', '2em', 'important');
      });
    });
    expect(await fits(page), path).toBe(true);
    if (path === pressurePath) {
      for (const note of content.states) {
        await select(page).selectOption(note.id);
        expect(await fits(page), note.name).toBe(true);
      }
      await page.locator('.resilience-reading > summary').press('Enter');
      expect(await fits(page), 'full reading expanded').toBe(true);
      await page.keyboard.press('Tab');
      await select(page).focus();
      const style = await select(page).evaluate((element) => {
        const css = getComputedStyle(element);
        return { outline: css.outlineStyle, width: css.outlineWidth, animation: css.animationName };
      });
      expect(style.outline).not.toBe('none');
      expect(parseFloat(style.width)).toBeGreaterThanOrEqual(2);
      expect(style.animation).toBe('none');
    }
  }
  await context.close();
});

test('the complete disclosure and static page have no automated WCAG violations', async ({
  page,
}) => {
  await page.goto(pressurePath);
  await select(page).selectOption('missed');
  await page.locator('.resilience-current .resilience-return summary').click();
  await page.locator('.resilience-reading > summary').click();
  await axe(page);
  await page.goto('/read/resilience.html');
  await axe(page);
});

test('headings, body copy, controls, links and focus retain measured contrast in all five conditions', async ({
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
    '.resilience-heading h1',
    '.resilience-lesson h2',
    '.resilience-lesson p',
    '.resilience-heading .position',
    '.resilience-nav a',
    '.path-note',
    '.resilience-text-link',
  ])
    await measure('lesson', selector);
  await measure('lesson', '.resilience-nav a', 'focus');
  await page.goto(pressurePath);
  for (const note of content.states) {
    await select(page).selectOption(note.id);
    for (const selector of [
      '.resilience-heading h1',
      '.resilience-current h2',
      '.resilience-current p',
      '.resilience-anchors p',
      '.resilience-revision p',
      '.resilience-control label',
      '.resilience-control select',
      '.resilience-shared p',
      '.resilience-current summary',
      '.resilience-reading > summary',
    ])
      await measure(note.id, selector);
    await measure(note.id, '.resilience-control select', 'boundary');
    await measure(note.id, '.resilience-control select', 'focus');
    await measure(note.id, '.resilience-current summary', 'focus');
  }
  await page.goto('/read/resilience.html');
  for (const selector of [
    '.resilience-heading h1',
    '.resilience-lesson p',
    '.resilience-reading-note p',
    '.resilience-static nav a',
  ])
    await measure('static reading', selector);
  await measure('static reading', '.resilience-static nav a', 'focus');
  await writeFile(
    info.outputPath('resilience-contrast.json'),
    JSON.stringify(measurements, null, 2),
  );
});

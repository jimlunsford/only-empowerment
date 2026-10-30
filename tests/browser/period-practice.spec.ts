import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  practiceViews,
  practiceCopy as copy,
  communicationConditions,
  evidenceRecords,
  honestMessage,
  helpMessage,
} from '../../src/period-practice-content';
import { periodExercise } from '../../src/period-content';

const navigation = (page: Page) =>
  page.getByRole('navigation', { name: 'Practice Ownership views' });
const fits = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
async function switchView(page: Page, label: string) {
  await navigation(page).getByRole('link', { name: label, exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
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

test('direct views have safe defaults, a complete teaching order, and no personal inputs', async ({
  page,
}) => {
  for (const view of practiceViews) {
    await page.goto('/#' + view.path);
    await expect(page.locator('h1')).toHaveText(view.title);
    await expect(navigation(page).locator('[aria-current="page"]')).toHaveText(view.label);
    await expect(page.locator('.practice input, .practice textarea, .practice select')).toHaveCount(
      0,
    );
    await expect(page.locator('.practice .path li')).toHaveCount(6);
    await expect(page.locator('.practice .path a')).toHaveCount(1);
    await expect(page.locator('.practice .path a')).toHaveAttribute(
      'href',
      '#/period/values/ownership',
    );
    await expect(page.locator('.practice .path-note')).toContainText(
      'Teaching order, not completion.',
    );
    if (view.id !== 'connected-code')
      await expect(page.locator('.practice-context').first()).toContainText(
        communicationConditions.worked.context,
      );
    if (view.id === 'follow-through')
      await expect(page.locator('#practice-record-title')).toHaveText('Only promised');
    await axe(page);
  }
});

test('changing the fact carries through both responses and returning between views', async ({
  page,
}) => {
  await page.goto('/#/period/practice');
  const unavailable = page.getByRole('button', { name: 'Messaging was unavailable', exact: true });
  await unavailable.focus();
  await page.keyboard.press('Space');
  await expect(unavailable).toBeFocused();
  await expect(unavailable).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status')).toContainText(communicationConditions.unavailable.context);
  await expect(page.locator('.practice-body')).toContainText(
    communicationConditions.unavailable.situation,
  );
  await expect(page.locator('.practice-boundaries')).toContainText(
    communicationConditions.unavailable.own,
  );
  await switchView(page, 'Responses');
  await expect(page.locator('.practice-honest blockquote')).toHaveText(
    honestMessage('unavailable'),
  );
  await expect(page.locator('.practice-honest')).toContainText(
    communicationConditions.unavailable.explanation,
  );
  const help = page.locator('.practice-responses > details').last();
  await help.locator('summary').click();
  await expect(help.locator('blockquote')).toHaveText(helpMessage('unavailable'));
  await switchView(page, 'Follow-through');
  await expect(page.locator('.practice-body')).toContainText(copy.workedExample);
  await expect(page.locator('.practice-context').first()).toContainText(
    communicationConditions.unavailable.context,
  );
  await switchView(page, 'Situation');
  await page.getByRole('button', { name: 'Messaging worked', exact: true }).click();
  await switchView(page, 'Responses');
  await expect(page.locator('.practice-honest blockquote')).toHaveText(honestMessage('worked'));
  await expect(page.locator('.practice-honest')).toContainText(
    communicationConditions.worked.explanation,
  );
  await expect(page.locator('.practice-honest')).not.toContainText(
    communicationConditions.unavailable.acknowledgement,
  );
});

test('reflection precedes independently accessible comparisons and no response becomes a decision', async ({
  page,
}) => {
  await page.goto('/#/period/practice/responses');
  const details = page.locator('.practice-responses > details');
  for (const index of [0, 1, 3]) await expect(details.nth(index)).not.toHaveAttribute('open', '');
  await expect(details.nth(2)).toHaveAttribute('open', '');
  const prompt = await page.locator('.practice-reflection').boundingBox();
  const first = await details.first().boundingBox();
  expect(prompt!.y + prompt!.height).toBeLessThan(first!.y);
  await details.first().locator('summary').focus();
  await page.keyboard.press('Enter');
  await details.nth(1).locator('summary').click();
  await details.last().locator('summary').click();
  for (let index = 0; index < 4; index++)
    await expect(details.nth(index)).toHaveAttribute('open', '');
  for (const text of [
    copy.waiting.explanation,
    copy.overpromising.explanation,
    copy.help.explanation,
    copy.honestLimit,
  ])
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  await axe(page);
  await page.getByRole('link', { name: 'Inspect the follow-through' }).click();
  await expect(page.locator('.practice-body')).toContainText(copy.workedExample);
  await expect(page.locator('.practice-timeline')).toContainText(
    'Send the honest update and local completed section.',
  );
  await expect(page.locator('#practice-record-title')).toHaveText('Only promised');
});

test('all evidence records distinguish intention, conduct, and later repair; household agreement stays shared', async ({
  page,
}) => {
  await page.goto('/#/period/practice/follow-through');
  for (const record of Object.values(evidenceRecords)) {
    const button = page.getByRole('button', { name: record.label, exact: true });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.practice-evidence')).toContainText(record.record);
    await expect(page.locator('.practice-evidence')).toContainText(record.interpretation);
    await expect(page.getByRole('status')).toContainText(record.label);
  }
  await expect(page.locator('.practice-evidence')).toContainText(copy.repair);
  await page.locator('.practice-household > summary').click();
  await page.getByText(copy.household.disclosure, { exact: true }).click();
  for (const text of [
    copy.household.response,
    copy.household.explanation,
    copy.household.agreement,
  ])
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  await axe(page);
  await switchView(page, 'The connected Code');
  await switchView(page, 'Follow-through');
  await expect(page.locator('#practice-record-title')).toHaveText('Missed the next update');
  await page.reload();
  await expect(page.locator('#practice-record-title')).toHaveText('Only promised');
});

test('connected values are relationships, not lessons or completion; action precedes the optional card', async ({
  page,
}) => {
  await page.goto('/#/period/practice/connected-code');
  const rows = page.locator('.practice-connections li');
  await expect(rows.locator('h2')).toHaveText([
    'Ownership',
    'Purpose',
    'Resilience',
    'Integrity',
    'Discipline',
    'Empowerment',
  ]);
  for (const [index, value] of copy.relationships.entries()) {
    await expect(rows.nth(index)).toContainText(value.contribution);
    await expect(rows.nth(index)).toContainText(value.connection);
  }
  await expect(rows.locator('a, button, input')).toHaveCount(0);
  for (const text of [
    copy.connectedStandard,
    copy.connectedReturn,
    copy.empowermentLimit,
    copy.availability,
    copy.takeAction,
  ])
    await expect(page.getByText(text, { exact: true })).toBeVisible();
  expect(
    await page
      .locator('.practice-take-action')
      .evaluate(
        (e) =>
          !!(
            e.compareDocumentPosition(document.querySelector('.practice-optional')!) &
            Node.DOCUMENT_POSITION_FOLLOWING
          ),
      ),
  ).toBe(true);
  await page.getByRole('link', { name: copy.cardLabel }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('ownership');
  await expect(page.locator('#period-standard')).toHaveValue('');
});

test('browser Back and Forward restore the view and position without recording fictional facts', async ({
  page,
}) => {
  await page.goto('/#/period/practice');
  await page.getByRole('button', { name: 'Messaging was unavailable', exact: true }).click();
  const next = page.getByRole('link', { name: 'Compare responses', exact: true });
  await next.scrollIntoViewIfNeeded();
  await next.focus();
  const y = await page.evaluate(() => scrollY);
  await page.keyboard.press('Enter');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page.locator('h1')).toHaveText('Practice Ownership.');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
  await expect(
    page.getByRole('button', { name: 'Messaging was unavailable', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(page.locator('h1')).toHaveText('Compare the responses.');
  await expect(page.locator('.practice-honest blockquote')).toHaveText(
    honestMessage('unavailable'),
  );
  expect(await page.evaluate(() => Object.keys(history.state))).toEqual(['oeNavigation']);
});

test('practice leaves selected-only drafts and complete cards untouched, including copy, fallback and print', async ({
  page,
}) => {
  const standard = '  PRIVATE-WORK07 👩🏽‍💻 é <b>my words</b>\n  ';
  const application = '\nSend my update.  ';
  const correction = '  Ask for help.\nReturn. ';
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).copied = text;
        },
      },
    }),
  );
  await page.goto('/#/period/practice');
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('ownership');
  await page.reload();
  await page.locator('#period-valueId').selectOption('purpose');
  await page
    .locator('.site-header')
    .getByRole('link', { name: 'Practice Ownership', exact: true })
    .click();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('purpose');
  await page
    .locator('.site-header')
    .getByRole('link', { name: 'Practice Ownership', exact: true })
    .click();
  await switchView(page, 'The connected Code');
  await page.getByRole('link', { name: copy.cardLabel }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('purpose');
  await page.locator('#period-standard').fill(standard);
  await page.locator('#period-nextApplication').fill(application);
  await page.locator('.support summary').click();
  await page.locator('#period-returnPlan').fill(correction);
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await page
    .locator('.site-header')
    .getByRole('link', { name: 'Practice Ownership', exact: true })
    .click();
  await page.getByRole('button', { name: 'Messaging was unavailable', exact: true }).click();
  for (const view of practiceViews.slice(1)) {
    await switchView(page, view.label);
    await expect(page.getByRole('main')).not.toContainText('PRIVATE-WORK07');
  }
  await page.getByRole('link', { name: copy.cardLabel }).click();
  await expect(page.locator('#period-card-title')).toBeVisible();
  for (const [field, text] of [
    ['standard', standard],
    ['nextApplication', application],
    ['returnPlan', correction],
  ])
    expect(await page.locator(`[data-field="${field}"]`).textContent()).toBe(text);
  await expect(page.locator('.period-card')).toContainText(periodExercise.footnote);
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
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.period-card')).toContainText(periodExercise.footnote);
  await expect(page.locator('.period-card')).toBeVisible();
  await page.emulateMedia({ media: 'screen' });
  await page.getByRole('button', { name: 'Edit my card' }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('purpose');
  await expect(page.locator('#period-standard')).toHaveValue(standard);
});

test('fictional exploration and private card produce no requests, logs, URLs or persistent practice records', async ({
  page,
  context,
  baseURL,
}) => {
  const requests: string[] = [],
    logs: string[] = [];
  const marker = 'PRIVATE-PRACTICE-7824';
  page.on('request', (r) =>
    requests.push(
      JSON.stringify({
        url: r.url(),
        method: r.method(),
        headers: r.headers(),
        body: r.postData(),
      }),
    ),
  );
  page.on('console', (m) => logs.push(m.text()));
  page.on('pageerror', (e) => logs.push(e.message));
  await page.goto('/#/period/standard');
  await page.locator('#period-standard').fill(marker);
  await page
    .locator('.site-header')
    .getByRole('link', { name: 'Practice Ownership', exact: true })
    .click();
  await page.getByRole('button', { name: 'Messaging was unavailable', exact: true }).click();
  await switchView(page, 'Responses');
  for (const detail of await page.locator('.practice-responses > details').all())
    if (!(await detail.getAttribute('open'))) await detail.locator('summary').click();
  await switchView(page, 'Follow-through');
  for (const record of Object.values(evidenceRecords))
    await page.getByRole('button', { name: record.label, exact: true }).click();
  await switchView(page, 'The connected Code');
  await page.getByRole('link', { name: copy.cardLabel }).click();
  await expect(page.locator('#period-standard')).toHaveValue(marker);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => indexedDB.databases())).toEqual([]);
  expect(await page.evaluate(() => caches.keys())).toEqual([]);
  expect(
    await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length)),
  ).toBe(0);
  expect(await page.evaluate(() => JSON.stringify(history.state))).not.toContain(marker);
  expect(page.url()).not.toContain(marker);
  expect(logs.join(' ')).not.toContain(marker);
  expect(
    requests.every(
      (r) =>
        !r.includes(marker) &&
        JSON.parse(r).method === 'GET' &&
        new URL(JSON.parse(r).url).origin === new URL(baseURL!).origin,
    ),
  ).toBe(true);
});

test('essential practice teaching and all alternatives survive disabled JavaScript or a blocked app', async ({
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
    await page.goto(baseURL! + '/#/period/practice');
    const reading = page.getByRole('region', { name: 'Practice Ownership linear reading' });
    for (const text of [
      ...practiceViews.map((v) => v.title),
      ...Object.values(communicationConditions).map((c) => c.situation),
      ...Object.values(evidenceRecords).map((r) => r.interpretation),
      copy.household.agreement,
      copy.repair,
      copy.help.explanation,
      copy.takeAction,
      copy.connectedStandard,
      ...copy.relationships.flatMap((r) => [r.contribution, r.connection]),
    ])
      await expect(reading.getByText(text, { exact: true })).toBeVisible();
    await expect(reading.locator('input, textarea, button, details')).toHaveCount(0);
    await context.close();
  }
});

test('all views and representative alternatives reflow at four widths with review captures', async ({
  page,
}, info) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const view of practiceViews) {
      await page.goto('/#' + view.path);
      await page.reload(); // A fresh direct entry for each labelled baseline capture.
      await page.evaluate(() => document.fonts.ready);
      expect(await fits(page), `${view.id} ${width}`).toBe(true);
      for (const target of await page
        .locator(
          '.practice-nav a, .practice .path a, .practice button, .practice summary, .practice-optional a, .footer-meta > a[href="#/period/standard"]',
        )
        .all()) {
        const box = await target.boundingBox();
        if (box) {
          expect(box.width, `${view.id} target width at ${width}`).toBeGreaterThanOrEqual(44);
          expect(box.height, `${view.id} target height at ${width}`).toBeGreaterThanOrEqual(44);
        }
      }
      if (info.project.name === 'chromium' && [390, 1440].includes(width))
        await page.screenshot({ path: info.outputPath(`${view.id}-${width}.png`), fullPage: true });
      if (view.id === 'situation')
        await page.getByRole('button', { name: 'Messaging was unavailable', exact: true }).click();
      if (view.id === 'responses') {
        await switchView(page, 'Situation');
        await page.getByRole('button', { name: 'Messaging was unavailable', exact: true }).click();
        await switchView(page, 'Responses');
        for (const detail of await page.locator('.practice-responses > details').all())
          await detail.evaluate((e: HTMLDetailsElement) => {
            e.open = true;
          });
      }
      if (view.id === 'follow-through') {
        await page.getByRole('button', { name: 'Followed through', exact: true }).click();
        if (info.project.name === 'chromium' && [390, 1440].includes(width))
          await page.screenshot({
            path: info.outputPath(`follow-through-followed-${width}.png`),
            fullPage: true,
          });
        await page.getByRole('button', { name: 'Missed the next update', exact: true }).click();
        await page.locator('.practice-household > summary').click();
        await page.getByText(copy.household.disclosure, { exact: true }).click();
      }
      expect(await fits(page), `${view.id} alternate ${width}`).toBe(true);
      if (
        info.project.name === 'chromium' &&
        [390, 1440].includes(width) &&
        view.id !== 'connected-code'
      )
        await page.screenshot({
          path: info.outputPath(`${view.id}-alternate-${width}.png`),
          fullPage: true,
        });
    }
  }
});

test('practice reflows with unavailable fonts, 200 percent text, spacing, and 400 percent viewport equivalent', async ({
  browser,
  baseURL,
}) => {
  // 320 CSS pixels at scale 4 represents 1280 / 400%; native browser UI zoom is a manual review gate.
  const context = await browser.newContext({
    viewport: { width: 320, height: 900 },
    deviceScaleFactor: 4,
    reducedMotion: 'reduce',
    forcedColors: 'active',
  });
  await context.route('**/*.woff2', (route) => route.abort());
  const page = await context.newPage();
  for (const view of practiceViews) {
    await page.goto(baseURL! + '/#' + view.path);
    await page.reload(); // Discard the previous view's synthetic user-style overrides.
    await page.evaluate(() => document.fonts.ready);
    expect(await fits(page)).toBe(true);
    if (view.id === 'situation')
      await page.getByRole('button', { name: 'Messaging was unavailable', exact: true }).click();
    if (view.id === 'responses')
      for (const detail of await page.locator('.practice-responses > details').all())
        await detail.evaluate((e: HTMLDetailsElement) => {
          e.open = true;
        });
    if (view.id === 'follow-through') {
      await page.getByRole('button', { name: 'Missed the next update', exact: true }).click();
      await page.locator('.practice-household > summary').click();
      await page.getByText(copy.household.disclosure, { exact: true }).click();
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    await page.evaluate(() => {
      // Emulate a user style override through properties. Keep the app's CSP intact.
      document.querySelectorAll<HTMLElement>('.period-shell *').forEach((element) => {
        element.style.setProperty('line-height', '1.5', 'important');
        element.style.setProperty('letter-spacing', '.12em', 'important');
        element.style.setProperty('word-spacing', '.16em', 'important');
        if (element.tagName === 'P') element.style.setProperty('margin-bottom', '2em', 'important');
      });
    });
    expect(await fits(page), view.id).toBe(true);
    await expect(
      navigation(page).getByRole('link', { name: view.label, exact: true }),
    ).toBeVisible();
  }
  await context.close();
});

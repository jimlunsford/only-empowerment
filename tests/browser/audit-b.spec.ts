import { expectReadingNavigation } from './helpers/reading-navigation';
import { test, expect, type Page } from '@playwright/test';
import { eventCarry, workshopById, workshopScreens } from '../../src/execution-workshop-content';
import { loopScenario } from '../../src/loop-practice-content';

const scenario = (page: Page) => page.locator('.loop-scenario');
const workshop = (page: Page) => page.locator('.execution-screen');
const continueWorkshop = (page: Page) =>
  workshop(page)
    .locator('.workshop-navigation')
    .getByRole('link', { name: /^Continue/ })
    .click();

test('B1: exhausted correction includes care before completion; available capacity changes explicitly', async ({
  page,
}) => {
  await page.goto('/#/loop/practice');
  for (const choice of [3, 2, 1, 0]) await page.locator('.loop-choices button').nth(choice).click();
  await expect(scenario(page)).toHaveAttribute('data-state', 'correction');
  const paragraphs = await scenario(page).locator(':scope > p').allTextContents();
  expect(paragraphs[0]).toContain('you protect that rest first');
  expect(paragraphs[0]).toContain('agreed help or a later return when able');
  expect(paragraphs[0]).toContain('The task stays open until');
  expect(paragraphs[1]).toContain('The kitchen is usable again');
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  for (const choice of [2, 0]) await page.locator('.loop-choices button').nth(choice).click();
  await expect(scenario(page)).toContainText('even though capacity was available');
  await expect(
    page.getByRole('button', {
      name: 'Capacity is limited; arrange help or a return',
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole('button', {
      name: 'Explore changed conditions: too little sleep now limits capacity',
      exact: true,
    })
    .click();
  await expect(scenario(page)).toHaveAttribute('data-state', 'rest');
  await expect(scenario(page)).toContainText(
    'arrange help or a realistic return that fits your capacity',
  );
  for (const path of ['/read/loop.html', '/read/loop-practice.html']) {
    await page.goto(path);
    for (const text of loopScenario.states.correction.body)
      await expect(page.locator('#loop-state-correction')).toContainText(text);
    await expect(page.locator('#loop-state-restart')).toContainText(
      'Explore changed conditions: too little sleep now limits capacity',
    );
  }
});

for (const first of workshopById('event').options!) {
  test(`B2/B3: ${first.id} history stays accurate across every second decision and comparison`, async ({
    page,
  }) => {
    for (const second of workshopById('event-wait').options!) {
      await page.goto('/#/execution/event');
      await workshop(page).getByRole('button', { name: first.label, exact: true }).click();
      await continueWorkshop(page);
      await expect(workshop(page)).toContainText(eventCarry({ event: first.id }));
      await expect(workshop(page)).not.toContainText('before involving the organizer');
      await expect(workshop(page)).not.toContainText('owner again');
      await workshop(page).getByRole('button', { name: second.label, exact: true }).click();
      await workshop(page)
        .getByRole('link', { name: 'Skip practice and compare the reasoning now' })
        .click();
      for (const [index, option] of [first, second].entries()) {
        const review = page.locator('.workshop-review').nth(index);
        await expect(review).toContainText(option.label);
        await expect(review).toContainText(option.consequence);
        await expect(review).toContainText(option.reasoning);
      }
    }
    await page.goto('/read/execution.html');
    for (const option of [first, ...workshopById('event-wait').options!]) {
      await expect(page.locator('main')).toContainText(option.label);
      await expect(page.locator('main')).toContainText(option.consequence);
    }
  });
}

test('B4: restart confirmation survives every non-welcome route and clears on the next navigation', async ({
  page,
}) => {
  test.setTimeout(90000);
  const confirmation =
    'Workshop restarted. Previous choices and open explanations have been cleared.';
  for (const screen of workshopScreens.filter((screen) => screen.id !== 'welcome')) {
    await page.goto('/#/execution/' + screen.id);
    if (screen.options)
      await workshop(page)
        .getByRole('button', { name: screen.options[0].label, exact: true })
        .click();
    await page.getByRole('button', { name: 'Restart workshop', exact: true }).click();
    await expect(workshop(page)).toHaveAttribute('data-workshop', 'welcome');
    await expect(workshop(page).locator('h1')).toBeFocused();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect(page.locator('.workshop-status')).toHaveText(confirmation);
    await continueWorkshop(page);
    await expect(page.locator('.workshop-status')).toBeEmpty();
  }
});

test('B4: reading in a new tab retains choices and the disclosure says so', async ({
  page,
  context,
}) => {
  await page.goto('/#/execution/event');
  const option = workshopById('event').options![1];
  await workshop(page).getByRole('button', { name: option.label, exact: true }).click();
  await page.locator('.workshop-session summary').click();
  await expect(page.locator('.workshop-session')).toContainText(
    'Opening the reading edition in a new tab preserves your active workshop choices.',
  );
  const popup = context.waitForEvent('page');
  await workshop(page)
    .getByRole('link', { name: 'Complete reading and print edition (new tab)', exact: true })
    .click();
  const reading = await popup;
  await reading.waitForLoadState();
  await expect(reading).toHaveURL(/\/read\/execution.html$/);
  await expect(workshop(page).locator('[aria-pressed="true"]')).toHaveAttribute(
    'aria-label',
    option.label,
  );
  await reading.close();
  await page.getByRole('button', { name: 'Restart workshop', exact: true }).click();
  await workshop(page).getByRole('link', { name: 'Work independently', exact: true }).click();
  await expect(workshop(page).locator('[aria-pressed="true"]')).toHaveCount(0);
});

for (const width of [320, 390, 768, 1440]) {
  test(`B5: cold-font cross-reading anchors retain focus and viewport alignment at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/fonts/*.woff2', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.continue();
    });
    const checkTarget = async (reader = page) => {
      await reader.evaluate(() => document.fonts.ready);
      await reader.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      const target = reader.locator(':target');
      const heading = await target.evaluate((element) =>
        element.matches('h1,h2,h3,h4') ? element.id : element.querySelector('h1,h2,h3,h4')?.id,
      );
      const visibleTarget = heading ? reader.locator('[id="' + heading + '"]') : target;
      await expect(visibleTarget).toBeInViewport();
      const geometry = await visibleTarget.boundingBox();
      expect(geometry!.y).toBeGreaterThanOrEqual(-1);
      expect(geometry!.y + geometry!.height).toBeLessThanOrEqual(901);
      // Native fragment focus must remain on the heading or its target wrapper.
      expect(
        await target.evaluate(
          (element) =>
            element === document.activeElement ||
            element.contains(document.activeElement) ||
            !!(
              document.activeElement?.matches('h1,h2,h3,h4,h5,h6') &&
              document.activeElement.contains(element)
            ),
        ),
      ).toBe(true);
    };
    for (const href of [
      '/read/loop.html#part-2',
      '/read/loop.html#part-3',
      '/read/loop.html#part-4',
      '/read/loop.html#part-5',
      '/read/loop.html#restart',
      '/read/execution.html#negotiation',
      '/read/execution.html#miss',
    ]) {
      await page.goto('/read/rebuild.html');
      // Finish source-page font layout before pointer activation. Destination
      // fonts remain delayed, and the focus/viewport assertions stay unchanged.
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      await page.locator(`a[href="${href}"]`).first().click();
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      await checkTarget();
      await page.reload();
      await checkTarget();
    }
    // Existing cross-document entry to the Discipline comparison.
    await page.goto('/#/period/discipline/pattern');
    const disciplineLink = page.locator('a[href="/read/discipline.html#comparison"]').first();
    await expect(disciplineLink).toHaveCount(1);
    const popup = page.waitForEvent('popup');
    await disciplineLink.click();
    const disciplineReading = await popup;
    await disciplineReading.waitForLoadState();
    await checkTarget(disciplineReading);
    await disciplineReading.close();
    for (const section of ['continue', 'transfer']) {
      await page.goto('/read/execution.html');
      await page.locator(`a[href="/read/execution.html#${section}"]`).first().click();
      await checkTarget();
    }
  });
}

test('B6: miss entry normalizes after a choice without losing the choice or adding history', async ({
  page,
}) => {
  await page.goto('/#/loop/practice?state=miss');
  const historyLength = await page.evaluate(() => history.length);
  await page
    .getByRole('button', { name: 'Tell the truth and locate the break', exact: true })
    .click();
  await expect(page).toHaveURL(/#\/loop\/practice$/);
  await expect(scenario(page)).toHaveAttribute('data-state', 'restart');
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
  await page.getByRole('button', { name: 'Previous choice', exact: true }).click();
  await expect(scenario(page)).toHaveAttribute('data-state', 'miss');
  await expect(page).toHaveURL(/#\/loop\/practice$/);
  await page.getByRole('link', { name: 'Read or print every outcome', exact: true }).click();
  await page.goBack();
  await expect(scenario(page)).toHaveAttribute('data-state', 'pressure');
  await page.reload();
  await expect(scenario(page)).toHaveAttribute('data-state', 'pressure');
  await page
    .getByRole('button', { name: 'Clear one usable space, then stop', exact: true })
    .click();
  await page.getByRole('button', { name: 'Reset example', exact: true }).click();
  await expect(scenario(page)).toHaveAttribute('data-state', 'pressure');
});

test('B6: homepage prints its actual headings, introduction and four framework choices', async ({
  page,
}) => {
  await page.goto('/');
  const heading = await page.locator('main h1').textContent();
  const introduction = await page.locator('.framework-hub-intro').textContent();
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('main h1')).toHaveText(heading!);
  await expect(page.locator('.framework-hub-intro')).toBeVisible();
  await expect(page.locator('.framework-hub-intro')).toHaveText(introduction!);
  for (const article of await page.locator('.framework-options article').all())
    await expect(article).toBeVisible();
  await expect(page.locator('.framework-options article')).toHaveCount(4);
});

test('B6: Escape closes the mobile menu and returns focus from inside or outside it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  const menu = page.locator('.site-menu');
  for (const route of ['/', '/read/loop.html', '/read/rebuild.html', '/read/execution.html']) {
    await page.goto(route);
    for (const outside of [false, true]) {
      await menu.locator('summary').click();
      if (outside) {
        await page.locator('.wordmark').focus();
        await expect(page.locator('.wordmark')).toBeFocused();
      } else await menu.locator('a').first().focus();
      await page.keyboard.press('Escape');
      await expect(menu).not.toHaveAttribute('open', '');
      await expect(menu.locator('summary')).toBeFocused();
    }
  }
});

test('B6: every generated reading declares the SVG favicon without an ico request', async ({
  page,
}) => {
  const icoRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/favicon.ico') icoRequests.push(request.url());
  });
  for (const reading of [
    'index',
    'ownership',
    'purpose',
    'resilience',
    'integrity',
    'discipline',
    'empowerment',
    'standard',
    'rebuild',
    'loop',
    'loop-practice',
    'execution',
    'privacy',
  ]) {
    await page.goto('/read/' + reading + '.html');
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
    await expectReadingNavigation(page);
    await expect(page.locator('script:not([src="/read/navigation.js"])')).toHaveCount(0);
  }
  expect(icoRequests).toEqual([]);
});

for (const width of [320, 390, 768, 1440]) {
  test(`B5: reading anchors and complete teaching remain usable without JavaScript at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/read/rebuild.html');
    await page.locator('a[href="/read/loop.html#part-3"]').first().click();
    await expect(page.locator('#part-3')).toBeInViewport();
    await expect(page.locator('#part-3')).toBeFocused();
    await expect(page.locator('#loop-state-correction')).toContainText(
      'you protect that rest first',
    );
    await page.goto('/read/discipline.html#comparison');
    await expect(page.locator('#comparison')).toBeInViewport();
    for (const id of ['negotiation', 'miss', 'continue', 'transfer']) {
      await page.goto('/read/execution.html#' + id);
      await expect(page.locator(':target')).toBeInViewport();
    }
    await context.close();
  });
}

test('B5: layout settling realigns a focused heading and later reader input cancels pending alignment', async ({
  page,
}) => {
  // Delay a same-origin stylesheet until after native fragment focus. This fixture
  // produces a deterministic late reflow instead of relying on a font-cache race.
  for (const readerTakesControl of [false, true]) {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/read/late-layout.css', async (route) => {
      await held;
      await route.fulfill({
        contentType: 'text/css',
        body: '#part-3 { margin-top: 1200px !important; }',
      });
    });
    await page.addInitScript(() => {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/read/late-layout.css';
          document.head.append(link);
        },
        { once: true },
      );
    });
    await page.goto('/read/loop.html#part-3', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#part-3')).toBeFocused();
    if (readerTakesControl) {
      await page.keyboard.press('Home');
      await page.locator('.wordmark').focus();
      await page.evaluate(() => {
        const originalFocus = HTMLElement.prototype.focus;
        const calls: string[] = [];
        (window as any).readingFocusCalls = calls;
        HTMLElement.prototype.focus = function (...args) {
          calls.push(this.id || this.className);
          originalFocus.apply(this, args);
        };
      });
    }
    release();
    await page.waitForLoadState('load');
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    // WebKit may restore native fragment focus at load. The enhancement itself
    // must not issue another focus request after the reader takes control.
    if (readerTakesControl)
      expect(await page.evaluate(() => (window as any).readingFocusCalls)).toEqual([]);
    else {
      await expect(page.locator('#part-3')).toBeFocused();
      await expect(page.locator('#part-3')).toBeInViewport();
    }
    await page.unroute('**/read/late-layout.css');
  }
});

test('B5: reading skip links retain main-region focus', async ({ page }) => {
  for (const path of ['/read/loop.html', '/read/rebuild.html', '/read/execution.html']) {
    await page.goto(path);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  }
});

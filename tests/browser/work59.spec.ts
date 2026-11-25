import { test, expect } from '@playwright/test';

const stations = ['line', 'structure', 'return', 'trust', 'negotiation', 'help'];

test('Back restores both reading viewports after scrolling a lesson activity', async ({ page }) => {
  await page.goto('/#/period/values/resilience');
  const invitation = page.locator('.resilience-invitation a');
  await invitation.scrollIntoViewIfNeeded();
  await invitation.focus();
  const position = () => page.evaluate(() => [scrollY, visualViewport!.pageTop]);
  const lessonPosition = await position();
  await invitation.press('Enter');
  const choice = page.getByRole('combobox');
  await choice.selectOption('harm');
  await page.evaluate(() => scrollTo(0, 700));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(700);
  const activityPosition = await position();

  await page.goBack();
  await expect(page.locator('#app h1')).toBeFocused();
  await expect.poll(position).toEqual(lessonPosition);
  await page.goForward();
  await expect(choice).toHaveValue('slow');
  await expect.poll(position).toEqual(activityPosition);
});

test('Line choices have portable URLs that restore one exact selected note', async ({
  page,
  context,
  baseURL,
}) => {
  await page.goto('/#/rebuild/line');
  await expect(page.locator('.quotesheet [aria-current="true"]')).toHaveCount(1);
  for (const n of [2, 3, 4, 1]) {
    const href = '#/rebuild/line?section=note-' + n;
    const choice = page.locator('.quotesheet .q' + n);
    await expect(choice).toHaveAttribute('href', href);
    await choice.click();
    await expect(page).toHaveURL((url) => url.hash === href);
    await expect(page.locator('.quotesheet [aria-current="true"]')).toHaveCount(1);
    await expect(choice).toHaveAttribute('aria-current', 'true');
    await expect(page.locator('#note-' + n)).toBeFocused();
    await page.reload();
    await expect(page).toHaveURL((url) => url.hash === href);
    await expect(page.locator('#note-' + n)).toBeFocused();
    const tab = await context.newPage();
    try {
      await tab.goto(baseURL + '/' + href);
      await expect(tab.locator('.quotesheet .q' + n)).toHaveAttribute('aria-current', 'true');
      await expect(tab.locator('#note-' + n)).toBeFocused();
    } finally {
      await tab.close();
    }
  }
  await page.goBack();
  await expect(page.locator('.quotesheet [aria-current="true"]')).toHaveCount(1);
  await expect(page.locator('.q4')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('#note-4')).toBeVisible();
  await page.goForward();
  await expect(page.locator('.q1')).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('#note-1')).toBeVisible();
});

test('all six Rebuild stations expose portable in-page example and application anchors', async ({
  page,
  context,
  baseURL,
}) => {
  for (const station of stations) {
    await page.goto('/#/rebuild/' + station);
    for (const section of ['example', 'apply']) {
      const href = '#/rebuild/' + station + '?section=' + section;
      const link = page.locator('.rebuild-guide a[href="' + href + '"]').first();
      await expect(link).toHaveCount(1);
      const fresh = await context.newPage();
      try {
        await fresh.goto(baseURL + '/' + href);
        await expect(fresh.locator('.rebuild-guide #' + section)).toBeFocused();
        await expect(fresh.locator('.rebuild-guide #' + section)).toBeInViewport();
      } finally {
        await fresh.close();
      }
    }
  }
});

test('unknown Rebuild routes recover to their framework without retired-tool messaging', async ({
  page,
}) => {
  await page.goto('/#/rebuild/not-a-lesson');
  await expect(page.locator('#app h1')).toHaveText('That page is not here.');
  await expect(page.locator('#app main')).toContainText('Return to How to Rebuild Yourself');
  await expect(page.locator('#app main')).not.toContainText('earlier tools');
  await page.getByRole('link', { name: 'Return to How to Rebuild Yourself' }).click();
  await expect(page).toHaveURL((url) => url.hash === '#/rebuild');
  await page.goto('/#/tools/reset');
  await expect(page.locator('main')).toContainText('have been retired');
});

test('all framework links remain available inside PERIOD while the local teaching links stay', async ({
  page,
}) => {
  for (const route of ['/period', '/period/values/ownership', '/period/discipline/pattern']) {
    await page.goto('/#' + route);
    const global = page.getByRole('navigation', { name: 'Framework navigation' });
    await expect(global.getByRole('link')).toHaveText([
      'Frameworks',
      'The PERIOD Code',
      'How to Rebuild Yourself',
      'The Discipline Loop',
    ]);
    const local = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(local.getByRole('link')).toHaveText(['Why PERIOD?', 'Explore the values']);
    await expect(
      page.getByRole('contentinfo').getByRole('navigation', { name: 'About this site' }),
    ).toContainText('How to Rebuild Yourself');
    await global.getByRole('link', { name: 'How to Rebuild Yourself' }).click();
    await expect(page).toHaveURL((url) => url.hash === '#/rebuild');
  }
});

test('static reading index, both first lessons, Rebuild and paper aid exist without scripts', async ({
  browser,
  request,
}) => {
  for (const route of [
    '/read/index.html',
    '/read/ownership.html',
    '/read/purpose.html',
    '/read/standard.html',
    '/read/rebuild.html',
    '/read/rebuild.css',
  ]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const p = await context.newPage();
    await p.goto('/read/index.html');
    await expect(p.getByRole('link', { name: 'Ownership, including practice' })).toBeVisible();
    await expect(
      p.getByRole('link', { name: 'Purpose, including the evening comparison' }),
    ).toBeVisible();
    await expect(p.getByRole('link', { name: /Read or print the complete guide/ })).toBeVisible();
    await p.goto('/read/rebuild.html');
    await expect(p.locator('#rebuild-reading .all-module')).toHaveCount(7);
    await expect(p.locator('#rebuild-reading .flatstate')).toHaveCount(22);
    const returnLink = p.getByRole('link', { name: 'Return to the example' }).first();
    await expect(returnLink).toHaveAttribute('href', '#line-example');
    await p.goto('/read/standard.html');
    await expect(p.locator('main')).toContainText('Example standard card');
    await expect(p.locator('main textarea, main input, main button')).toHaveCount(0);
    await p.goto('/read/privacy.html');
    await expect(p.getByRole('link', { name: 'Open the complete reading index' })).toHaveAttribute(
      'href',
      '/read/index.html',
    );
    await expect(
      p.getByRole('link', { name: 'Read or print the paper Standard Card instructions' }),
    ).toHaveAttribute('href', '/read/standard.html');
  } finally {
    await context.close();
  }
});

test('script-disabled deep links reach their native lesson position', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    for (const [route, lesson] of [
      ['#/rebuild/trust', 'trust'],
      ['#/rebuild/line', 'line'],
    ]) {
      await page.goto(baseURL + '/' + route);
      // The route alias has no dimensions. Verify the actual teaching, not the
      // zero-height anchor, is aligned and legible in the reader's viewport.
      const article = page.locator('#rebuild-reading article#' + lesson);
      await expect(article).toBeInViewport();
      const top = await article.evaluate((el) => el.getBoundingClientRect().top);
      expect(top).toBeGreaterThanOrEqual(-1);
      expect(top).toBeLessThan(50);
    }
    await page.goto(baseURL + '/#/period/values/integrity');
    const integrity = page
      .locator('.period-sequence li')
      .filter({ has: page.locator('[id="/period/values/integrity"]') })
      .getByRole('link', { name: 'Integrity' });
    await expect(integrity).toBeInViewport();
    await expect(integrity).toHaveAttribute('href', '/read/integrity.html');
  } finally {
    await context.close();
  }
});

test('standalone no-JavaScript rebuilding PDF prints only the intended framework', async ({
  browser,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Chromium verifies PDF rendering');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await ctx.newPage();
    await page.goto('/read/rebuild.html');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#rebuild-reading .flatstate:visible')).toHaveCount(22);
    await expect(page.locator('.homepage')).toHaveCount(0);
    await expect(page.locator('.period-learning')).toHaveCount(0);
    for (const [edition, path] of [
      ['standalone', '/read/rebuild.html'],
      ['native-target', '/#/rebuild/trust?section=example'],
    ]) {
      await page.goto(path);
      await expect(page.locator('#rebuild-reading .flatstate:visible')).toHaveCount(22);
      await expect(page.locator('.period-learning:visible')).toHaveCount(0);
      await expect(
        page.getByText('Based on How to Rebuild Yourself by Jim Lunsford.', { exact: false }),
      ).toBeVisible();
      for (const format of ['A4', 'Letter'] as const)
        await page.pdf({
          path: info.outputPath('work59-rebuild-only-' + edition + '-' + format + '.pdf'),
          format,
          printBackground: true,
        });
    }
  } finally {
    await ctx.close();
  }
});

for (const mode of ['disabled', 'blocked'] as const) {
  test(`copied Rebuild sections reach the intended native content with scripts ${mode}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: mode !== 'disabled',
      viewport: { width: 390, height: 844 },
    });
    if (mode === 'blocked') await context.route('**/*.js', (route) => route.abort());
    try {
      const page = await context.newPage();
      const cases = [
        ['line?section=note-2', 'The line'],
        ['index?section=order', 'The rebuilding order'],
        ['index?section=destinations', 'Find your starting point'],
        ['complete?section=structure-example', ''],
        ['end', 'Build a Life You Do Not Want to Escape'],
      ];
      for (const lesson of stations) {
        cases.push([lesson + '?section=example', ''], [lesson + '?section=apply', '']);
      }
      for (const [section, text] of cases) {
        await page.goto(baseURL + '/#/rebuild/' + section);
        const target = page.locator(':target');
        await expect(target).toHaveAttribute('id', '/rebuild/' + section);
        await expect(target).toBeInViewport();
        if (text) await expect(target).toContainText(text);
        if (section.endsWith('?section=apply')) await expect(target).toHaveClass('take');
        if (section.endsWith('?section=example'))
          await expect(target).toHaveText(
            await page.locator('#' + section.split('?')[0] + '-example').innerText(),
          );
      }
      await page.reload();
      await expect(page.locator(':target')).toBeInViewport();
      await page.emulateMedia({ media: 'print' });
      for (const fragment of [
        '#/rebuild/trust?section=example',
        '#rebuild-reading',
        '#line-example',
      ]) {
        await page.goto(baseURL + '/' + fragment);
        await expect(page.locator('.homepage')).toBeHidden();
        await expect(page.locator('.standard-paper-reading')).toBeHidden();
        await expect(page.locator('.rebuild-print-credit')).toBeVisible();
        await expect(page.locator('.combined-print-credit')).toBeHidden();
        await expect(page.locator('#rebuild-reading .flatstate:visible')).toHaveCount(22);
      }
      await page.goto(baseURL + '/');
      await expect(page.locator('.homepage')).toBeVisible();
      await expect(page.locator('.combined-print-credit')).toBeVisible();
      await expect(page.locator('.rebuild-print-credit')).toBeHidden();
      await page.emulateMedia({ media: 'screen' });
      const headerLink = page
        .getByRole('banner')
        .getByRole('link', { name: 'How to Rebuild Yourself' });
      await headerLink.press('Enter');
      await expect(page).toHaveURL(/\/read\/rebuild\.html$/);
    } finally {
      await context.close();
    }
  });
}

test('the legacy paper address leads with instructions and offers a printable guide, with the editor available', async ({
  page,
}) => {
  await page.goto('/read/integrity.html');
  const legacy = page.getByRole('link', { name: 'Use the standard on paper', exact: true });
  await legacy.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Use the standard on paper');
  await expect(page.locator('main')).toContainText('choose a value, write one standard');
  await expect(page.locator('#period-valueId')).toBeVisible();
  const opened = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Read or print the paper guide (new tab)' }).press('Enter');
  const guide = await opened;
  await expect(guide).toHaveURL(/\/read\/standard\.html$/);
  await guide.emulateMedia({ media: 'print' });
  await expect(guide.getByText('Example standard card', { exact: true })).toBeVisible();
  await guide.close();
  await expect(page).toHaveURL(/#reading-standard-card$/);
});

test('the three new reading links open separate tabs and preserve the active Card draft', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-standard').fill('Fictional reading navigation check');
  for (const [route, file] of [
    ['/period', 'index'],
    ['/period/values/ownership', 'ownership'],
    ['/period/values/purpose', 'purpose'],
  ]) {
    await page.goto('/#' + route);
    const link = page.locator('#app main a[href="/read/' + file + '.html"]');
    await expect(link).toContainText('(new tab)');
    const opened = page.waitForEvent('popup');
    await link.press('Enter');
    const reading = await opened;
    await expect(reading.locator('main h1')).toBeVisible();
    expect(await reading.evaluate(() => opener)).toBeNull();
    await reading.close();
    await expect(page).toHaveURL((url) => url.hash === '#' + route);
  }
  await page.getByRole('contentinfo').getByRole('link', { name: 'Optional Standard Card' }).click();
  await expect(page.locator('#period-standard')).toHaveValue('Fictional reading navigation check');
});

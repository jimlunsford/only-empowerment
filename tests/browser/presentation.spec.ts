import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const catalog = [
  ['decision-room', 'Decision Room'],
  ['next-move', 'Next Move'],
  ['build-a-standard', 'Build a Standard'],
  ['reset', 'Reset'],
  ['rebuild-map', 'Rebuild Map'],
  ['do-it-now', 'Do It Now'],
];

test('presentation mode keeps six tools available with the correct banner, indexing and privacy', async ({
  page,
  request,
}) => {
  const mode = (await (await request.get('/build.json')).json()).presentation;
  expect(mode).toBe(process.env.OE_PRESENTATION ?? 'staging');
  const staging = mode === 'staging';
  await page.goto('/');
  await expect(page.locator('.staging-banner')).toHaveCount(staging ? 1 : 0);
  if (staging)
    await expect(page.locator('.staging-banner')).toContainText('Not a production release.');
  else await expect(page.locator('body')).not.toContainText('Not a production release');
  await expect(page.locator('.privacy-line')).toHaveText(
    'No account. No tracking of what you enter. No answer collection.',
  );
  await expect(page.locator('.bottom-band')).toContainText(
    'What you enter into the tools is not sent to analytics.',
  );
  await expect(page.locator('.tools-section')).toContainText('Do It Now are available.');
  await expect(page.locator('.tool-card')).toHaveCount(6);
  for (const [id, name] of catalog) {
    await expect(page.locator(`.tool-card[href="#/tools/${id}"]`)).toContainText(name);
  }
  await expect(page.locator('a[href="#/preview"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    staging ? 'noindex, nofollow' : 'index, follow',
  );
  expect(await (await request.get('/robots.txt')).text()).toBe(
    staging ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n',
  );
  await page.getByRole('link', { name: 'Privacy & source', exact: true }).first().click();
  await expect(page.locator('h1')).toHaveText('Your answers are not ours to collect.');
  const privacy = await page.locator('main').innerText();
  expect(privacy).toContain('Retention depends on the host, provider, and backup policies');
  expect(privacy.includes('14 rotated logs')).toBe(staging);
  expect(privacy).toContain('no server recovery, cross-device sync, or transfer between sites');
  expect(privacy).not.toContain('interaction preview');
  await expect(
    page.getByRole('heading', { name: 'Analytics and tracking boundaries', exact: true }),
  ).toBeVisible();
  expect(privacy).toContain('Only Empowerment will use Google Analytics on the production site');
  expect(privacy).toContain(
    staging
      ? 'Google Analytics is not enabled on this development staging site.'
      : 'Google Analytics is not enabled in this build.',
  );
  expect(privacy).toContain('What you enter into the tools is not sent to Google Analytics.');
  expect(privacy).toContain(
    'Tool answers, Saved Work, artifact contents, copied text, and other user-authored private data are excluded.',
  );
  expect(privacy).not.toMatch(/No trackers|No accounts or analytics|never uses analytics/i);

  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('no-JavaScript presentation describes all six tools and only staging identifies a review build', async ({
  browser,
  baseURL,
  request,
}) => {
  const staging = (await (await request.get('/build.json')).json()).presentation === 'staging';
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL!);
    await expect(
      page.getByRole('heading', { name: 'Only Empowerment', exact: true }),
    ).toBeVisible();
    for (const [, name] of catalog) await expect(page.getByRole('main')).toContainText(name);
    await expect(page.getByRole('main')).toContainText('available with JavaScript enabled');
    const text = await page.getByRole('main').innerText();
    expect(text.includes('Not a production release')).toBe(staging);
    expect(text).not.toMatch(/staging candidate|other tools are in development/);
  } finally {
    await context.close();
  }
});

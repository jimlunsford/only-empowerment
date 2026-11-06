import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const values = ['Ownership', 'Purpose', 'Resilience', 'Integrity', 'Discipline', 'Empowerment'];

test('presentation mode keeps six lessons available with the correct banner, indexing and privacy', async ({
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
  await expect(page.getByRole('heading', { name: 'Put your values into practice.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why PERIOD?', exact: true })).toBeVisible();
  for (const name of values)
    await expect(
      page
        .getByRole('navigation', { name: 'PERIOD teaching order' })
        .getByRole('link', { name, exact: true }),
    ).toBeVisible();
  await expect(
    page.locator('a[href^="#/tools"], a[href="#/saved"], a[href="#/approach"]'),
  ).toHaveCount(0);
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
  expect(privacy).toContain(
    'Production is planned to use minimal aggregate site and product usage analytics.',
  );
  expect(privacy).toContain('Google Analytics is not enabled in this build.');
  expect(privacy).toContain(
    'Standard Card text and residual legacy records are not sent to Google Analytics.',
  );
  expect(privacy).toContain(
    'Written answers, artifact contents, copied text, and other user-authored private data are excluded.',
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

test('no-JavaScript presentation describes all six lessons and only staging identifies a review build', async ({
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
    for (const name of values) await expect(page.getByRole('main')).toContainText(name);
    await expect(page.getByRole('main')).toContainText('Earlier tools and Saved work are retired');
    const text = await page.getByRole('main').innerText();
    expect(text.includes('Not a production release')).toBe(staging);
    expect(text).not.toMatch(/staging candidate|other tools are in development/);
  } finally {
    await context.close();
  }
});

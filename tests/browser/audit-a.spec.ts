import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('branded 404 works without JavaScript, broken assets or mobile overflow', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  const failures: string[] = [];
  page.on('requestfailed', (request) => failures.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/404.html');
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to the homepage' })).toHaveAttribute(
      'href',
      '/',
    );
    await expect(page.getByRole('link', { name: 'Browse all static readings' })).toHaveAttribute(
      'href',
      '/read/index.html',
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      await page.evaluate(
        () =>
          document.fonts.check('16px "Source Serif"') && document.fonts.check('16px "Source Sans"'),
      ),
    ).toBe(true);
  }
  await page.getByRole('link', { name: 'Browse all static readings' }).click();
  await expect(page).toHaveURL(/\/read\/index\.html$/);
  await page.goto('/404.html');
  await page.getByRole('link', { name: 'Go to the homepage' }).click();
  await expect(page).toHaveURL(`${baseURL}/`);
  expect(failures).toEqual([]);
  await context.close();
});

test('branded 404 has accessible structure and visible keyboard links', async ({ page }) => {
  await page.goto('/404.html');
  await page.evaluate(() => document.fonts.ready);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const forcedColors of ['none', 'active'] as const) {
    await page.emulateMedia({ forcedColors });
    await page.reload();
    await page.keyboard.press('Tab');
    const brand = page.getByRole('link', { name: 'Only Empowerment home' });
    await expect(brand).toBeFocused();
    await expect(brand).toHaveCSS('outline-style', 'solid');
    await expect(brand).toHaveCSS('outline-width', '3px');
  }
});

import { test, expect } from '@playwright/test';

test('hash-route navigation updates title and focuses the new page heading', async ({ page }) => {
  await page.goto('/');
  await page.locator('footer').getByRole('link', { name: 'Privacy & source', exact: true }).click();
  const heading = page.getByRole('heading', {
    level: 1,
    name: 'Your answers are not ours to collect.',
    exact: true,
  });
  await expect(page).toHaveURL(/#\/privacy$/);
  await expect(heading).toHaveAttribute('tabindex', '-1');
  await expect(heading).toBeFocused();
  await expect(page).toHaveTitle('Your answers are not ours to collect. | Only Empowerment');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('h1')).toBeFocused();
});

test('immediate Standard Card input retains focus after navigation from an unavailable route', async ({
  page,
}) => {
  await page.goto('/#/saved');
  await expect(page.getByRole('heading', { name: 'That page is not here.' })).toBeVisible();
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await page.locator('#period-standard').fill('Fictional standard.');
  await page.locator('#period-nextApplication').fill('Fictional next action.');
  await expect(page.locator('#period-nextApplication')).toBeFocused();
  await page.keyboard.type(' Begin.');
  await expect(page.locator('#period-nextApplication')).toHaveValue(
    'Fictional next action. Begin.',
  );
  await expect(page.locator('#period-standard')).toHaveValue('Fictional standard.');
});

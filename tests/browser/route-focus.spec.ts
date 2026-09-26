import { test, expect } from '@playwright/test';

test('hash-route navigation updates title and focuses the new page heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'The tools', exact: true }).click();
  const toolsHeading = page.getByRole('heading', {
    level: 1,
    name: 'Different situations. Useful next steps.',
    exact: true,
  });
  await expect(page).toHaveURL(/#\/tools$/);
  await expect(toolsHeading).toHaveAttribute('tabindex', '-1');
  await expect(toolsHeading).toBeFocused();
  await expect(page).toHaveTitle('Different situations. Useful next steps. | Only Empowerment');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.getByRole('link', { name: 'The approach', exact: true }).click();
  const approachHeading = page.getByRole('heading', {
    level: 1,
    name: 'Understand it. Use it. Make it yours.',
    exact: true,
  });
  await expect(page).toHaveURL(/#\/approach$/);
  await expect(approachHeading).toHaveAttribute('tabindex', '-1');
  await expect(approachHeading).toBeFocused();
  await expect(page).toHaveTitle('Understand it. Use it. Make it yours. | Only Empowerment');
});

test('immediate form interaction retains input and focus after route navigation', async ({
  page,
}) => {
  await page.goto('/#/saved');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const task = 'Open the report and review the first section.';
  const firstAction = 'Read the first paragraph and mark the next action.';
  // Keep navigation and both fills uninterrupted, with no observation or settling wait.
  await page.goto('/#/tools/do-it-now');
  await page.locator('#din-task').fill(task);
  await page.locator('#din-firstAction').fill(firstAction);
  await expect(page.locator('#din-task')).toHaveValue(task);
  await expect(page.locator('#din-firstAction')).toHaveValue(firstAction);
  await expect(page.locator('#din-firstAction')).toBeFocused();
  await page.keyboard.type(' Then begin.');
  await expect(page.locator('#din-firstAction')).toHaveValue(firstAction + ' Then begin.');
  await expect(page.locator('#din-firstAction')).toBeFocused();
  await expect(page.locator('#din-task')).toHaveValue(task);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByLabel('Yes. I can begin now.', { exact: true })).toBeVisible();
});

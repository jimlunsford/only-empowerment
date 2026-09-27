import { expect, type Page } from '@playwright/test';

// Use a real accepted tool for shell/host privacy and layout checks.
export async function executionCard(page: Page, action: string) {
  await page.goto('/#/tools/next-move');
  const next = () => page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByLabel('What needs movement?', { exact: true }).fill('Synthetic review task.');
  await next();
  await page.getByLabel('What is your next useful action?', { exact: true }).fill(action);
  await next();
  await page.getByRole('radio', { name: 'The direction is decided' }).check();
  await next();
  await page.getByLabel('What is likely to get in the way?', { exact: true }).fill('Delay.');
  await page.getByRole('radio', { name: 'I can plan around' }).check();
  await next();
  await page.getByLabel('What will start this action?', { exact: true }).fill('After this review.');
  await next();
  await page.getByLabel('What will count as complete?', { exact: true }).fill('One shelf cleared.');
  await page.getByRole('button', { name: 'Review my plan' }).click();
  await page.getByRole('button', { name: 'Confirm my plan' }).click();
  await expect(page.locator('.artifact-action .answer')).toHaveJSProperty('textContent', action);
}

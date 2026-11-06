import { type Page } from '@playwright/test';
export async function periodCard(page: Page, marker: string) {
  await page.goto('/#/period/standard');
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill(marker);
  await page.locator('#period-nextApplication').fill('Fictional next update.');
  await page.getByRole('button', { name: 'Make my standard card' }).click();
}

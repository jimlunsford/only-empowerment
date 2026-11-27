import { expect, type Page } from '@playwright/test';
export async function expectReadingNavigation(page: Page) {
  await expect(page.locator('script')).toHaveCount(1);
  await expect(page.locator('script')).toHaveAttribute('src', '/read/navigation.js');
  await expect(page.locator('script')).toHaveAttribute('defer', '');
  await expect(page.locator('script')).toBeEmpty();
}

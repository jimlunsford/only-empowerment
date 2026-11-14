import { type Page } from '@playwright/test';
import records from '../../fixtures/legacy-storage.json' with { type: 'json' };
export { records };
export async function seed(page: Page) {
  await page.goto('/');
  await page.evaluate((values) => {
    for (const [key, raw] of Object.entries(values)) localStorage.setItem(key, raw);
  }, records);
  await page.reload();
}

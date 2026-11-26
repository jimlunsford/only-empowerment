import { expect, type Page } from '@playwright/test';

// Follow the same disclosure step as a visitor before using mobile header links.
export async function openSiteMenu(page: Page) {
  const menu = page.locator('.site-header > details.site-menu');
  const summary = menu.locator('summary');
  if (await summary.isVisible()) {
    if (!(await menu.evaluate((el: HTMLDetailsElement) => el.open))) await summary.click();
    await expect(menu).toHaveAttribute('open', '');
  }
}

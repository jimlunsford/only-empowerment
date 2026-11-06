import { test, expect } from '@playwright/test';
import { periodCard } from './helpers/period-card';

for (const available of [true, false]) {
  test(`artifact startup, exact text and wrapping with Segmenter ${available ? 'present' : 'absent'}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    if (!available) {
      await page.addInitScript(() => {
        Object.defineProperty(Intl, 'Segmenter', { value: undefined, configurable: true });
      });
    }
    const authored = `  <script>alert("&")</script>\n${'👩🏽‍💻e\u0301🇺🇸漢字'.repeat(10)}  `;
    await periodCard(page, authored);
    expect(await page.evaluate(() => typeof Intl.Segmenter)).toBe(
      available ? 'function' : 'undefined',
    );
    await expect(page.locator('[data-field="standard"]')).toHaveJSProperty('textContent', authored);
    await expect(page.locator('.period-card script')).toHaveCount(0);
    expect(await page.locator('[data-field="standard"] wbr').count()).toBeGreaterThan(0);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
}

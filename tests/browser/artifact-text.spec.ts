import { test, expect } from '@playwright/test';
import { standardFields, standardStepFields, standardSteps } from '../../src/standard-model';

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
    await page.goto('/#/tools/build-a-standard');
    expect(await page.evaluate(() => typeof Intl.Segmenter)).toBe(
      available ? 'function' : 'undefined',
    );
    const authored = `  <script>alert("&")</script>\n${'👩🏽‍💻e\u0301🇺🇸漢字'.repeat(40)}  `;
    const values = Object.fromEntries(
      standardFields.map((field) => [field, field === 'standard' ? 'A'.repeat(2000) : authored]),
    );
    for (const step of standardSteps) {
      for (const field of standardStepFields[step]) {
        await page
          .locator(`#ps-${field}${field === 'keeping' || field === 'violations' ? '-0' : ''}`)
          .fill(values[field]);
      }
      await page
        .getByRole('button', {
          name: step === 'correction' ? 'Review my standard' : 'Next',
          exact: true,
        })
        .click();
    }
    await page.getByRole('button', { name: 'Set this standard', exact: true }).click();
    await expect(page.locator('.personal-standard')).toContainText('Status: Set');
    for (const field of standardFields) {
      await expect(page.locator(`.standard-${field} .answer`)).toHaveJSProperty(
        'textContent',
        values[field],
      );
    }
    await expect(page.locator('.personal-standard script')).toHaveCount(0);
    expect(await page.locator('.standard-standard wbr').count()).toBe(499);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(errors).toEqual([]);
  });
}

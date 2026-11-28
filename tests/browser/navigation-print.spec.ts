import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test.skip(
  ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
  'PDF export uses desktop Chromium; other projects retain print-media regression checks.',
);

test('Work 30 A4 and Letter exports preserve six lessons, separate card and script-free reading', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(180000);
  const evidence: Record<string, string> = {};
  async function pdf(name: string, target = page) {
    await target.evaluate(() => document.fonts.ready);
    await target.emulateMedia({ media: 'print' });
    for (const selector of [
      '.site-header',
      '.site-footer .footer-group',
      '.site-shell .period-review-notice',
    ])
      for (const element of await target.locator(selector).all())
        await expect(element).toBeHidden();
    await expect(target.locator('.founder-copyright')).toBeVisible();
    await expect(target.locator('.footer-print-urls')).toBeVisible();
    await expect(target.locator('.footer-print-urls')).toContainText('No warranty.');
    await expect(target.locator('.footer-notices')).toHaveCount(1);
    const text = await target.locator('body').innerText();
    expect(
      text.match(
        /Copyright © Jim Lunsford\. Software and educational adaptations: AGPL-3\.0-or-later\. Published books: all rights reserved\. A Phoenix 2:33 LLC Project\./g,
      ),
    ).toHaveLength(1);
    // The root edition also prints Loop's About the source paragraph.
    // All other editions retain exactly one document attribution.
    expect(
      text.match(/An educational companion to .+? by Jim Lunsford\./g)?.length ?? 0,
      name,
    ).toBe(name === 'root-reading' ? 2 : 1);
    expect(text.length).toBeGreaterThan(180);
    for (const format of ['A4', 'Letter'] as const) {
      const filename = `work30-${name}-${format}.pdf`;
      await target.pdf({
        path: info.outputPath(filename),
        format,
        printBackground: true,
        margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' },
      });
      evidence[filename] = text;
    }
    await target.emulateMedia({ media: 'screen' });
  }
  for (const value of [
    'ownership',
    'purpose',
    'resilience',
    'integrity',
    'discipline',
    'empowerment',
  ]) {
    await page.goto('/#/period/values/' + value);
    await expect(page.locator('h1')).toBeVisible();
    await pdf(value);
  }
  await page
    .getByRole('navigation', { name: 'Your practice' })
    .getByRole('link', { name: 'Optional Standard Card' })
    .click();
  await page.locator('#period-valueId').selectOption('integrity');
  await page
    .locator('#period-standard')
    .fill('SYNTHETIC: I give accurate updates.\nThis is an intended behavior.');
  await page
    .locator('#period-nextApplication')
    .fill('SYNTHETIC: Correct the next handover before the meeting.');
  await page.getByRole('button', { name: 'Make my standard card' }).click();
  await expect(page.locator('[data-field="standard"]')).toBeVisible();
  await pdf('standard-card');
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const reading = await context.newPage();
    for (const [name, path] of [
      ['root-reading', '/'],
      ['privacy-reading', '/read/privacy.html'],
      ['resilience-reading', '/read/resilience.html'],
      ['integrity-reading', '/read/integrity.html'],
      ['discipline-reading', '/read/discipline.html'],
      ['empowerment-reading', '/read/empowerment.html'],
    ]) {
      const response = await reading.goto(baseURL + path);
      expect(response?.status()).toBe(200);
      await expect(reading.getByRole('main')).toBeVisible();
      await pdf(name, reading);
    }
  } finally {
    await context.close();
  }
  await writeFile(info.outputPath('work30-print-expected.json'), JSON.stringify(evidence, null, 2));
});

import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { seed } from './helpers/legacy-records';

test.skip(
  ({ browserName, isMobile }) => browserName !== 'chromium' || isMobile,
  'PDF export uses desktop Chromium; other projects retain print-media regression checks.',
);

test('Work 26 A4 and Letter exports preserve six lessons, six legacy artifacts, separate card and script-free reading', async ({
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
      if (await target.locator(selector).count())
        await expect(target.locator(selector)).toBeHidden();
    await expect(target.locator('.founder-copyright')).toBeVisible();
    await expect(target.locator('.footer-software')).toBeVisible();
    await expect(target.locator('.footer-notices')).toHaveCount(1);
    const text = await target.locator('body').innerText();
    expect(
      text.match(/Copyright © Jim Lunsford\. All rights reserved\. A Phoenix 2:33 LLC Project\./g),
    ).toHaveLength(1);
    expect(
      text.match(/Educational adaptation by Only Empowerment\./g)?.length ?? 0,
    ).toBeLessThanOrEqual(1);
    expect(text.length).toBeGreaterThan(180);
    for (const format of ['A4', 'Letter'] as const) {
      const filename = `work26-${name}-${format}.pdf`;
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
  await seed(page);
  for (const [type, slug] of [
    ['Execution Card', 'next-move'],
    ['Decision Record', 'decision-room'],
    ['Personal Standard', 'build-a-standard'],
    ['Reset Plan', 'reset'],
    ['Rebuild Map', 'rebuild-map'],
    ['Action Record', 'do-it-now'],
  ]) {
    await page.getByRole('button', { name: new RegExp('^Open ' + type) }).click();
    await expect(page.getByRole('button', { name: /^Print/ })).toBeVisible();
    await pdf(slug);
    await page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Saved work', exact: true })
      .click();
  }
  await page
    .getByRole('navigation', { name: 'Main navigation' })
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
  await writeFile(info.outputPath('work26-print-expected.json'), JSON.stringify(evidence, null, 2));
});

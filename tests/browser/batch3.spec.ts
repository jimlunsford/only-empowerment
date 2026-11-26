import { test, expect } from '@playwright/test';

test('Stage 4 waiting choice leads to an explicitly assumed organizer contact', async ({
  page,
}) => {
  await page.goto('/#/execution/event-wait');
  await page
    .getByRole('button', { name: 'Wait for access before involving the organizer.', exact: true })
    .click();
  await page
    .locator('.execution-screen')
    .getByRole('link', { name: /^Continue/ })
    .click();
  await expect(page.locator('.workshop-facts')).toContainText('assume the organizer was contacted');
  await expect(page.locator('.workshop-facts')).toContainText(
    'not work performed by your earlier choice',
  );
  await expect(page.locator('.execution-screen h1')).toBeFocused();
  await page.goto('/#/execution/your-responsibility');
  await expect(page.locator('.workshop-main')).toContainText('Take an evening course');
  await expect(page.locator('.workshop-main')).toContainText('repair cannot command forgiveness');
});

test('Rebuild movements open the corresponding Loop teaching and return notes', async ({
  page,
}) => {
  for (const [label, part, title] of [
    ['Produce the proof.', 2, 'Action creates proof'],
    ['Rebuild self-trust.', 3, 'Proof rebuilds self-trust'],
    ['Stabilize identity.', 4, 'Self-trust stabilizes identity'],
    ['Reduce negotiation.', 5, 'Stable identity reduces negotiation'],
  ] as const) {
    await page.goto('/#/rebuild');
    await page.getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp('#/loop\\?section=part-' + part + '$'));
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeFocused();
  }
  await page.goto('/#/rebuild/help');
  await page
    .getByText('When Rae cannot make the call', { exact: true })
    .filter({ visible: true })
    .click();
  await expect(
    page
      .getByText('Sister: contacts the trusted friend with Rae’s permission.', { exact: false })
      .filter({ visible: true }),
  ).toContainText('accessible way');
});

test.describe('static Batch 3 reading', () => {
  test.use({ javaScriptEnabled: false });
  test('direct Loop links work without JavaScript and headings have vertical spacing', async ({
    page,
  }) => {
    await page.goto('/read/rebuild.html');
    await page.getByRole('link', { name: 'Produce the proof.', exact: true }).click();
    await expect(page).toHaveURL(/\/read\/loop.html#part-2$/);
    await expect(
      page.getByRole('heading', { name: 'Action creates proof', exact: true }),
    ).toBeInViewport();
    for (const path of ['index', 'privacy', 'purpose', 'execution']) {
      await page.goto('/read/' + path + '.html');
      for (const tag of ['h1', 'h2']) {
        const heading = page.locator('main ' + tag).first();
        expect(
          await heading.evaluate((el) => parseFloat(getComputedStyle(el).marginTop)),
        ).toBeGreaterThan(0);
        expect(
          await heading.evaluate((el) => parseFloat(getComputedStyle(el).marginBottom)),
        ).toBeGreaterThan(0);
      }
    }
  });
  test('printed readings retain their complete copyright and source credit', async ({
    page,
  }, info) => {
    for (const name of ['purpose', 'rebuild', 'execution']) {
      await page.goto('/read/' + name + '.html');
      await page.emulateMedia({ media: 'print' });
      await expect(page.locator('.founder-copyright')).toBeVisible();
      await expect(page.locator('.footer-print-urls')).toContainText('No warranty.');
      await expect(page.locator('.footer-print-urls')).toContainText('Jim Lunsford');
      if (info.project.name === 'chromium') {
        await page.pdf({
          path: info.outputPath(name + '-A4.pdf'),
          format: 'A4',
          printBackground: true,
          margin: { top: '14mm', bottom: '14mm', left: '14mm', right: '14mm' },
        });
      }
    }
  });
});

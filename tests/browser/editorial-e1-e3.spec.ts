import { test, expect } from '@playwright/test';
import { workshopById } from '../../src/execution-workshop-content';
import { honestMessage } from '../../src/period-practice-content';
import { resilienceContent } from '../../src/period-resilience-content';

for (const forcedColors of ['none', 'active'] as const)
  test(`E1 foundation joins the keyboard sequence and restarts cleanly (${forcedColors})`, async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors });
    await page.goto('/#/execution');
    const workshop = page.locator('.execution-screen');
    const title = workshop.locator('h1');
    await workshop
      .getByRole('link', { name: 'Continue: Why & The Bargain', exact: true })
      .press('Enter');
    await expect(title).toHaveText('Why & The Bargain');
    await expect(title).toBeFocused();
    await expect(title).toHaveCSS('outline-style', 'solid');
    await expect(workshop.locator('.workshop-position')).toContainText(
      'Foundation · Before Stage 1',
    );
    await expect(
      workshop
        .getByRole('navigation', { name: 'Workshop stages' })
        .getByRole('link', { name: 'Why & The Bargain', exact: true }),
    ).toHaveAttribute('aria-current', 'step');
    for (const paragraph of workshopById('foundation').teaching)
      await expect(workshop.getByText(paragraph, { exact: true })).toBeVisible();
    await workshop
      .getByRole('link', { name: 'Continue Identify the Next Move', exact: true })
      .press('Enter');
    await expect(title).toHaveText('Identify the Next Move');
    await expect(title).toBeFocused();
    await expect(workshop.locator('.workshop-position')).toContainText(
      'Stage 1 of 4 · Screen 1 of 5',
    );
    await workshop.getByRole('button', { name: 'See the chosen action', exact: true }).click();
    await workshop.getByRole('link', { name: 'Take over', exact: true }).click();
    await workshop
      .getByRole('button', { name: workshopById('take-over').options![0].label, exact: true })
      .click();
    await workshop
      .getByRole('button', { name: 'Compare every option and read the explanation', exact: true })
      .click();
    await workshop
      .getByRole('navigation', { name: 'Workshop stages' })
      .getByRole('link', { name: 'Why & The Bargain', exact: true })
      .click();
    await workshop.getByRole('button', { name: 'Restart workshop', exact: true }).press('Enter');
    await expect(title).toHaveText('Pure Execution Mode');
    await expect(title).toBeFocused();
    await expect(workshop.getByRole('status')).toContainText(
      'Previous choices and open explanations have been cleared.',
    );
    await workshop
      .getByRole('link', { name: 'Continue: Why & The Bargain', exact: true })
      .press('Enter');
    await workshop
      .getByRole('link', { name: 'Continue Identify the Next Move', exact: true })
      .press('Enter');
    await expect(
      workshop.getByRole('button', { name: 'See the chosen action', exact: true }),
    ).toHaveAttribute('aria-expanded', 'false');
    await workshop
      .getByRole('link', { name: 'Back Why & The Bargain', exact: true })
      .press('Enter');
    await expect(title).toHaveText('Why & The Bargain');
    await expect(title).toBeFocused();
    await workshop.getByRole('link', { name: 'Take over', exact: true }).click();
    await expect(workshop.locator('[aria-pressed="true"]')).toHaveCount(0);
    await expect(
      workshop.getByRole('button', {
        name: 'Compare every option and read the explanation',
        exact: true,
      }),
    ).toHaveAttribute('aria-expanded', 'false');
  });

for (const javaScriptEnabled of [true, false])
  test(`E2 static jump links reach visible headings (JavaScript ${javaScriptEnabled})`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(baseURL! + '/read/execution.html');
    await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
    const links = page.getByRole('navigation', { name: 'Reading sections', exact: true });
    for (const [label, id] of [
      ['Workshop outcomes', 'workshop-outcomes'],
      ['Explanation', 'why'],
    ]) {
      const target = page.locator('#' + id);
      await links.getByRole('link', { name: label, exact: true }).press('Enter');
      await expect(target).toBeFocused();
      await expect(target).toBeInViewport();
      await expect
        .poll(() => target.evaluate((el) => el.getBoundingClientRect().top))
        .toBeGreaterThanOrEqual(0);
      await expect(page).toHaveURL(new RegExp('#' + id + '$'));
      await page.reload();
      await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
      await expect(target).toBeInViewport();
    }
    await expect(
      page.locator(
        'main details, main summary, main input, main textarea, main select, main button',
      ),
    ).toHaveCount(0);
    await context.close();
  });

test('E3 preferred responses start collapsed while both static editions expose all responses', async ({
  page,
  browser,
  baseURL,
}) => {
  await page.goto('/#/period/practice/responses');
  const honest = page.locator('.practice-honest');
  await expect(honest).not.toHaveAttribute('open', '');
  await expect(honest.locator('blockquote')).not.toBeVisible();
  await honest.locator('summary').press('Enter');
  await expect(honest.locator('blockquote')).toBeVisible();
  await page.goto('/#/period/resilience/pressure');
  const responses = page.locator('.resilience-current .resilience-responses details');
  for (const detail of await responses.all()) {
    await expect(detail).not.toHaveAttribute('open', '');
    await expect(detail.locator('p')).not.toBeVisible();
  }
  await responses.first().locator('summary').press('Space');
  await expect(responses.first().locator('p')).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const reading = await context.newPage();
  await reading.goto(baseURL! + '/read/ownership.html');
  const practice = reading.getByRole('region', { name: 'Practice Ownership linear reading' });
  for (const condition of ['worked', 'unavailable'] as const)
    await expect(practice.getByText(honestMessage(condition), { exact: true })).toBeVisible();
  await expect(practice.locator('details, summary, input, textarea, select, button')).toHaveCount(
    0,
  );
  await reading.goto(baseURL! + '/read/resilience.html');
  for (const note of resilienceContent.states)
    for (const response of note.responses)
      await expect(reading.getByText(response.text, { exact: true })).toBeVisible();
  await expect(
    reading.locator(
      'main details, main summary, main input, main textarea, main select, main button',
    ),
  ).toHaveCount(0);
  await context.close();
});

import { test, expect, type Page } from '@playwright/test';

// Match the deployed restrictive policy. The ordinary Vite preview has no CSP.
const policy =
  "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
type Violation = { directive: string; blocked: string; source: string };
async function observe(page: Page) {
  const violations: Violation[] = [];
  const errors: string[] = [];
  await page.exposeFunction('recordCspViolation', (violation: Violation) =>
    violations.push(violation),
  );
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      void (
        window as unknown as { recordCspViolation: (v: Violation) => Promise<void> }
      ).recordCspViolation({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
        source: event.sourceFile,
      });
    });
  });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': policy },
    });
  });
  const clean = async () => {
    // Let render work and its queued policy events reach the observer.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    expect(violations).toEqual([]);
    expect(errors).toEqual([]);
    await expect(page.locator('[style]')).toHaveCount(0);
  };
  return { violations, errors, clean };
}

test('strict CSP allows the native Standard Card editor, result, edit and reload lifecycle', async ({
  page,
}) => {
  const { clean } = await observe(page);
  const response = await page.goto('/#/period/standard');
  expect(response!.headers()['content-security-policy']).toBe(policy);
  await expect(page.locator('#period-valueId')).toBeVisible();
  // The original native select, label, options and controlled value remain intact.
  await expect(page.locator('#period-valueId')).toHaveJSProperty('tagName', 'SELECT');
  await expect(page.locator('#period-valueId option')).toHaveCount(7);
  await clean();
  await page.locator('#period-valueId').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('#period-valueId')).not.toHaveValue('');
  await page.locator('#period-valueId').selectOption('integrity');
  await page.locator('#period-standard').fill('SYNTHETIC CSP: Return the tools after use.');
  await page.locator('#period-nextApplication').fill('After the next household repair.');
  await page.getByRole('button', { name: 'Make my standard card', exact: true }).click();
  await expect(page.locator('#period-card-title')).toBeFocused();
  await expect(page.locator('.period-card')).toContainText('Return the tools after use.');
  await clean();
  await page.getByRole('button', { name: 'Edit my card', exact: true }).click();
  await expect(page.locator('#period-valueId')).toBeFocused();
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await expect(page.locator('#period-standard')).toHaveValue(
    'SYNTHETIC CSP: Return the tools after use.',
  );
  await clean();
  await page.getByRole('button', { name: 'Clear this draft', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep writing', exact: true }).click();
  await expect(page.locator('#period-valueId')).toHaveValue('integrity');
  await page.reload();
  await expect(page.locator('#period-valueId')).toHaveValue('');
  await expect(page.locator('#period-standard')).toHaveValue('');
  await clean();
});

test('strict CSP preserves every native Resilience pressure option and route remount', async ({
  page,
}) => {
  const { clean } = await observe(page);
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/#/period/resilience/pressure');
  const select = page.locator('#resilience-pressure');
  await expect(select).toBeVisible();
  const values = await select
    .locator('option')
    .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));
  expect(values).toHaveLength(5);
  for (const value of values) {
    await select.selectOption(value);
    await expect(select).toHaveValue(value);
    await clean();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => {
    location.hash = '#/period/standard';
  });
  await expect(page.locator('#period-valueId')).toBeVisible();
  await clean();
  await page.goBack();
  await expect(select).toBeVisible();
  await clean();
});

test('strict CSP still blocks an authored inline style on the adopted native control', async ({
  page,
}) => {
  const { violations, errors } = await observe(page);
  await page.goto('/#/period/standard');
  await expect(page.locator('#period-valueId')).toBeVisible();
  await page
    .locator('#period-valueId')
    .evaluate((select) => select.setAttribute('style', 'position: fixed; left: 12345px'));
  await expect
    .poll(() => violations.some((v) => v.directive === 'style-src-attr' && v.blocked === 'inline'))
    .toBe(true);
  await expect(page.locator('#period-valueId')).not.toHaveCSS('position', 'fixed');
  expect(errors.length).toBeGreaterThan(0);
});

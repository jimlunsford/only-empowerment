import { expect, test, type Locator, type Page } from '@playwright/test';

async function pointerWithoutFocus(page: Page, opener: Locator) {
  await page.locator('#main').focus();
  // Match browsers where a pointer click activates a control without focusing it.
  // The click itself still uses real pointer events and the application's handler.
  await opener.evaluate((element) => {
    element.addEventListener('mousedown', (event) => event.preventDefault(), { once: true });
  });
  await opener.click();
}

test('Work75 clear cancellation and confirmation return to the actual pointer opener', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-valueId').selectOption('ownership');
  await page.locator('#period-standard').fill('When plans change, I give an honest update.');
  const opener = page.locator('#period-clear');
  for (const action of ['escape', 'cancel', 'confirm']) {
    await pointerWithoutFocus(page, opener);
    await expect(page.getByRole('button', { name: 'Keep writing' })).toBeFocused();
    if (action === 'escape') await page.keyboard.press('Escape');
    else
      await page
        .getByRole('dialog')
        .getByRole('button', {
          name: action === 'cancel' ? 'Keep writing' : 'Clear draft',
          exact: true,
        })
        .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator('#period-standard')).toHaveValue(
      action === 'confirm' ? '' : 'When plans change, I give an honest update.',
    );
  }
});

test('Work75 legacy-data dialog returns to its pointer opener without touching unrelated data', async ({
  page,
}) => {
  await page.goto('/#/privacy');
  await page.evaluate(() => localStorage.setItem('work75-unrelated', 'synthetic control'));
  const opener = page.locator('.local-delete > button');
  for (const action of ['escape', 'confirm']) {
    await pointerWithoutFocus(page, opener);
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel' })).toBeFocused();
    if (action === 'escape') await page.keyboard.press('Escape');
    else
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Delete legacy tool data', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
    expect(await page.evaluate(() => localStorage.getItem('work75-unrelated'))).toBe(
      'synthetic control',
    );
  }
});

test('Work75 cancelled book exit returns to the actual link without discarding the private draft', async ({
  page,
}) => {
  await page.goto('/#/period/standard');
  await page.locator('#period-standard').fill('A private synthetic standard.');
  await page.getByRole('link', { name: 'About The PERIOD Code book', exact: true }).click();
  const opener = page.getByRole('link', { name: 'Explore the book and read a sample' });
  for (const action of ['escape', 'cancel']) {
    await pointerWithoutFocus(page, opener);
    await expect(page.getByRole('button', { name: 'Stay here' })).toBeFocused();
    if (action === 'escape') await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Stay here' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page).toHaveURL(/#\/period\/book$/);
  }
  await page.getByRole('link', { name: 'Optional Standard Card', exact: true }).click();
  await expect(page.locator('#period-standard')).toHaveValue('A private synthetic standard.');
});

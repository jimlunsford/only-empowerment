import { test, expect } from '@playwright/test';
import { workshopScreens, workshopHref } from '../../src/execution-workshop-content';

const readings = [
  'index',
  'ownership',
  'purpose',
  'resilience',
  'integrity',
  'discipline',
  'empowerment',
  'standard',
  'rebuild',
  'loop',
  'loop-practice',
  'execution',
  'privacy',
];
for (const reading of readings) {
  test(`D1 ${reading} reading constrains prose and fits all four widths`, async ({
    page,
  }, info) => {
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`/read/${reading}.html`);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const oversized = await page
        .locator('#main :is(p, li, dd, blockquote)')
        .evaluateAll((elements) => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d')!;
          return elements
            .filter((el) => {
              if (!(el as HTMLElement).offsetHeight) return false;
              const style = getComputedStyle(el);
              context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
              const contentWidth =
                el.getBoundingClientRect().width -
                parseFloat(style.paddingLeft) -
                parseFloat(style.paddingRight) -
                parseFloat(style.borderLeftWidth) -
                parseFloat(style.borderRightWidth);
              return contentWidth > 75 * context.measureText('0').width + 1;
            })
            .map((el) => el.textContent?.slice(0, 60));
        });
      expect(oversized, `${reading} at ${width}px`).toEqual([]);
      if (['ownership', 'purpose', 'standard'].includes(reading)) {
        const measure = await page.locator('.period-reading').evaluate((el) => {
          const probe = document.createElement('span');
          probe.style.cssText = 'display:block;width:70ch';
          el.append(probe);
          const result = {
            width: el.getBoundingClientRect().width,
            cap: probe.getBoundingClientRect().width,
          };
          probe.remove();
          return result;
        });
        expect(measure.width).toBeLessThanOrEqual(measure.cap + 1);
        if (width === 1440) expect(measure.width).toBeGreaterThan(measure.cap * 0.9);
      }
      if (reading === 'empowerment' && width === 320) {
        const title = page.getByRole('heading', { level: 1 });
        const geometry = await title.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const lines = [...range.getClientRects()];
          return {
            lines: lines.length,
            left: lines[0].left,
            right: lines[0].right,
            width: innerWidth,
          };
        });
        expect(geometry.lines).toBe(1);
        expect(geometry.left).toBeGreaterThanOrEqual(0);
        expect(geometry.right).toBeLessThanOrEqual(geometry.width);
        if (info.project.name === 'chromium')
          await page.screenshot({ path: info.outputPath('empowerment-320.png') });
      }
      if (reading === 'loop' || reading === 'loop-practice' || reading === 'rebuild') {
        await expect(page.locator('h1')).toHaveCSS('font-family', /Source Serif/);
        await expect(page.locator('body')).toHaveCSS('font-family', /Source Sans/);
        expect(
          await page.evaluate(
            () =>
              [...document.fonts].filter(
                (f) => /Source (Serif|Sans)/.test(f.family) && f.status === 'loaded',
              ).length,
          ),
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
}

test('D2 Rebuild lessons keep one breadcrumb and internal links have no external arrows', async ({
  page,
}) => {
  for (const section of ['line', 'structure', 'return', 'trust', 'negotiation', 'help']) {
    await page.goto('/#/rebuild/' + section);
    await expect(page.locator('.rebuild-guide .breadcrumb')).toHaveCount(1);
    await expect(page.locator('.rebuild-approval')).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Breadcrumb', exact: true })).toBeVisible();
  }
  await page.goto('/#/rebuild');
  const internalLinks = page.locator('.rebuild-guide a[href^="#"]');
  expect(await internalLinks.count()).toBeGreaterThan(10);
  for (const link of await internalLinks.all()) await expect(link).not.toContainText('↗');
  await expect(
    page.locator('.rebuild-guide a[href="https://www.amazon.com/dp/B0HQVNBCWP"]'),
  ).toHaveAttribute('target', '_blank');
});

for (const section of ['structure', 'trust', 'negotiation']) {
  test(`D2 ${section} announces native view changes without moving focus or changing outcomes`, async ({
    page,
  }) => {
    await page.goto('/#/rebuild/' + section);
    const status = page.locator('.rebuild-guide [role="status"]');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    await expect(status).toHaveAttribute('aria-atomic', 'true');
    await expect(status).toBeEmpty();
    const inputs = page.locator('.rebuild-guide input');
    for (let index = 1; index < (await inputs.count()); index++) {
      const input = inputs.nth(index);
      const label = (await input.locator('..').innerText()).trim();
      await input.focus();
      await page.keyboard.press('Space');
      await expect(input).toBeChecked();
      await expect(input).toBeFocused();
      await expect(status).toHaveText(`Showing: ${label}.`);
      const panel = page.locator('#' + (await input.getAttribute('aria-controls')));
      await expect(panel).toBeVisible();
      if (section === 'trust') {
        await page.keyboard.press('Space');
        await expect(status).toHaveText(`Hidden: ${label}.`);
        await expect(panel).toBeHidden();
      }
    }
    await page.reload();
    await expect(status).toBeEmpty();
    await expect(inputs.first()).toBeChecked();
  });
}

test('D2 every Execution entry retains heading focus without a direct-entry outline', async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const screen of workshopScreens) {
    await page.goto('/' + workshopHref(screen.id));
    const title = page.locator('.workshop h1');
    await expect(title).toBeFocused();
    await expect(title).toHaveCSS('outline-style', 'none');
    await expect(title).toHaveAttribute('tabindex', '-1');
  }
});

test('D2 Execution pointer and keyboard navigation preserve focus with the appropriate ring', async ({
  page,
}) => {
  await page.goto('/#/execution');
  const title = page.locator('.workshop h1');
  await page.locator('.workshop-navigation a[href="#/execution/identify"]').click();
  await expect(title).toBeFocused();
  await expect(title).toHaveCSS('outline-style', 'none');
  const back = page.locator('.workshop-navigation a[href="#/execution"]');
  await back.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(back).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/execution$/);
  await expect(title).toBeFocused();
  expect(await title.evaluate((el) => el.matches(':focus-visible'))).toBe(true);
  await expect(title).toHaveCSS('outline-style', 'solid');
  await expect(title).toHaveCSS('outline-width', '3px');
  await page.emulateMedia({ forcedColors: 'active' });
  await expect(title).toHaveCSS('outline-style', 'solid');
  await title.click();
  await expect(title).toBeFocused();
  await expect(title).toHaveCSS('outline-style', 'none');
});

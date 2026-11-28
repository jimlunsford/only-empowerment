import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { frameworkPositioning } from '../../src/framework-home-content';
import { privacySummary, privacyTracking } from '../../src/privacy-content';
import { founderCopyright, footerEducation } from '../../src/site-footer-content';
import { loopSections } from '../../src/loop-content';
const forbidden =
  /in this build|bounded PERIOD experience|Legacy tools retain system fonts|All six values have full lessons/;

for (const javaScriptEnabled of [true, false]) {
  for (const width of [1440, 768, 390, 320]) {
    test(`C1: positioning editorial band at ${width}px with JavaScript ${javaScriptEnabled}`, async ({
      browser,
      baseURL,
    }, info) => {
      const context = await browser.newContext({
        javaScriptEnabled,
        viewport: { width, height: 1000 },
      });
      try {
        const page = await context.newPage();
        await page.goto(baseURL! + (javaScriptEnabled ? '/#/' : '/'));
        await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
        const hub = page.locator('.framework-hub');
        const band = hub.getByRole('region', { name: "Why it's free", exact: true });
        const title = band.getByRole('heading', { name: "Why it's free", level: 2 });
        const paragraph = band.locator('.framework-positioning');
        await expect(title).toBeVisible();
        await expect(paragraph).toHaveText(frameworkPositioning);
        await expect(hub.locator('.framework-chooser a')).toHaveCount(4);
        expect(
          await hub.evaluate((element) => {
            const chooser = element.querySelector('.framework-chooser')!;
            const positioning = element.querySelector('.framework-positioning-band')!;
            const orientation = element.querySelector('.framework-orientation')!;
            return (
              !!(chooser.compareDocumentPosition(positioning) & Node.DOCUMENT_POSITION_FOLLOWING) &&
              !!(
                positioning.compareDocumentPosition(orientation) & Node.DOCUMENT_POSITION_FOLLOWING
              )
            );
          }),
        ).toBe(true);
        const headingBox = (await title.boundingBox())!;
        const proseBox = (await paragraph.boundingBox())!;
        const orientation = hub.locator('.framework-orientation');
        const nextHeadingBox = (await orientation.locator('h2').boundingBox())!;
        const nextProseBox = (await orientation.locator('div > p').first().boundingBox())!;
        expect(headingBox.x).toBeCloseTo(nextHeadingBox.x, 0);
        expect(headingBox.width).toBeCloseTo(nextHeadingBox.width, 0);
        expect(proseBox.x).toBeCloseTo(nextProseBox.x, 0);
        expect(proseBox.width).toBeLessThanOrEqual(nextProseBox.width + 1);
        if (width > 768) {
          expect(proseBox.x).toBeGreaterThan(headingBox.x + headingBox.width);
          expect(proseBox.y).toBeCloseTo(headingBox.y, 0);
        } else {
          expect(proseBox.y).toBeGreaterThanOrEqual(headingBox.y + headingBox.height);
          expect(proseBox.x).toBeCloseTo(headingBox.x, 0);
        }
        const presentation = (element: Element) => {
          const style = getComputedStyle(element);
          return [style.fontFamily, style.fontSize, style.fontWeight, style.lineHeight];
        };
        expect(await title.evaluate(presentation)).toEqual(
          await orientation.locator('h2').evaluate(presentation),
        );
        const rhythm = (element: Element) => {
          const style = getComputedStyle(element);
          return [
            style.borderTopWidth,
            style.borderTopStyle,
            style.borderTopColor,
            style.paddingTop,
            style.paddingBottom,
          ];
        };
        expect(await band.evaluate(rhythm)).toEqual(await orientation.evaluate(rhythm));
        await expect(band).toHaveCSS('border-top-width', '1px');
        await expect(band).toHaveCSS('border-top-style', 'solid');
        expect(
          await paragraph.evaluate(
            (el) =>
              el.getBoundingClientRect().width <= parseFloat(getComputedStyle(el).maxWidth) + 1,
          ),
        ).toBe(true);
        const bandBox = (await band.boundingBox())!;
        const nextBox = (await orientation.boundingBox())!;
        if (!javaScriptEnabled) {
          const chooserBox = (await hub.locator('.framework-chooser').boundingBox())!;
          expect(bandBox.y).toBeGreaterThan(chooserBox.y + chooserBox.height);
        }
        expect(nextBox.y).toBeCloseTo(bandBox.y + bandBox.height, 0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await expect(hub.locator('.framework-author')).toContainText(
          'Four frameworks by Jim Lunsford.',
        );
        if (javaScriptEnabled)
          expect(
            (
              await new AxeBuilder({ page })
                .include('.framework-hub')
                .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
                .analyze()
            ).violations,
          ).toEqual([]);
        if (info.project.name === 'chromium') {
          await band.scrollIntoViewIfNeeded();
          await page.screenshot({
            path: info.outputPath(`positioning-${width}-${javaScriptEnabled}.png`),
          });
        }
        await page.emulateMedia({ media: 'print' });
        await expect(title).toBeVisible();
        await expect(paragraph).toBeVisible();
        await expect(paragraph).toHaveText(frameworkPositioning);
        await expect(
          orientation.getByRole('heading', { name: 'Where to start', level: 2 }),
        ).toBeVisible();
      } finally {
        await context.close();
      }
    });
  }
}

// Axe needs JavaScript timers. Block application scripts to scan the unchanged
// static fallback separately from the genuinely JavaScript-disabled layout checks.
test('C1: fallback positioning band is accessible without loading application scripts', async ({
  page,
}) => {
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'script' ? route.abort() : route.continue(),
  );
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('#educational-fallback')).toBeVisible();
    await expect(page.locator('#app')).toBeEmpty();
    expect(
      (
        await new AxeBuilder({ page })
          .include('.framework-hub')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

test('C2: both privacy editions disclose current behavior and print all four sources', async ({
  page,
}) => {
  for (const route of ['/#/privacy', '/read/privacy.html']) {
    await page.goto(route);
    await expect(page.locator('main')).toContainText(privacySummary);
    await expect(page.locator('main')).toContainText(privacyTracking);
    await expect(page.locator('main')).toContainText('retention');
    await expect(
      page.getByRole('heading', { name: 'If you used an earlier version of this site' }),
    ).toBeVisible();
    expect(await page.locator('main').innerText()).not.toMatch(
      /in this build|retired tools|Saved work|Approach|Production is planned/,
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.founder-copyright')).toHaveText(founderCopyright);
    await expect(page.locator('.footer-print-urls')).toContainText(
      footerEducation('combined').text,
    );
    await page.emulateMedia({ media: 'screen' });
  }
});

test('C2: earlier-version deletion remains confirmed and scoped', async ({ page }) => {
  await page.goto('/#/privacy');
  await page.evaluate(() => {
    localStorage.setItem('oe:audit-c', 'fictional earlier record');
    localStorage.setItem('unrelated:audit-c', 'keep');
  });
  const button = page.getByRole('button', { name: 'Delete legacy tool data', exact: true });
  await button.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('oe:audit-c'))).toBe(
    'fictional earlier record',
  );
  await expect(button).toBeFocused();
  await button.press('Enter');
  await dialog
    .getByRole('button', { name: 'Confirm deletion of legacy data', exact: true })
    .click();
  expect(
    await page.evaluate(() => [
      localStorage.getItem('oe:audit-c'),
      localStorage.getItem('unrelated:audit-c'),
    ]),
  ).toEqual([null, 'keep']);
  await expect(button).toBeFocused();
});

test('C3: all six PERIOD lessons have consistent order labels and safe external book links', async ({
  page,
}) => {
  const values = ['ownership', 'purpose', 'resilience', 'integrity', 'discipline', 'empowerment'];
  for (const [i, value] of values.entries()) {
    for (const route of [`/#/period/values/${value}`, `/read/${value}.html`]) {
      await page.goto(route);
      await expect(page.locator('main .position')).toHaveText(
        `${i + 1} of 6 in the teaching order`,
      );
      const links = page.locator('a[href="https://jimlunsford.com/period-code/"]');
      expect(await links.count()).toBeGreaterThan(0);
      for (const link of await links.all()) {
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
      expect(await page.locator('body').innerText()).not.toMatch(forbidden);
    }
  }
});

test('C3: both Loop editions embed bridge links in complete sentences', async ({ page }) => {
  for (const route of ['/#/loop', '/read/loop.html']) {
    await page.goto(route);
    for (const block of loopSections.flatMap((section) => section.blocks)) {
      if (block.kind !== 'paragraph' || !block.related) continue;
      const link = page.getByRole('link', { name: block.related.label, exact: true });
      await expect(link.locator('..')).toHaveText(block.text);
      await expect(link).toHaveAttribute(
        'href',
        route.startsWith('/#/') ? block.related.app : block.related.reading,
      );
    }
  }
});

test('C3: Rebuild source and PEM closing Amazon links are present and open safely', async ({
  page,
}) => {
  for (const route of ['/#/rebuild', '/read/rebuild.html']) {
    await page.goto(route);
    const link = page.getByRole('link', {
      name: "Visit Jim Lunsford's book page (new tab)",
      exact: true,
    });
    await expect(link).toHaveAttribute('href', 'https://jimlunsford.com/how-to-rebuild-yourself/');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await page.goto('/#/execution/your-responsibility');
  const closing = page.locator('.execution-screen.workshop');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.footer-print-urls')).toContainText(footerEducation('execution').text);
  await page.emulateMedia({ media: 'screen' });
  const amazon = closing.getByRole('link', {
    name: 'Paperback & Kindle on Amazon (new tab)',
    exact: true,
  });
  await expect(amazon).toHaveAttribute('href', 'https://www.amazon.com/dp/B0HR68MLGR');
  await expect(amazon).toHaveAttribute('target', '_blank');
  await expect(amazon).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(closing.locator('a[href="/read/execution.html#miss"]')).toHaveCount(1);
  await expect(closing.locator('a[href="/read/execution.html#daily"]')).toHaveCount(1);
});

test('C1-C3: built public output contains none of the four prohibited phrases', async ({
  request,
}) => {
  function files(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)],
    );
  }
  for (const file of files('dist').filter((file) => /\.(?:html|js|txt)$/.test(file)))
    expect(readFileSync(file, 'utf8'), file).not.toMatch(forbidden);
  const notices = await (await request.get('/THIRD_PARTY_NOTICES.txt')).text();
  expect(notices).toContain(
    'All four frameworks self-host unmodified Source Serif 4 and Source Sans 3',
  );
  const copyright = await (await request.get('/COPYRIGHT.txt')).text();
  expect(copyright).toContain('not the complete books');
});

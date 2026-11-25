import { test, expect } from '@playwright/test';

for (const width of [320, 390, 1366])
  test(`Loop hero focus clears the kicker at ${width}px on entry and keyboard return`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    const heading = page.locator('.loop-hero h1');
    async function clearance(entry: string) {
      await expect(heading).toBeFocused();
      await page.evaluate(() => document.fonts.ready);
      // Keep the actual focused element while showing the preceding kicker for review.
      await page.locator('.loop-hero').evaluate((e) => e.scrollIntoView());
      const geometry = await heading.evaluate((e) => {
        const h = e.getBoundingClientRect();
        const kicker = e.previousElementSibling!.getBoundingClientRect();
        const style = getComputedStyle(e);
        const outlineWidth = parseFloat(style.outlineWidth);
        const outlineOffset = parseFloat(style.outlineOffset);
        return {
          focused: document.activeElement === e,
          headingTop: h.top,
          kickerBottom: kicker.bottom,
          outlineWidth,
          outlineOffset,
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          clearance: h.top - outlineWidth - outlineOffset - kicker.bottom,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      await info.attach(`${entry}-geometry`, {
        body: JSON.stringify({ width, entry, ...geometry }, null, 2),
        contentType: 'application/json',
      });
      await info.attach(`${entry}-focused`, {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
      expect(geometry.focused).toBe(true);
      expect(geometry.outlineStyle).toBe('solid');
      expect(geometry.outlineWidth).toBeGreaterThanOrEqual(3);
      expect(geometry.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(geometry.clearance).toBeGreaterThanOrEqual(7.5);
      expect(geometry.overflow).toBe(false);
    }
    await page.goto('/#/loop');
    // Fresh top-level loads retain browser focus. Explicitly exercise the heading's
    // programmatic-focus presentation without changing that navigation policy.
    await heading.focus();
    await clearance('direct-load-programmatic-focus');
    await page.goto('/');
    await page.getByRole('link', { name: 'Explore The Discipline Loop', exact: true }).focus();
    await page.keyboard.press('Enter');
    await clearance('keyboard-first-entry');
    await page.goto('/#/loop/practice?state=miss');
    await page.getByRole('link', { name: 'Return to the teaching', exact: true }).focus();
    await page.keyboard.press('Enter');
    await clearance('keyboard-return');
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    await page.goto('/#/loop');
    await heading.focus();
    await clearance('reduced-motion-forced-colors');
  });

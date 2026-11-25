import { test, expect } from '@playwright/test';
import approved from '../fixtures/work62-approved.json' with { type: 'json' };

const { rebuild, period } = approved;
const complete = [
  rebuild.line,
  rebuild.firstPerson,
  ...rebuild.structure,
  ...rebuild.return,
  ...rebuild.trust,
  ...rebuild.help,
  ...rebuild.end,
  rebuild.fourthQuestion,
];
const readings: {
  name: string;
  path: string;
  words: string[];
  alternatives?: number;
  native?: boolean;
}[] = [
  {
    name: 'line',
    path: '/#/rebuild/line',
    words: [rebuild.line, rebuild.firstPerson],
    alternatives: 4,
  },
  { name: 'structure', path: '/#/rebuild/structure', words: rebuild.structure, alternatives: 4 },
  { name: 'return', path: '/#/rebuild/return', words: rebuild.return, alternatives: 3 },
  { name: 'trust', path: '/#/rebuild/trust', words: rebuild.trust, alternatives: 3 },
  { name: 'help', path: '/#/rebuild/help', words: rebuild.help, alternatives: 4 },
  { name: 'end', path: '/#/rebuild/end', words: [...rebuild.end, rebuild.fourthQuestion] },
  { name: 'complete', path: '/#/rebuild/complete', words: complete, alternatives: 22 },
  {
    name: 'combined-native',
    path: '/#/rebuild/complete',
    words: complete,
    alternatives: 22,
    native: true,
  },
  {
    name: 'standalone-rebuild',
    path: '/read/rebuild.html',
    words: complete,
    alternatives: 22,
    native: true,
  },
  { name: 'practice', path: '/#/period/practice/responses', words: [period.O15] },
  { name: 'resilience', path: '/#/period/values/resilience', words: [period.R08] },
  { name: 'discipline', path: '/#/period/discipline/pattern', words: [period.D21] },
  { name: 'empowerment', path: '/#/period/empowerment/conversation', words: [period.E24] },
  ...Object.entries({
    ownership: period.O15,
    resilience: period.R08,
    discipline: period.D21,
    empowerment: period.E24,
  }).map(([name, word]) => ({
    name: 'standalone-' + name,
    path: '/read/' + name + '.html',
    words: [word],
    native: true,
  })),
];
for (const reading of readings) {
  test.describe(reading.name, () => {
    test.use({ javaScriptEnabled: !reading.native });
    test('paper includes the revised teaching from its default state', async ({ page }, info) => {
      await page.goto(reading.path);
      await expect(page.locator(reading.native ? 'main' : '#app main')).toBeVisible();
      await page.emulateMedia({ media: 'print' });
      const scope = page.locator(reading.native ? 'main' : '#app main');
      if (reading.name === 'combined-native') {
        const target = page.locator(':target');
        await target.focus();
        await expect(target).toBeFocused();
        await expect(target).toHaveCSS('outline-style', 'none');
      }
      for (const word of reading.words) {
        const printed = scope.getByText(word, { exact: true }).filter({ visible: true });
        await expect(printed).toHaveCount(1);
      }
      if (reading.alternatives)
        await expect(scope.locator('.flatstate:visible')).toHaveCount(reading.alternatives);
      if (reading.name === 'practice') {
        const response = scope
          .locator('details')
          .filter({ has: page.getByText('Promise a late finish', { exact: true }) });
        await expect(response).not.toHaveAttribute('open', /.*/);
        await expect(response.locator('blockquote')).toBeVisible();
      }
      if (info.project.name === 'chromium') {
        for (const format of ['A4', 'Letter'] as const) {
          await page.pdf({
            path: info.outputPath('work62-' + reading.name + '-' + format + '.pdf'),
            format,
            printBackground: true,
          });
        }
      }
    });
  });
}

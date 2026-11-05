import { expect, type Page } from '@playwright/test';
import { emptyDecision, decisionFields } from '../../../src/decision-room-model';
import { standardFields } from '../../../src/standard-model';
import { resetFields } from '../../../src/reset-model';
import { rebuildFields } from '../../../src/rebuild-model';
export function fixtures() {
  const decision = emptyDecision();
  for (const f of decisionFields) decision[f] = 'Fictional decision ' + f;
  decision.options.forEach((o, i) =>
    Object.assign(o, {
      label: 'Option ' + i,
      tradeoff: 'Fictional cost',
      reversibility: 'Not yet known',
    }),
  );
  decision.chosenId = decision.options[0].id;
  return [
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      tool: 'next-move',
      status: 'Planned',
      card: {
        situation: 'Plan the fictional handover',
        action: 'Write three notes',
        start: 'After lunch',
        completion: 'Three notes are ready',
        obstacle: 'Distraction',
      },
    },
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      tool: 'decision-room',
      status: 'Decided',
      decision,
    },
    {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      tool: 'build-a-standard',
      status: 'Set',
      standard: Object.fromEntries(
        standardFields.map((f) => [
          f,
          ['keeping', 'violations'].includes(f) ? ['Fictional behavior'] : 'Fictional ' + f,
        ]),
      ),
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      tool: 'reset',
      status: 'Planned',
      plan: Object.fromEntries(resetFields.map((f) => [f, 'Fictional ' + f])),
    },
    {
      id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      tool: 'rebuild-map',
      status: 'Mapped',
      map: Object.fromEntries(
        rebuildFields.map((f) => [f, f === 'actions' ? ['Fictional action'] : 'Fictional ' + f]),
      ),
    },
    {
      id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      tool: 'do-it-now',
      status: 'Partial',
      record: {
        task: 'Check the fictional list',
        firstAction: 'Read the first item',
        beginState: 'Started',
        outcome: 'Read two items; one remains',
      },
    },
  ].map((r) => ({ schemaVersion: 1, ...r }));
}
export async function seed(page: Page) {
  await page.goto('/');
  await page.evaluate((records) => {
    const prefixes = [
      'execution-card',
      'decision-record',
      'personal-standard',
      'reset-plan',
      'rebuild-map',
      'action-record',
    ];
    records.forEach((r, i) =>
      localStorage.setItem(`oe:${prefixes[i]}:v1:${r.id}`, JSON.stringify(r)),
    );
    localStorage.setItem('unrelated-work23', 'leave intact');
    localStorage.setItem('oe:future:v9:fictional', 'unsupported raw record');
    localStorage.setItem('oe:malformed:fictional', '{not json');
  }, fixtures());
  await page
    .getByRole('contentinfo')
    .getByRole('link', { name: 'Saved work', exact: true })
    .click();
  await expect(page.locator('.saved-list > li')).toHaveCount(6);
}

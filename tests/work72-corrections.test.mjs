import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { beforeWork72Source } from './work72-preservation.mjs';
import delta from './fixtures/work72-corrections.json' with { type: 'json' };
import { loopScenario } from '../src/loop-practice-content.ts';

test('Work72 source corrections reverse exactly to Work71 and reject incidental edits', () => {
  assert.deepEqual(
    Object.keys(delta).sort(),
    [
      'index.html',
      'src/LoopPractice.tsx',
      'src/loop-practice-content.ts',
      'src/loop.css',
      'src/rebuild-app.css',
      'src/use-route.ts',
    ].sort(),
  );
  for (const path of Object.keys(delta)) {
    const source = readFileSync(path, 'utf8');
    assert.equal(
      beforeWork72Source(source, path),
      execFileSync('git', ['show', '4f3d8154ccf963b1a9530bd2c54dd18353d2e192:' + path], {
        encoding: 'utf8',
      }),
    );
    assert.throws(
      () => beforeWork72Source(source + '\n', path),
      /Unexpected (?:Work(?:72|73|80)|Batch[12]) bytes/,
    );
  }
});

test('shared restart keeps fact, consequence and correction distinct for all four incoming states', () => {
  const incoming = Object.entries(loopScenario.states)
    .filter(([, state]) => state.options.some((option) => option.next === 'restart'))
    .map(([id]) => id)
    .sort();
  assert.deepEqual(incoming, ['hide', 'miss', 'rest_escape', 'spiral']);
  const [fact, consequence, action] = loopScenario.states.restart.body;
  assert.match(fact, /^Name the fact: the agreed space was not cleared\./);
  assert.match(
    fact,
    /Did you avoid the task, expand it beyond what you could sustain, hide the miss/,
  );
  assert.doesNotMatch(fact, /you opened your phone/);
  assert.match(consequence, /somebody may have worked around it/);
  assert.match(consequence, /Neither does pretending it did not matter/);
  assert.match(action, /when safe to do so/);
  assert.match(action, /Put the phone aside if it was the escape/);
  assert.match(action, /Cut the plan back if you made it too large/);
  assert.deepEqual(
    loopScenario.states.restart.options.map((x) => x.next),
    ['correction', 'rest', 'spiral'],
  );
});

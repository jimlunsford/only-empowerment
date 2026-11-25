import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import changes from './fixtures/work75-dialog-focus.json' with { type: 'json' };
import { beforeWork75Source } from './work75-preservation.mjs';

test('Work75 opener correction reverses exactly to Work73 and rejects unrelated changes', () => {
  for (const path of Object.keys(changes)) {
    const source = readFileSync(path, 'utf8');
    const original = execFileSync(
      'git',
      ['show', '0fa1077ac3c2afffc50a9b195b5c85723052a3c9:' + path],
      {
        encoding: 'utf8',
      },
    );
    assert.equal(beforeWork75Source(source, path), original, path);
    assert.throws(() => beforeWork75Source(source + '\n', path), /Unexpected Work(?:75|80) bytes/);
    const edit = changes[path].edits.find((edit) => edit.after.length);
    const mutated = source.slice(0, edit.start) + 'x' + source.slice(edit.start + 1);
    assert.throws(() => beforeWork75Source(mutated, path), /Unexpected Work(?:75|80) bytes/);
  }
});

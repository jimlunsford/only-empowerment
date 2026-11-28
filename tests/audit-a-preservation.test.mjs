import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { beforeAuditASource } from './audit-a-preservation.mjs';

test('Batch A reverses only the approved package version and build commands', () => {
  for (const path of ['package.json', 'package-lock.json']) {
    const current = readFileSync(path, 'utf8');
    const baseline = execFileSync(
      'git',
      ['show', `9b7e6346839d0c71f07553299b526cebc10a4c44:${path}`],
      { encoding: 'utf8' },
    );
    assert.equal(beforeAuditASource(current, path), baseline);
    for (const changed of [current + '\n', current.replace('10.29.8', '10.29.9')]) {
      assert.equal(beforeAuditASource(changed, path), changed);
      assert.notEqual(beforeAuditASource(changed, path), baseline);
    }
  }
});

import { beforeAuditASource } from './audit-a-preservation.mjs';
import { beforeBatch3Source, beforeBatch3Reading } from './batch3-preservation.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/batch2-changes.json' with { type: 'json' };
const sha = (text) => createHash('sha256').update(text).digest('hex');
// Historical checks still see exact original bytes after only pinned Batch 2 edits reverse.
export function beforeBatch2Source(source, path) {
  source = beforeBatch3Source(beforeAuditASource(source, path), path);
  const change = changes[path];
  if (!change || change.historicalSha256.includes(sha(source))) return source;
  assert.equal(sha(source), change.afterSha256, 'Unexpected Batch2 bytes: ' + path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Batch 1 base changed: ' + path);
  return source;
}
export function beforeBatch2Reading(html) {
  html = beforeBatch3Reading(html);
  const current =
    'The PERIOD Code is one of four free learning frameworks on Only Empowerment, all by Jim Lunsford. Learn its six connected values through full lessons and practical examples.';
  const previous =
    'Only Empowerment is the free educational companion to The PERIOD Code by Jim Lunsford. Learn its six connected values through full lessons and practical examples.';
  const acronym =
    '<p>P = Purpose. E = Empowerment. R = Resilience. I = Integrity. O = Ownership. D = Discipline.</p>';
  assert.equal(html.split(current).length, 2);
  assert.equal(html.split(acronym).length, 2);
  return html.replace(current, previous).replace(acronym, '');
}

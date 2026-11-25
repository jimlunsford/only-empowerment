import assert from 'node:assert/strict';
import { beforeWork75Source } from './work75-preservation.mjs';
import { createHash } from 'node:crypto';
import changes from './fixtures/work73-changes.json' with { type: 'json' };
import editorial from './fixtures/work73-editorial.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');
export function beforeWork73Source(source, path) {
  source = beforeWork75Source(source, path);
  const change = changes[path];
  if (!change) return source;
  assert.equal(sha(source), change.afterSha256, 'Unexpected Work73 bytes: ' + path);
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, 'Work72 baseline changed: ' + path);
  return source;
}

export function beforeWork73Reading(html) {
  // The root PERIOD reading embeds Purpose; Integrity uses its standalone reader.
  for (const edit of editorial.filter((edit) => edit.id === 'P11')) {
    assert.equal(html.split(edit.after).length, 2, edit.id + ': exactly one approved paragraph');
    html = html.replace(edit.after, edit.before);
  }
  return html;
}

export const work73Editorial = Object.fromEntries(editorial.map((edit) => [edit.id, edit.after]));

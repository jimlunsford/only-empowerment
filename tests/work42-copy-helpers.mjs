import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import delta from './fixtures/work42-navigation-delta.json' with { type: 'json' };

// Preserve earlier whole-source checks after reversing only the reviewed navigation diff.
// Every replacement is unique; unexpected edits still fail the original baseline digest.
export function beforeWork42Source(source, path) {
  const change = delta.files[path];
  if (!change) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.split(edit.after).length, 2, `Unique Work 42 navigation edit: ${path}`);
    source = source.replace(edit.after, edit.before);
  }
  assert.equal(createHash('sha256').update(source).digest('hex'), change.beforeSha256, path);
  return source;
}

export function beforeWork42RootReading(html) {
  for (const edit of [...delta.rootReading.edits].reverse()) {
    assert.equal(html.split(edit.after).length, 2, 'Unique Work 42 reading transition edit');
    html = html.replace(edit.after, edit.before);
  }
  assert.equal(createHash('sha256').update(html).digest('hex'), delta.rootReading.beforeSha256);
  return html;
}

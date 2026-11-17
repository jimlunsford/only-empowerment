import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/work59-preservation.json' with { type: 'json' };

const sha = (text) => createHash('sha256').update(text).digest('hex');

// Exact Work 59 deltas are removed before older acceptance tests reconstruct
// the founder-approved Work 35, Work 39, Work 42 and Work 56 baselines.
export function beforeWork59Source(source, path) {
  const change = changes[path];
  if (!change) return source;
  assert.equal(sha(source), change.afterSha256, path + ' Work59 source differs');
  for (const edit of [...change.edits].reverse()) {
    assert.ok(edit.after, path + ' must not reverse an empty match');
    assert.equal(source.split(edit.after).length, 2, path + ' unexpected edit multiplicity');
    source = source.replace(edit.after, edit.before);
  }
  assert.equal(sha(source), change.beforeSha256, path + ' older baseline changed');
  return source;
}

export function beforeWork59RootReading(html) {
  assert.equal(sha(html), '2608481f3eb0a09d82872950ff8d9490dfc3373718598897aa29ff8513b57900');
  for (const value of [
    'ownership',
    'purpose',
    'resilience',
    'integrity',
    'discipline',
    'empowerment',
  ]) {
    const alias =
      '<span class="native-route-alias" id="/period/values/' +
      value +
      '" aria-hidden="true"></span>';
    assert.equal(html.split(alias).length, 2, 'Exactly one native alias: ' + value);
    html = html.replace(alias, '');
  }
  for (const value of ['ownership', 'purpose']) {
    const link = 'href="/read/' + value + '.html"';
    assert.equal(html.split(link).length, 2, 'Exactly one standalone link: ' + value);
    html = html.replace(link, 'href="#reading-' + value + '"');
  }
  const extra = '<a href="/read/index.html">Open complete text-only readings</a>. ';
  assert.equal(html.split(extra).length, 2);
  html = html.replace(extra, '');
  assert.equal(sha(html), '1dba1066066fbb56e1c1f3b6d553b05b8c6dab35af642de38ed6dc0b5a0b440c');
  return html;
}

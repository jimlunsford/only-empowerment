import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/audit-b-changes.json' with { type: 'json' };
import copy from './fixtures/audit-b-copy.json' with { type: 'json' };
const sha = (source) => createHash('sha256').update(source).digest('hex');
// Historical guards accept only the exact Batch B source bytes pinned here.
export function beforeAuditBSource(source, path) {
  const change = changes[path];
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, path);
  return source;
}
export function beforeAuditBCopy(value) {
  if (typeof value === 'string') return copy.find((edit) => edit.after === value)?.before ?? value;
  if (Array.isArray(value)) return value.map(beforeAuditBCopy);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, beforeAuditBCopy(item)]),
    );
  return value;
}
export function beforeAuditBReading(html) {
  const escape = (text) =>
    text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  for (const edit of copy) html = html.replaceAll(escape(edit.after), escape(edit.before));
  if (html.includes('<script defer src="/read/navigation.js"></script>'))
    html = html
      .replace('<script defer src="/read/navigation.js"></script>', '')
      .replace("default-src 'none'; script-src 'self';", "default-src 'none';");
  return html.replace('<link rel="icon" href="/favicon.svg">', '');
}

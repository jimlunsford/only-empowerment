import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import changes from './fixtures/book-links-changes.json' with { type: 'json' };
const sha = (text) => createHash('sha256').update(text).digest('hex');
// Reverse only exact book-link edits before historical teaching/layout guards.
export function beforeBookLinksSource(source, path) {
  const change = changes[path];
  if (!change || sha(source) !== change.afterSha256) return source;
  for (const edit of [...change.edits].reverse()) {
    assert.equal(source.slice(edit.start, edit.end), edit.after, path);
    source = source.slice(0, edit.start) + edit.before + source.slice(edit.end);
  }
  assert.equal(sha(source), change.beforeSha256, path);
  return source;
}
export function beforeBookLinksReading(html) {
  for (const id of ['B0HMM8MNQD', 'B0HQVNBCWP', 'B0HQXLMHF5', 'B0HR68MLGR']) {
    for (const attrs of ['', ' class="no-print"']) {
      html = html.replaceAll(
        `<p${attrs}><a href="https://www.amazon.com/dp/${id}" target="_blank" rel="noopener noreferrer">Paperback &amp; Kindle on Amazon (new tab)</a></p>`,
        '',
      );
    }
  }
  return html
    .replaceAll(
      '<a href="https://jimlunsford.com/books/" target="_blank" rel="noopener noreferrer">Books (new tab)</a>',
      '<a href="/#/period/book">About The PERIOD Code book</a>',
    )
    .replaceAll(
      'Optional Standard Card requires JavaScript.',
      'About The PERIOD Code book and Optional Standard Card require JavaScript.',
    );
}

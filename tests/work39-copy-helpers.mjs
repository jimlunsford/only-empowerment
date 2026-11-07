import assert from 'node:assert/strict';
import approved from './fixtures/work39-approved.json' with { type: 'json' };

export const supersessions = Object.fromEntries(
  approved.records.flatMap((r) => r.work35_supersedes.map((id) => [id, r])),
);

// Historical fixtures remain immutable. Validate every narrowly approved edit
// before reversing it for the earlier whole-source preservation assertions.
export function beforeWork39Source(source, path) {
  for (const edit of [...(approved.sourceEdits[path] ?? [])].reverse()) {
    const current = edit.after + '\n';
    assert.equal(source.split(current).length, 2, `Unique Work 39 source edit: ${path}`);
    source = source.replace(current, edit.before ? edit.before + '\n' : '');
  }
  return source;
}

export function beforeWork39(value, prefix) {
  const copy = structuredClone(value);
  const resolve = (field) => {
    if (!field.startsWith(prefix + '.')) return null;
    const keys = field.slice(prefix.length + 1).match(/[^.[\]]+/g);
    let owner = copy;
    for (const key of keys.slice(0, -1)) owner = owner[key];
    return [owner, keys.at(-1)];
  };
  for (const [id, field, index] of [
    ['E01', 'resilienceContent.lesson[4].paragraphs', 3],
    ['E02', 'integrityContent.lesson[3].paragraphs', 1],
  ]) {
    const target = resolve(field);
    if (target) {
      const array = target[0][target[1]];
      assert.equal(array[index], approved.records.find((r) => r.id === id).proposed, id);
      array.splice(index, 1);
    }
  }
  for (const record of approved.records.filter((r) => r.operation === 'replace')) {
    const target = resolve(record.field);
    if (target) {
      assert.equal(target[0][target[1]], record.proposed, record.id);
      target[0][target[1]] = record.original;
    }
  }
  return copy;
}

const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export function beforeWork39RootReading(html) {
  for (const id of ['C01', 'C02', 'C04', 'C05', 'C06', 'C07', 'L01', 'L02']) {
    const r = approved.records.find((r) => r.id === id);
    assert.equal(html.split(escape(r.proposed)).length, 2, id);
    html = html.replace(escape(r.proposed), escape(r.original));
  }
  const c3 = approved.records.find((r) => r.id === 'C03').proposed;
  const connected = `<h3>${escape(c3.heading)}</h3>${c3.paragraphs.map((p) => `<p>${escape(p)}</p>`).join('')}`;
  assert.ok(html.includes('\n    ' + connected));
  html = html.replace('\n    ' + connected, '');
  const paper = approved.records.find((r) => r.id === 'N01');
  const paperHtml = paper.proposed.map((p) => `<p>${escape(p)}</p>`).join('');
  assert.ok(html.includes(paperHtml));
  html = html.replace(paperHtml, `<p>${escape(paper.original)}</p>`);
  const opening =
    '<section class="standard-paper-reading"><h2 id="reading-standard-card" tabindex="-1">';
  assert.ok(html.includes(opening));
  html = html.replace(opening, '<h2>');
  assert.ok(html.includes('<div class="standard-paper-example-heading">'));
  html = html
    .replace('<div class="standard-paper-example-heading">', '')
    .replace(
      'Status: Chosen, not yet demonstrated</p></div>',
      'Status: Chosen, not yet demonstrated</p>',
    );
  return html.replace(
    'Educational adaptation by Only Empowerment.</p></section>',
    'Educational adaptation by Only Empowerment.</p>',
  );
}

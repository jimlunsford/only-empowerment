import { beforeBatch3Source } from './batch3-preservation.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { work62Base } from './work62-preservation.mjs';
import { rebuildTrees } from '../src/rebuild-content.ts';
import { rebuildFallback } from '../scripts/rebuild-fallback.ts';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const sourceHashes = {
  'all.html': '032667b11ad27e003b4358a5d2f4a4b682fddf7ed8b10d371524654a65ff0191',
  'end.html': '858c1678055302ca97292d002d52e0ad24a166633fecaa164ab580c4889395cb',
  'field-guide.css': 'c1ed17bd0c9773109d14b29722eacc89c7ef700e75c36300d78b5e33c0636643',
  'help.html': '7fa32c7825bce3cf5b46d41b667410f8134742543b552cbcf1ef6c6690b50914',
  'index.html': '8b245c2db183df02862f0c8cf884c51d00bc67e6cbc02e86f9984137b2548c29',
  'line.html': '5a3c2767ee0ce7ab5a722349646649a10b0043b67697ee18c09414119758f177',
  'negotiation.html': 'c28520eded0dfacf3c9f8f5634d5a647d05f7f0c97cf7782c5762e528413793a',
  'return.html': 'b5f72f3856566b3420b71a30cf1655c61aa94ba10572656c1d63c0b81f49a67f',
  'structure.html': 'ac6258e39477b1ba7e313f2b93055fb93604ee9f70eae8f8ee7f63169938664b',
  'trust.html': 'efcb4c7707c17212287e579bf9a7c5780075579af5c5b964dde5ce9c3c435baa',
};
const pages = [
  'index',
  'line',
  'structure',
  'return',
  'trust',
  'negotiation',
  'help',
  'end',
  'complete',
];
function visit(nodes, predicate) {
  return nodes.reduce(
    (total, node) =>
      total +
      (typeof node === 'string' ? 0 : (predicate(node) ? 1 : 0) + visit(node.children, predicate)),
    0,
  );
}
function strings(nodes) {
  return nodes.map((n) => (typeof n === 'string' ? n : strings(n.children))).join('');
}

// Only these seven inputs were approved for editorial changes.
const work62Hashes = {
  'all.html': 'da4f9eb42f15841b70bbf6b385154d0b3315b41acc047d3952543826ed330cf9',
  'end.html': '2617b876b96f5dcedb1c9c9dc83deffd0f2d483382f5fbb77259079a144fc31f',
  'help.html': 'b3478f16bdbe27f744baa2837160b0c1c53af720caa07b3f8e52449f7ff35831',
  'line.html': '8942d10e3478d96df3b90d1d8d66cfafac22968822acb96ff68028e5940db8b3',
  'return.html': '6e6861c04d0f12d917149ab90ae00241ad0ec15572a9e06267bc5eda144fb0aa',
  'structure.html': '45cdc73548d133a120cbd985319cd8f993cb6517b314301e7840533e35944e71',
  'trust.html': 'cc5ffeadd2d8d6485cd6a2b19b671e9cec11d6d3592876377f1bd131a09f1da8',
};
test('all original Work 53 inputs and current approved authored bytes match their pinned checksums', () => {
  for (const [file, digest] of Object.entries(sourceHashes)) {
    const path = 'docs/work53-source/' + file;
    assert.equal(sha(execFileSync('git', ['show', work62Base + ':' + path])), digest, file);
    assert.equal(
      sha(beforeBatch3Source(readFileSync(path, 'utf8'), path)),
      work62Hashes[file] ?? digest,
      file,
    );
  }
});

test('eight book movements and all six distinct teaching destinations remain available', () => {
  assert.deepEqual(Object.keys(rebuildTrees), pages);
  const opening = strings(rebuildTrees.index);
  for (const phrase of [
    'Raise the standard',
    'Build the structure',
    'Repeat the action',
    'Produce the proof.',
    'Rebuild self-trust.',
    'Stabilize identity.',
    'Reduce negotiation.',
    'Own the life.',
  ]) {
    assert.ok(opening.includes(phrase), phrase);
  }
  const html = rebuildFallback();
  for (const id of ['line', 'structure', 'return', 'trust', 'negotiation', 'help'])
    assert.ok(html.includes('id="' + id + '"'), id);
});

test('all 22 optional authored interactions stay native and require no submissions', () => {
  const sections = ['line', 'structure', 'return', 'trust', 'negotiation', 'help'];
  const inputs = sections.reduce((n, s) => n + visit(rebuildTrees[s], (x) => x.tag === 'input'), 0);
  const details = sections.reduce(
    (n, s) => n + visit(rebuildTrees[s], (x) => x.tag === 'details'),
    0,
  );
  const annotations = visit(
    rebuildTrees.line,
    (x) => x.tag === 'a' && /^#note-/.test(x.attrs.href || ''),
  );
  assert.equal(inputs, 11);
  assert.equal(details, 7);
  assert.equal(annotations, 4);
  assert.equal(inputs + details + annotations, 22);
  for (const section of pages)
    assert.equal(
      visit(rebuildTrees[section], (x) => ['form', 'script', 'textarea'].includes(x.tag)),
      0,
    );
});

test('rendered source has no unapproved links or runtime HTML injection', () => {
  for (const section of pages) {
    const links = [];
    visit(rebuildTrees[section], (x) => {
      if (x.tag === 'a') links.push(x.attrs.href);
      return false;
    });
    for (const href of links)
      assert.match(
        href,
        /^#(\/rebuild(?:\/[a-z]+(?:\?section=[a-z][a-z0-9-]*)?)?|\/loop\?section=(?:part-[2-5]|restart)|\/execution\/(?:negotiation|your-responsibility)|[a-z0-9-]+)$/,
      );
  }
  assert.doesNotMatch(
    readFileSync('src/Rebuild.tsx', 'utf8'),
    /dangerouslySetInnerHTML|innerHTML|eval\(/,
  );
});

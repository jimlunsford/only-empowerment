import assert from 'node:assert/strict';
import test from 'node:test';
import { lessonAnchors } from '../scripts/rebuild-fallback.ts';
import { rebuildTrees } from '../src/rebuild-content.ts';
import approved from './fixtures/work62-approved.json' with { type: 'json' };

const { rebuild } = approved;
function elements(nodes) {
  return nodes.flatMap((node) =>
    typeof node === 'string' ? [] : [node, ...elements(node.children)],
  );
}
function text(node) {
  return typeof node === 'string' ? node : node.children.map(text).join('');
}
function exactlyOnce(nodes, value) {
  const matches = nodes.filter(
    (n) => text(n) === value && n.children.every((c) => typeof c === 'string'),
  );
  assert.equal(matches.length, 1, value);
  return matches[0];
}
test('approved teaching is unique, ordered and uses the proper heading levels in both authored editions', () => {
  for (const [lesson, words] of Object.entries({
    structure: rebuild.structure,
    return: rebuild.return,
    trust: rebuild.trust,
    help: rebuild.help,
    end: rebuild.end,
  })) {
    for (const complete of [false, true]) {
      const all = elements(complete ? rebuildTrees.complete : rebuildTrees[lesson]);
      const module = complete
        ? all.find(
            (n) => n.tag === 'article' && (lesson === 'end' ? !n.attrs.id : n.attrs.id === lesson),
          )
        : undefined;
      const nodes = complete ? elements(module.children) : all;
      const sequence = words.map((word) => exactlyOnce(nodes, word));
      const headingIndexes = { structure: [0, 2], return: [0], trust: [0, 2] }[lesson] ?? [];
      assert.deepEqual(
        sequence.map((n) => n.tag),
        words.map((_, i) => (headingIndexes.includes(i) ? (complete ? 'h3' : 'h2') : 'p')),
      );
      const parent = nodes.find((n) => n.children.includes(sequence[0]));
      const index = parent.children.indexOf(sequence[0]);
      assert.deepEqual(parent.children.slice(index, index + sequence.length), sequence);
      const target = nodes.find(
        (n) =>
          n.attrs.id === (lesson === 'end' ? 'paper' : complete ? lesson + '-example' : 'example'),
      );
      assert.ok(target && nodes.indexOf(sequence.at(-1)) < nodes.indexOf(target), lesson);
    }
  }
});
test('the knowledge move preserves both distinct Line placements and the rejected fourth-question edit', () => {
  for (const [edition, example, knowledgeFirst] of [
    [rebuildTrees.line, 'example', false],
    [rebuildTrees.complete, 'line-example', true],
  ]) {
    const nodes = elements(edition);
    const firstPerson = exactlyOnce(nodes, rebuild.firstPerson);
    const knowledge = exactlyOnce(nodes, rebuild.line);
    const exampleNode = nodes.find((n) => n.attrs.id === example);
    assert.ok(nodes.indexOf(knowledge) < nodes.indexOf(exampleNode));
    assert.equal(nodes.indexOf(firstPerson) < nodes.indexOf(exampleNode), knowledgeFirst);
  }
  for (const edition of [rebuildTrees.end, rebuildTrees.complete]) {
    const paper = elements(edition).find((n) => n.attrs.id === 'paper');
    const pairs = elements(paper.children).filter((n) => ['dt', 'dd'].includes(n.tag));
    assert.equal(pairs.length, 8);
    assert.deepEqual(pairs.slice(-2).map(text), [
      'Come back after the day',
      rebuild.fourthQuestion,
    ]);
  }
});
test('the static generator refuses missing, duplicate, empty, misplaced or malformed example headings', () => {
  const good = '<h3 id="trust-example">Read the record</h3>';
  const intro = '<p class="case-intro">Fictional example. Inez</p>';
  const heading = '<h3>First teaching</h3><h3>Second teaching</h3>';
  for (const invalid of [
    '',
    good + good,
    good + "<h3 id='trust-example'>Duplicate</h3>",
    good.replace('Read the record', ' '),
    good.replace('</h3>', ''),
    good.replace('id="trust-example"', 'id="other"'),
    good + '<h3>Wrong boundary</h3>',
    good.replace('Read the record', '<h3>Nested heading</h3>'),
  ])
    assert.throws(() => lessonAnchors(heading + invalid + intro, 'trust'), /named example heading/);
});

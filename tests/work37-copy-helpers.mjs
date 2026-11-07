import assert from 'node:assert/strict';
import { parseCopy, fieldNode } from './editorial-copy-helpers.mjs';
import approved from './fixtures/work37-ownership-copy.json' with { type: 'json' };

// Work 35's whole-source digest still applies after removing only Work 37's
// separately checked additions. No pre-existing field or statement is ignored.
export function beforeWork37Source(source, path) {
  const ast = parseCopy(source);
  const edits = [];
  if (path === 'src/period-content.ts') {
    const declaration = ast.body.find((item) =>
      item.declaration?.declarations?.some((d) => d.id.name === 'ownershipFoundation'),
    );
    assert.ok(declaration, 'L01-L06 and P01 export exists');
    for (const [key, value] of Object.entries(approved.ownershipFoundation)) {
      if (typeof value === 'string') {
        assert.equal(fieldNode(ast, `ownershipFoundation.${key}`).value, value);
      } else {
        if (value.heading)
          assert.equal(fieldNode(ast, `ownershipFoundation.${key}.heading`).value, value.heading);
        value.paragraphs.forEach((text, index) =>
          assert.equal(
            fieldNode(ast, `ownershipFoundation.${key}.paragraphs[${index}]`).value,
            text,
          ),
        );
      }
    }
    assert.equal(source[declaration.range[1]], '\n');
    edits.push([declaration.range[0], declaration.range[1] + 1]);
  }
  if (path === 'src/period-practice-content.ts') {
    const declaration = ast.body
      .flatMap((item) => item.declaration?.declarations ?? [])
      .find((item) => item.id.name === 'practiceCopy');
    const object = declaration.init.expression;
    for (const [key, text] of Object.entries(approved.practiceCopy)) {
      assert.equal(fieldNode(ast, `practiceCopy.${key}`).value, text);
      const property = object.properties.find((item) => item.key.name === key);
      const [start, end] = property.range;
      assert.equal(source[end], ',');
      edits.push([start, end + 1]);
    }
  }
  for (const [start, end] of edits.sort((a, b) => b[0] - a[0]))
    source = source.slice(0, start) + source.slice(end);
  return source;
}

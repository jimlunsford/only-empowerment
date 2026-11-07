import assert from 'node:assert/strict';
import { parsers } from 'prettier/plugins/typescript';
import fixture from './fixtures/work35-editorial.json' with { type: 'json' };

// Preserve earlier independent content digests while allowing only the exact
// founder-approved replacements. Every restored value is checked first.
export function beforeWork35(value, prefix) {
  const copy = structuredClone(value);
  for (const record of fixture.records.filter((record) => record.field.startsWith(prefix + '.'))) {
    const keys = record.field.slice(prefix.length + 1).match(/[^.[\]]+/g);
    let owner = copy;
    for (const key of keys.slice(0, -1)) owner = owner[key];
    const key = keys.at(-1);
    assert.equal(owner[key], record.approved, record.id);
    owner[key] = record.original;
  }
  return copy;
}

export function parseCopy(source) {
  return parsers.typescript.parse(source, {});
}

function unwrap(node) {
  while (node?.type === 'TSAsExpression' || node?.type === 'TSSatisfiesExpression') {
    node = node.expression;
  }
  return node;
}

// Resolve the owning export and every property/index. Identical strings in
// different fields (notably D22/D23) can never select each other's location.
export function fieldNode(ast, field) {
  const parts = field.match(/[^.[\]]+/g);
  const [name, ...keys] = parts;
  let node = ast.body
    .flatMap((item) => item.declaration?.declarations ?? [])
    .find((item) => item.id.name === name)?.init;
  for (const key of keys) {
    node = unwrap(node);
    node =
      node?.type === 'ArrayExpression'
        ? node.elements[Number(key)]
        : node?.properties?.find((item) => (item.key.name ?? item.key.value) === key)?.value;
  }
  node = unwrap(node);
  assert.equal(node?.type, 'Literal', `String field must resolve: ${field}`);
  assert.equal(typeof node.value, 'string', field);
  return node;
}

export function headingNodes(ast, text) {
  const found = [];
  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (
      (node.type === 'Literal' || node.type === 'JSXText') &&
      typeof node.value === 'string' &&
      node.value.trim() === text
    ) {
      found.push(node);
    }
    for (const [key, value] of Object.entries(node)) {
      if (['loc', 'range', 'tokens', 'comments'].includes(key)) continue;
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') visit(value);
    }
  }
  visit(ast);
  return found;
}

export function nodeTextReplacement(node, value) {
  return node.type === 'JSXText'
    ? node.value.replace(node.value.trim(), value)
    : JSON.stringify(value);
}

export function patchLocations(source, edits) {
  let previous = source.length + 1;
  for (const { node, value } of [...edits].sort((a, b) => b.node.range[0] - a.node.range[0])) {
    const [start, end] = node.range;
    assert.ok(end <= previous, 'Editorial replacements must not overlap');
    source = source.slice(0, start) + nodeTextReplacement(node, value) + source.slice(end);
    previous = start;
  }
  return source;
}

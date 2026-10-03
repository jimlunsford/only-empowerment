import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const standard = 'See docs/UI-DESIGN-STANDARD.md.';
const retired = /\b(?:eyebrow|tool-number|availability|step-number|lesson-number)\b/;
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );

test('user-facing markup and CSS do not restore retired decorative classes', () => {
  for (const path of files('src')) {
    const source = readFileSync(path, 'utf8');
    if (/\.tsx$/.test(path)) {
      // Inspect class assignments, not ordinary English in body copy or lessons.
      for (const [attribute] of source.matchAll(
        /\bclass(?:Name)?\s*=\s*(?:"[^"]*"|'[^']*'|\{[^}]*\})/g,
      ))
        assert.doesNotMatch(
          attribute,
          retired,
          `${path}: decorative labels and indices are retired. ${standard}`,
        );
    } else if (/\.css$/.test(path)) {
      assert.doesNotMatch(
        source.replace(/\/\*[\s\S]*?\*\//g, ''),
        /\.(?:eyebrow|tool-number|availability|step-number|lesson-number)(?![\w-])/,
        `${path}: decorative label styles are retired. ${standard}`,
      );
    }
  }
});

test('fully clickable tool cards have no repeated Try-tool pills or nested controls', () => {
  const source = readFileSync('src/main.tsx', 'utf8');
  const grid = source.match(/function ToolGrid\(\) \{([\s\S]*?)\n\}\n/);
  assert.ok(grid, 'Update this structural guard if ToolGrid moves.');
  const cards = [...grid[1].matchAll(/<a\b[^>]*class="tool-card"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.ok(cards.length, 'Tool cards retain their link affordance.');
  for (const [, card] of cards) {
    assert.doesNotMatch(
      card,
      /\bTry\s+(?:Decision Room|Next Move|Build a Standard|Reset|Rebuild Map|Do It Now|\$?\{)/,
      `A fully clickable tool card does not need a repeated Try-tool pill. ${standard}`,
    );
    assert.doesNotMatch(
      card,
      /<(?:button|a)\b/,
      `Tool cards must not contain nested controls. ${standard}`,
    );
  }
});

test('PageIntro does not regain a decorative label API', () => {
  const source = readFileSync('src/components/shared.tsx', 'utf8');
  const declaration = source.match(/export function PageIntro\(([\s\S]*?)\) \{/);
  assert.ok(declaration, 'Update this structural guard if PageIntro moves.');
  assert.doesNotMatch(
    declaration[1],
    /\blabel\b/,
    `PageIntro uses a title and body without a redundant label layer. ${standard}`,
  );
});

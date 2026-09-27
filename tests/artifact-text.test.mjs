import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { transformWithOxc } from 'vite';

// Compile the real TSX module without adding a runtime package or a test-only API.
const source = readFileSync(
  new URL('../src/components/artifact-text.tsx', import.meta.url),
  'utf8',
);
const compiled = (
  await transformWithOxc(source, 'artifact-text.tsx', {
    jsx: { runtime: 'automatic', importSource: 'preact' },
  })
).code.replace('"preact/jsx-runtime"', JSON.stringify(import.meta.resolve('preact/jsx-runtime')));

for (const available of [true, false]) {
  test(`artifact module preserves text and break opportunities with Segmenter ${available ? 'present' : 'absent'}`, async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'Segmenter');
    try {
      if (!available)
        Object.defineProperty(Intl, 'Segmenter', { value: undefined, configurable: true });
      // A distinct module URL forces initialization in each API condition.
      const { renderStandardText } = await import(
        `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${available}`
      );
      const token = '👩🏽‍💻e\u0301🇺🇸漢字'.repeat(30);
      const authored = `  <script>"&'</script>\n${token}\t${'A'.repeat(2000)}  `;
      const rendered = renderStandardText(authored);
      assert.equal(rendered.filter((part) => typeof part === 'string').join(''), authored);
      const breaks = rendered.filter((part) => typeof part !== 'string');
      assert.ok(breaks.length > 0);
      assert.ok(breaks.every((part) => part.type === 'wbr'));
      const units = available
        ? Array.from(
            new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(token),
            (unit) => unit.segment,
          )
        : Array.from(token);
      const chunks = renderStandardText(token).filter(
        (part) => typeof part === 'string' && part.length,
      );
      assert.deepEqual(
        chunks,
        Array.from({ length: Math.ceil(units.length / 4) }, (_, i) =>
          units.slice(i * 4, i * 4 + 4).join(''),
        ),
      );
      assert.ok(chunks.every((chunk) => chunk.isWellFormed()));
      assert.deepEqual(renderStandardText('  Ordinary prose.\n'), ['  Ordinary prose.\n']);
    } finally {
      Object.defineProperty(Intl, 'Segmenter', descriptor);
    }
  });
}

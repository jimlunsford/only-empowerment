import type { ComponentChildren } from 'preact';
const graphemes =
  typeof Intl.Segmenter === 'function'
    ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    : undefined;
// WebKit can retain an overlong final fragment when very long tokens are enlarged.
// Discretionary breaks change no text. Prefer graphemes; older browsers use
// code points, preserving surrogate pairs but possibly splitting grapheme clusters.
export function renderStandardText(value: string) {
  return value.split(/(\S{64,})/u).flatMap((part, i) => {
    if (!(i % 2)) return [part];
    const units = graphemes
      ? Array.from(graphemes.segment(part), (unit) => unit.segment)
      : Array.from(part);
    const fragments: ComponentChildren[] = [];
    for (let offset = 0; offset < units.length; offset += 4) {
      if (offset) fragments.push(<wbr key={`${i}-${offset}`} />);
      fragments.push(units.slice(offset, offset + 4).join(''));
    }
    return fragments;
  });
}

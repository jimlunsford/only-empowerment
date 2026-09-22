import type { ComponentChildren } from 'preact';
const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
// WebKit can retain an overlong final fragment when very long tokens are enlarged.
// Discretionary breaks change no text and never split a Unicode grapheme cluster.
export function renderStandardText(value: string) {
  return value.split(/(\S{64,})/u).flatMap((part, i) => {
    if (!(i % 2)) return [part];
    const units = Array.from(graphemes.segment(part), (unit) => unit.segment);
    const fragments: ComponentChildren[] = [];
    for (let offset = 0; offset < units.length; offset += 4) {
      if (offset) fragments.push(<wbr key={`${i}-${offset}`} />);
      fragments.push(units.slice(offset, offset + 4).join(''));
    }
    return fragments;
  });
}

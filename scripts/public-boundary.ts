// These modules exist only in preserved pre-retirement history, never a public chunk.
export const retiredModules = [
  'DecisionRoom',
  'NextMove',
  'BuildStandard',
  'Reset',
  'RebuildMap',
  'DoItNow',
  'SavedWork',
  'use-local-work',
  'model',
  ...['decision-room', 'next-move', 'standard', 'reset', 'rebuild', 'do-it-now'].flatMap((name) => [
    name + '-model',
    name + '-lessons',
  ]),
  ...['cards', 'decisions', 'standards', 'resets', 'rebuilds', 'actions'].map(
    (name) => 'local-' + name,
  ),
];
export function assertPublicModules(ids: string[]) {
  for (const id of ids) {
    const source = id
      .replaceAll('\\', '/')
      .split('/src/')[1]
      ?.replace(/\.(tsx?|jsx?)(?:\?.*)?$/, '');
    if (source && retiredModules.includes(source))
      throw new Error(`Retired implementation in public bundle: ${source}`);
  }
}

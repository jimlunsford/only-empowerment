// Shared orientation and destinations for interactive and script-free editions.
export const frameworkAuthor = [
  "I'm Jim Lunsford, author of these four frameworks.",
  'I write about values, rebuilding, discipline and putting decisions into action.',
] as const;
export const frameworkChoices = [
  {
    id: 'period',
    title: 'The PERIOD Code',
    situation: 'You need standards to live by.',
    reading: '/#teaching-order',
  },
  {
    id: 'rebuild',
    title: 'How to Rebuild Yourself',
    situation: 'You need to rebuild your daily life.',
    reading: '/read/rebuild.html',
  },
  {
    id: 'loop',
    title: 'The Discipline Loop',
    situation: 'You keep starting, then losing consistency.',
    reading: '/read/loop.html',
  },
  {
    id: 'execution',
    title: 'Pure Execution Mode',
    situation: 'You know the next move but keep putting it off.',
    reading: '/read/execution.html',
  },
] as const;

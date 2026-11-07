import { periodIntro, periodBook } from './period-content.ts';

// Work 32 copy approved in Product Vision v0.65, with the redundant reflection
// sentence removed. Shared by the application and build-time root reading.
// Keep lesson/book-route copy in period-content unchanged.
export const homepage = {
  title: 'Your values have to show up.',
  titleStart: 'Your values have to ',
  titleEmphasis: 'show up.',
  lead: 'Only Empowerment is the free educational companion to The PERIOD Code by Jim Lunsford. Learn its six connected values through full lessons and practical examples.',
  opening: 'Knowing what matters is a start. The work is putting it into action.',
  start: 'Start with an ordinary moment',
  moment: 'You owe someone an update.',
  notice: "Before you read on, notice what you're waiting for.",
  comparison: periodIntro.comparison,
  ownHeading: 'What you can own',
  own: 'Send the honest update before the deadline. Say what is finished, what is delayed, and what you can realistically do next.',
  connection:
    'Ownership puts the responsibility for that response with you. Integrity keeps the update truthful. Discipline means following through.',
  valueHeading: 'A value becomes visible in behavior.',
  value:
    'A value tells you what matters. A standard gives that value a line to live by. Sending the update is the action that makes it visible.',
  evidence: 'Understanding this example is a start. Your behavior supplies the evidence.',
  reflectionHeading: 'Put it beside your own day.',
  reflection: 'What responsibility are you waiting to feel ready for?',
  privateReflection:
    'Name it privately. Then name one action you can take without waiting for someone else to change. It might be a correction, a boundary, or a request for help.',
  responsibility:
    "You are responsible for your response, not another person's harmful actions. Getting help can be part of taking ownership.",
  whyHeading: 'Why PERIOD?',
  why: 'PERIOD marks the end of the old negotiation. You stop making responsibility wait for a better mood or an easier day. You act on a standard, and return to it when you fall short.',
  connected:
    'The Code is a connected standard for living. One action gives you somewhere to begin; all six values continue to shape how you live.',
  valuesHeading: 'Start with Ownership. Keep the whole Code.',
  values:
    'Ownership gives you responsibility. Purpose gives it direction. Resilience protects that direction under pressure. Integrity keeps it honest. Discipline turns it into repeated action. Empowerment uses that strength to help others stand.',
  order:
    'The teaching order follows the work of rebuilding, rather than the letters in PERIOD. You can open any lesson and return to it as life requires.',
  continue: 'Start with Ownership',
  availability:
    'All six lessons are free. No account, written answer, or book purchase is required. The numbers show teaching order, not completion.',
  originHeading: 'Built from lived experience.',
  origin: periodIntro.origin,
  author: 'The PERIOD Code by Jim Lunsford',
  bookHeading: 'The complete book.',
  book: 'The complete book develops the Code’s origins, the six values, and why they are taught in this order.',
  bookLink: 'Explore the book and read a sample',
  bookUrl: periodBook.url,
  access:
    "Read the lessons without JavaScript. Interactive lesson examples and the optional Standard Card use JavaScript. The card's draft stays only in the open tab; copy or print it to keep it.",
  privacy: 'Privacy & source',
  privacyExplanation: ' explains hosting logs, retired tools, and software permissions.',
  readingBoundary:
    'The complete readings continue below or open from the lesson links above. Interactive lesson examples and the optional Standard Card require JavaScript.',
  legacy:
    'Earlier tools and Saved work are retired. Existing browser-local records are left untouched. To remove old local data without JavaScript, close other tabs for this site and use your browser’s settings for this site’s stored data. This removes local site data, not clipboard copies, PDFs, backups, or hosting logs.',
} as const;

export const homepageAnchors = {
  '/period/first-moment': 'first-moment',
  '/period/why': 'why-period',
  '/period/teaching-order': 'teaching-order',
} as const;

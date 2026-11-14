import { resilienceContent } from './period-resilience-content.ts';

export type PressureNote = (typeof resilienceContent.states)[number];
export type PressureId = PressureNote['id'];
// These are fictional reading conditions only. Unknown input recovers to useful persistence.
export const pressureNote = (id: unknown): PressureNote =>
  resilienceContent.states.find((note) => note.id === id) ?? resilienceContent.states[0];

export const resilienceUi = {
  refinement:
    'Keep doing useful work when boredom is the problem. Change a method that is blocked. Rest when capacity requires it. Leave harm rather than proving you can endure more of it. Resilience asks which response protects the life you are building.',
  setupHeading: 'One aim. Different conditions.',
  selectorHelp: 'Five independent versions. Change the facts, not a personal answer.',
  currentHeading: 'What Alex planned',
  revisionHeading: 'Protect the aim. Respond to the facts.',
  retainHeading: 'What remains worth protecting',
  costHeading: 'What it costs or leaves unresolved',
  reviewHeading: 'What to review',
  returnLabel: 'Read what Alex actually does',
  readingLabel: 'Read every pressure note and response',
  readingHeading: 'All five pressure notes and responses',
  readingIntro: 'Each note is a separate version of Alex’s case. You can read them in any order.',
  closeHeading: 'Continue the lesson: Keep going in a way you can stand behind',
  close:
    'Resilience protects the direction. Integrity asks whether the way you continue is honest and aligned.',
  unavailable: 'The interactive view is unavailable. Read all five pressure notes below.',
} as const;

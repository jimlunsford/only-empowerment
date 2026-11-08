import { periodValues } from './period-content.ts';
import { purposeBridge, purposeOwnershipHandoff } from './period-purpose-content.ts';
import { resilienceContent } from './period-resilience-content.ts';
import { integrityContent } from './period-integrity-content.ts';
import { disciplineContent } from './period-discipline-content.ts';

// Teaching order is not acronym order or a completion state.
export const lessonOrder = [
  'ownership',
  'purpose',
  'resilience',
  'integrity',
  'discipline',
  'empowerment',
] as const;
export type LessonValue = (typeof lessonOrder)[number];
const roles = [
  'Responsibility',
  'Direction',
  'Endurance',
  'Alignment',
  'Repeated action',
  'Strength outward',
] as const;
const ownership = periodValues[0].lesson;
const resilience = resilienceContent.lesson.find((section) => section.id === 'L10')!;
const integrity = integrityContent.lesson.find((section) => section.id === 'L10')!;

// The first five bridges reuse approved teaching verbatim. The sixth closes the connected Code.
export const lessonBridges = {
  ownership: {
    heading: ownership.connectionHeading,
    paragraphs: [ownership.connection, purposeOwnershipHandoff],
    note: '',
  },
  purpose: {
    heading: 'Direction will meet pressure',
    paragraphs: purposeBridge.slice(0, 2),
    note: purposeBridge[2],
  },
  resilience: {
    heading: resilience.heading,
    paragraphs: resilience.paragraphs,
    note: integrityContent.navigation.resilience_bridge,
  },
  integrity: {
    heading: integrity.heading,
    paragraphs: integrity.paragraphs,
    note: integrityContent.availability,
  },
  discipline: {
    heading: disciplineContent.lesson.nextTitle,
    paragraphs: [disciplineContent.lesson.nextDescription],
    note: '',
  },
  empowerment: {
    heading: 'Keep the whole Code in practice',
    paragraphs: [
      'Empowerment carries your strength into how you help others. Ownership, Purpose, Resilience, Integrity and Discipline still belong in that decision.',
      'You have reached the sixth value in the teaching order. Return to any value as life requires. The Code remains one connected standard for living.',
    ],
    note: '',
  },
} as const;

export function lessonTransition(value: LessonValue, reading = false) {
  const index = lessonOrder.indexOf(value);
  const name = (id: LessonValue) => id[0].toUpperCase() + id.slice(1);
  const href = (id: LessonValue) =>
    reading
      ? id === 'ownership' || id === 'purpose'
        ? (value === 'ownership' || value === 'purpose' ? '#reading-' : '/#reading-') + id
        : '/read/' + id + '.html'
      : '#/period/values/' + id;
  const point = (position: number) => ({
    label: String(position + 1).padStart(2, '0') + ' ' + name(lessonOrder[position]),
    role: roles[position],
  });
  const nextValue = lessonOrder[index + 1];
  return {
    current: point(index),
    next: nextValue ? point(index + 1) : { label: 'The connected Code', role: 'One standard' },
    forward: nextValue
      ? { href: href(nextValue), label: 'Continue to ' + name(nextValue) }
      : {
          href: reading ? '/#teaching-order' : '#/period/teaching-order',
          label: 'Review all six values',
        },
    previous:
      index > 0
        ? { href: href(lessonOrder[index - 1]), label: 'Return to ' + name(lessonOrder[index - 1]) }
        : null,
    ownership:
      value === 'empowerment' ? { href: href('ownership'), label: 'Return to Ownership' } : null,
  };
}

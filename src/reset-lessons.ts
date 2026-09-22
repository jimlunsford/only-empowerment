const period = 'https://jimlunsford.com/period-code/';
const rebuild = 'https://jimlunsford.com/how-to-rebuild-yourself/';
const loop = 'https://jimlunsford.com/discipline-loop/';
export const resetLessons = {
  slip: {
    heading: 'Name what slipped.',
    title: 'Behavior you can correct.',
    text: 'The miss matters because the standard matters. Describe what happened clearly enough to correct it. Name the behavior without making it a verdict on who you are.',
    question: 'What slipped?',
    example:
      '“I am lazy” judges the person. “I skipped the work I had committed to doing” identifies behavior. “I answered after I had decided not to engage” gives you something more useful than “I am terrible at boundaries.”',
    sources: [period, loop, 'https://jimlunsford.com/recovery-standard-repair-over-perfection/'],
  },
  standard: {
    heading: 'Return to a clear line.',
    title: 'Check the standard deliberately.',
    text: 'A miss does not automatically mean the line should change. Changed circumstances may call for deliberate review. Keep why the standard matters in view, and decide whether it still applies before planning your return.',
    question: 'What standard are you returning to?',
    sources: [
      period,
      rebuild,
      'https://jimlunsford.com/recovery-standard-standards-must-adapt/',
      'https://jimlunsford.com/discipline-dispatch-stop-negotiating/',
    ],
  },
  ownership: {
    heading: 'Own your part.',
    title: 'Responsibility has a boundary.',
    text: 'Name the choice, action, inaction, preparation, communication, or follow-through that belongs to you now. You do not have to accept blame for another person’s conduct or circumstances you could not control.',
    question: 'What part of this miss is yours to own now?',
    sources: [period],
  },
  weakPoint: {
    heading: 'Find the repairable weak point.',
    title: 'Useful context leads to repair.',
    text: 'What happened around the behavior may reveal something you can repair: preparation, fatigue, environment, a boundary, missing support, or negotiation under pressure. One short reflection is enough. Context does not erase your part in the behavior.',
    question: 'What made this miss easier, or made the standard harder to keep?',
    sources: [rebuild, loop],
  },
  correction: {
    heading: 'Correct what happened.',
    title: 'Correction should improve reality.',
    text: 'Choose what needs doing now to address the miss or its effects. That may mean finishing a responsibility, communicating honestly, or restoring a boundary. Suffering, deprivation, and humiliation are not substitutes for repair. You choose the correction.',
    question: 'What needs to be corrected now?',
    sources: [loop, 'https://jimlunsford.com/discipline-dispatch-return-faster/'],
  },
  structure: {
    heading: 'Repair the support around the standard.',
    title: 'Give the next choice support.',
    text: 'Connect the repair to the weak point you named. Preparation, routines, environment, boundaries, reminders, or support can make the behavior easier to repeat. Structure supports your choices. It does not make the choice for you.',
    question:
      'What structure will you restore or change so this standard is easier to keep next time?',
    sources: [rebuild, 'https://jimlunsford.com/recovery-standard-systems-hold/'],
  },
  proof: {
    heading: 'Define the next proof.',
    title: 'Behavior makes the return visible.',
    text: 'Choose one observable action substantially within your control, small enough to carry out and meaningful enough to demonstrate the standard is active again. Your immediate correction may also be your next proof when the same action does both. Create proof today when the behavior is available today. Otherwise name the next real opportunity clearly enough that you cannot quietly move it. “Someday” leaves the return undefined.',
    question: 'What proof will you create next, and at what next real opportunity?',
    sources: [loop, 'https://jimlunsford.com/discipline-dispatch-return-faster/'],
  },
} as const;
export const governedResetLessons = Object.entries(resetLessons).map(([key, lesson]) => ({
  key,
  ...lesson,
  framework: 'PERIOD values, rebuild process, and Discipline Loop reinforcement',
  canonical: loop,
  contextSource: 'https://jimlunsford.com/core-frameworks/',
  reviewed: '2026-09-22',
  tool: 'reset',
  reviewer: 'Codex implementation review; Jim Lunsford product approval pending',
}));

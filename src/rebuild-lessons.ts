const rebuild = 'https://jimlunsford.com/how-to-rebuild-yourself/';
const loop = 'https://jimlunsford.com/discipline-loop/';
export const rebuildLessons = {
  context: {
    heading: 'Name the area. Start from facts.',
    title: 'One meaningful area.',
    text: 'Choose one area clearly enough to act on. Describe the current behavior and conditions without making them a verdict on yourself. You do not need your whole history or a plan for your entire life.',
    question: 'What are you rebuilding?',
    example:
      '“I am spending without a plan and not reviewing where the money goes” names a pattern you can work on. “I am a failure with money” turns that pattern into an identity. “My training has become inconsistent and I do not protect time for it” gives you a starting point.',
    sources: [rebuild],
  },
  standard: {
    heading: 'Choose the line you are raising to.',
    title: 'A standard gives the rebuild direction.',
    text: 'A goal describes an outcome. A standard describes behavior or a boundary you choose and substantially own. “Lose 30 pounds” names an outcome; your standard names how you choose to behave. You decide whether your wording needs revision.',
    question: 'What standard are you rebuilding toward?',
    sources: [rebuild, 'https://jimlunsford.com/period-code/'],
  },
  structure: {
    heading: 'Give the standard structure.',
    title: 'Make repetition more reliable.',
    text: 'Consider the schedule, preparation, environment, boundaries, tools, or support that would make your chosen behavior easier to repeat or harder to abandon. Connect the structure to your standard. More systems are not automatically better, and needing support is not weakness.',
    question: 'What structure needs to exist around this standard?',
    sources: [rebuild, 'https://jimlunsford.com/what-discipline-really-is/'],
  },
  actions: {
    heading: 'Choose what you will repeat.',
    title: 'Behavior carries the rebuild.',
    text: 'Name one to five actions you can later recognize as done or not done. “Try harder” leaves the behavior unclear. A repeatable action gives you something to carry out. Include timing or frequency if it helps you; this map will not schedule or track it.',
    question: 'What actions will you repeat?',
    sources: [rebuild, loop],
  },
  proof: {
    heading: 'Define what evidence will count.',
    title: 'Proof comes from behavior.',
    text: 'Describe the observable evidence your actions will create: work finished, responsibilities met, or boundaries kept. Intention, inspiration, and reading this map are not proof. Use numbers only when they help. The map defines your proof; it does not track or score it.',
    question: 'What will count as proof that the rebuild is happening?',
    sources: [rebuild, loop],
  },
  trust: {
    heading: 'Let evidence build reliability.',
    title: 'Self-trust has something to stand on.',
    text: 'Name the behavior you need to become able to rely on yourself to repeat. Identity becomes believable as behavior supplies evidence; you do not need an affirmation here. Decide which repeated debate should shrink as that proof accumulates. Deliberate adaptation to changed circumstances is different from bargaining away a chosen line under pressure.',
    question: 'What do you need to become able to trust yourself to do consistently?',
    sources: [
      rebuild,
      loop,
      'https://jimlunsford.com/how-to-rebuild-self-trust-in-recovery/',
      'https://jimlunsford.com/how-to-rebuild-your-identity-after-addiction/',
    ],
  },
  firstMove: {
    heading: 'Name the first executable move.',
    title: 'Begin the system you have mapped.',
    text: 'Choose one concrete action substantially within your control that starts the structure or repeated behavior. You do not have to complete the whole rebuild now. The map becomes useful when you act on it.',
    question: 'What is the first move?',
    sources: [rebuild, 'https://jimlunsford.com/pure-execution-mode/'],
  },
} as const;
export const governedRebuildLessons = Object.entries(rebuildLessons).map(([key, lesson]) => ({
  key,
  ...lesson,
  framework: 'Rebuild process, supported by PERIOD, Discipline Loop, and execution',
  canonical: rebuild,
  contextSource: 'https://jimlunsford.com/core-frameworks/',
  reviewed: '2026-09-24',
  tool: 'rebuild-map',
  reviewer: 'Codex implementation review; Jim Lunsford product approval pending',
}));

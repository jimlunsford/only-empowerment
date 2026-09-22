const period = 'https://jimlunsford.com/period-code/';
const rebuild = 'https://jimlunsford.com/how-to-rebuild-yourself/';
export const standardLessons = {
  context: {
    title: 'Choose one area.',
    heading: 'Where do you need a clearer standard?',
    text: 'Start with a situation where your own behavior needs a clearer line. A few words of context are enough to make this standard useful later. You do not need to explain your history.',
    question: 'Where is this standard needed?',
    sources: [period],
  },
  line: {
    title: 'A line you can act on.',
    heading: 'What is the standard?',
    text: 'A goal describes an outcome you want. A standard describes behavior or a boundary you choose to govern yourself by. Other people and circumstances can affect the outcome. Define the part you can own.',
    question: 'What standard are you choosing?',
    example:
      '“Have a better relationship” names a hoped-for outcome. “When I need time before answering, I say so and agree when to return to the conversation” describes behavior. A standard can be a minimum, boundary, cadence, responsibility, or something you refuse to do. Use your own form.',
    sources: [period, rebuild],
  },
  reason: {
    title: 'Keep the reason visible.',
    heading: 'Why does this line matter?',
    text: 'Name what this standard protects or makes possible. A clear reason gives you something to return to when keeping it becomes inconvenient. It can be an ordinary responsibility; it does not need to sound impressive.',
    question: 'Why does this standard matter to you?',
    sources: [period],
  },
  behavior: {
    title: 'Make the line recognizable.',
    heading: 'What would your behavior show?',
    text: '“Try harder,” “do better,” “be productive,” “be healthy,” “communicate more,” and “stay focused” can mean different things under pressure. Define what those words mean in behavior. Could you later tell whether you met the line? Exact numbers are useful only when they fit.',
    question: 'What keeps the line, and what crosses it?',
    example:
      'Keeping a communication boundary might mean naming when you will return to a paused conversation. Crossing it might mean disappearing without that agreement. Describe behavior, not a label for the person. One meaningful item on each side is enough; add up to five if needed.',
    sources: [period, rebuild],
  },
  structure: {
    title: 'Give the standard support.',
    heading: 'What helps it hold?',
    text: 'Preparation, routines, environment, reminders, boundaries, tools, and support can make your standard easier to repeat. Choose what fits. Accountability can help without taking ownership away from you. You do not have to do everything alone.',
    question: 'What structure helps protect this standard?',
    sources: [rebuild, 'https://jimlunsford.com/recovery-standard-systems-hold/'],
  },
  pressure: {
    title: 'Adapt deliberately.',
    heading: 'What can change, and what holds?',
    text: 'Changed responsibilities, new information, health or safety needs, or a poorly designed rule can justify review. Decide what would prompt that review and how you will make the change deliberately. Also name what discomfort alone will not be allowed to rewrite. You decide the difference.',
    question: 'How will you distinguish adaptation from negotiation?',
    example:
      'Ask whether the circumstances changed, the method needs repair, or you simply want relief from keeping the line. A review can change the standard itself when necessary. Urgent health or safety needs do not have to wait for a scheduled review.',
    sources: [
      'https://jimlunsford.com/recovery-standard-standards-must-adapt/',
      'https://jimlunsford.com/discipline-dispatch-stop-negotiating/',
    ],
  },
  correction: {
    title: 'Define the return.',
    heading: 'What happens after a miss?',
    text: 'A miss matters, but it does not erase the standard or define your character. Choose an immediate correction you can carry out: acknowledge it, repair what was affected, restore support, or return to the behavior. Correction addresses the miss; punishment and symbolic suffering do not repair it.',
    question: 'If you miss this standard, what is your immediate correction?',
    example:
      'Keep this to your correction rule. You are not analyzing an actual incident here. A repeated miss calls for attention and repair, not a quiet change in what you accept.',
    sources: [
      period,
      'https://jimlunsford.com/recovery-standard-repair-over-perfection/',
      'https://jimlunsford.com/discipline-dispatch-return-faster/',
    ],
  },
} as const;
export const governedStandardLessons = Object.entries(standardLessons).map(([key, lesson]) => ({
  key,
  ...lesson,
  framework: 'The PERIOD Code with standards and rebuild doctrine',
  canonical: period,
  contextSource: 'https://jimlunsford.com/core-frameworks/',
  reviewed: '2026-09-22',
  tool: 'build-a-standard',
  reviewer: 'Codex implementation review; Jim Lunsford product approval pending',
}));

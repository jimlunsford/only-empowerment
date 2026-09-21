const source = {
  framework: 'The PERIOD Code',
  canonical: 'https://jimlunsford.com/period-code/',
  contextSource: 'https://jimlunsford.com/core-frameworks/',
  reviewed: '2026-09-21',
  tool: 'decision-room',
  reviewer: 'Codex implementation review; Jim Lunsford product approval pending',
};
export const decisionLessons = {
  define: {
    title: 'Name the choice.',
    text: 'State the decision without putting the answer inside it. You are making room to compare real alternatives.',
    question: 'What decision are you making?',
    example:
      '“Do I stay in my current job or accept the offer?” leaves room to think. “I need to quit my terrible job” already contains a conclusion.',
  },
  options: {
    title: 'Keep the alternatives real.',
    text: 'Give each option a name that will make sense later. Use two to four alternatives. Add waiting only if it is an option you are actually considering.',
    question: 'What are your real options?',
  },
  matters: {
    title: 'Give the comparison direction.',
    text: 'Name what you want to protect, create, preserve, or change. Purpose is direction. It does not require a grand life mission.',
    question: 'What matters in this decision?',
  },
  ownership: {
    title: 'Ownership',
    heading: 'What belongs to you?',
    text: 'Separate your choice and behavior from what you can only influence. Someone else’s response can matter without becoming your responsibility. Ownership is not blame for everything that happened.',
    question: 'For these options, what is yours to decide or do, and what belongs to someone else?',
  },
  purpose: {
    title: 'Purpose',
    heading: 'Which direction does it serve?',
    text: 'An option can solve today’s problem while taking you away from what matters. Look at the direction each choice creates, including what it trades away.',
    question: 'What direction does each option serve?',
  },
  resilience: {
    title: 'Resilience',
    heading: 'What holds under pressure?',
    text: 'Consider how each choice holds under real pressure. Limits, support, and risks belong in the picture. The harder path is not automatically the more durable one.',
    question: 'What would help each option hold up, and where is it fragile?',
  },
  integrity: {
    title: 'Integrity',
    heading: 'What matches your standards?',
    text: 'Compare the behavior each choice involves with the standards you claim. Real standards can compete. Name the compromise without turning it into shame or a demand for perfection.',
    question: 'Where does each option align with or challenge your standards?',
  },
  discipline: {
    title: 'Discipline',
    heading: 'What will it take repeatedly?',
    text: 'A decision becomes real through repeated behavior and supporting structure. Greater effort does not make an option better by itself.',
    question: 'What repeated behavior and structure would each option require?',
  },
  empowerment: {
    title: 'Empowerment',
    heading: 'What builds capability?',
    text: 'Consider whether a choice builds useful capability, for you and others. Support, expertise, teamwork, and interdependence can help. Rescue or control can take away responsibility that belongs to someone else.',
    question: 'How would each option affect capability, support, and appropriate responsibility?',
  },
  practical: {
    title: 'Check the practical reality.',
    text: 'Cost, risk, time, prerequisites, and reversibility support the comparison. They are not extra PERIOD values. How hard a choice is to reverse changes the certainty you may need; it does not choose for you.',
    question: 'What does each option cost, risk, or require?',
  },
  uncertainty: {
    title: 'Leave room for what is unknown.',
    text: 'Keep assumptions, missing information, and unknown responses visible. “I don’t know” is useful information. You may choose while uncertainty remains.',
    question: 'What are you still uncertain about?',
  },
  readiness: {
    title: 'A pause is a valid outcome.',
    text: 'Information, safety, prerequisites, or guidance may need attention first. This is general educational software, not medical, legal, financial, or crisis advice. You decide whether you are ready.',
    question: 'Are you ready to choose?',
  },
  choice: {
    title: 'The direction is yours.',
    text: 'Your options remain in the order you entered them. Select the direction you are choosing. The tool does not rank them or decide for you.',
    question: 'Which option are you choosing?',
  },
  reason: {
    title: 'Keep the reason with the choice.',
    text: 'Explain your choice in your own words, then name the first thing it requires. Detailed action planning can come later in Next Move.',
    question: 'Why this direction, and what comes first?',
  },
};
export const governedLessons = Object.entries(decisionLessons).map(([key, lesson]) => ({
  ...source,
  key,
  ...lesson,
}));

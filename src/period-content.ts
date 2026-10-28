// Work 01 v1.0 proposed copy, internal review only. Product Vision v0.12 controls scope.
export const contentVersion = 'work-01-v1.0-internal';
export const periodIntro = {
  title: 'Put your values into practice.',
  lead: 'The PERIOD Code gives six values a job in your daily life. Learn what they ask of you, see what they look like in an ordinary situation, and choose one standard you can practice.',
  origin:
    'Jim developed the Code through his own experience of addiction, loss, responsibility, and rebuilding. Its values apply wherever your choices need a clearer standard: at home, at work, and in the commitments you make to yourself.',
  meaning: [
    'PERIOD marks the end of an old negotiation. It is the point where you stop making every responsible action conditional on a better mood, an easier day, or someone else changing first.',
    'A period does not erase what happened. Pain, limits, and the need for help remain real. The change is in how you respond: you name the part you can own and act on a standard you are willing to practice.',
    'A value tells you what matters. A standard makes that value recognizable in your behavior. It gives you a clear line to return to when the day gets difficult.',
  ],
  comparison: {
    heading: 'See the difference in one ordinary moment.',
    situation:
      'You promised an update. The work is running late, and you want to avoid the conversation.',
    negotiation: '“I’ll send an update once I have better news.”',
    negotiationExplanation:
      'The message keeps moving further away because telling the truth feels uncomfortable.',
    standard: '“When a deadline is at risk, I send an honest update before it passes.”',
    standardExplanation:
      'You cannot guarantee the result. You can communicate what is true, what is delayed, and what you can realistically do next.',
    takeaway:
      'The standard is the behavior you return to. Keeping it creates evidence. Writing it down is only the beginning.',
    disclosure: 'What if the plan really needs to change?',
    adaptation:
      'New information, limited capacity, or safety can require a different plan. Tell the truth about the change and choose a workable response. Holding a value does not require protecting a method that causes harm.',
  },
  orderHeading: 'The name ends the negotiation. The order guides the work.',
  order: [
    'The values are taught in this order: Ownership, Purpose, Resilience, Integrity, Discipline, Empowerment. The order follows the work of rebuilding, rather than the letters in PERIOD.',
    'Start by taking responsibility for your response. Give that responsibility direction. Learn to protect it under pressure. Keep your actions aligned with your values. Repeat those actions. Then use the strength you build to help others become more capable.',
    'These values work together. You can revisit any one of them as life changes. You do not graduate out of Ownership when you reach Empowerment.',
  ],
} as const;
export const periodValues = [
  {
    id: 'ownership',
    name: 'Ownership',
    role: 'Take responsibility for your response.',
    sourceChapter: 'Ownership',
    lesson: {
      meaning:
        'Ownership starts with telling the truth about the part that belongs to you. You may not have caused the situation, and you cannot control every outcome. You can still decide what you will do next, what needs correcting, and where you need help.',
      example:
        'You miss a commitment after a difficult week. You cannot change the week that happened. You can tell the person you missed it, acknowledge the effect, and offer a realistic next step. They decide how to respond. Your responsibility is to make the correction you said you would make.',
      misconceptionHeading: 'Ownership does not mean everything is your fault.',
      misconception:
        'Accepting blame for another person’s harmful actions is not required. Neither is doing everything alone. Asking for useful support can be an act of ownership.',
      application:
        'Choose one responsibility you have been avoiding. Identify an action you can take without waiting for someone else to change. It might be an update, an apology, a boundary, or a request for help.',
      reflection: 'What part of the next response is mine?',
      connectionHeading: 'Why Purpose comes next',
      connection:
        'Responsibility gives you something to carry. Purpose helps you decide what you are carrying it toward. Without direction, owned effort can still become scattered.',
    },
  },
  {
    id: 'purpose',
    name: 'Purpose',
    role: 'Give responsibility a direction.',
    sourceChapter: 'Purpose',
  },
  {
    id: 'resilience',
    name: 'Resilience',
    role: 'Protect the direction under pressure.',
    sourceChapter: 'Resilience',
  },
  {
    id: 'integrity',
    name: 'Integrity',
    role: 'Bring conduct into alignment.',
    sourceChapter: 'Integrity',
  },
  {
    id: 'discipline',
    name: 'Discipline',
    role: 'Make the values repeatable.',
    sourceChapter: 'Discipline',
  },
  {
    id: 'empowerment',
    name: 'Empowerment',
    role: 'Use your strength to build capability in others.',
    sourceChapter: 'Empowerment',
  },
] as const;
export const periodExercise = {
  title: 'Turn a Value into a Standard',
  lead: 'Choose one value. Write a line for your own behavior, then name the next situation where you can practice it.',
  teaching:
    'A value names what matters. A standard describes behavior you can return to. “Be more reliable” leaves the action unclear. “When a deadline is at risk, I send an honest update before it passes” gives you a line you can recognize.',
  guardrail:
    'Keep the standard within your responsibility. You can choose your response; you cannot guarantee another person’s reaction. A workable standard can include rest, support, and a change of method.',
  privacy:
    'Your words stay in this open tab. The site does not send them to a server. Reloading or closing the tab can discard them. Copy or print anything you want to keep.',
  questions: [
    'Which value do you want to practice?',
    'What standard will guide your behavior?',
    'Where will you practice it next, and what will you do?',
    'What support or correction will help you return? (Optional)',
  ],
  hints: [
    'Choose the value you want to make more visible. You can change it.',
    'Describe something you can do or a boundary you can hold. “When [situation], I [behavior]” is one useful shape. Use your own wording.',
    'Name one real situation and the action you can take there. Keep it small enough to recognize when it happens.',
    'Name a reminder, a person, a change of method, or a repair after a miss. You do not have to describe private history.',
  ],
  selfCheck:
    'Before you make the card, check: Is this my behavior to choose? Could I recognize doing it? Does it respect real limits and support needs?',
  example: {
    valueId: 'integrity',
    standard: 'When a deadline is at risk, I send an honest update before it passes.',
    nextApplication:
      'Before today’s project check-in, I will explain the delay and propose a realistic next step.',
    returnPlan: 'If I avoid the update, I will send the correction as soon as I recognize it.',
  },
  exampleLesson:
    'The standard can guide more than one situation. The next action gives you a place to begin. Sending the update, not creating this card, is the behavior that would count as evidence.',
  footnote:
    'This card records what you intend to practice. It does not show that the action has happened. Return to the standard, make the correction when needed, and let your behavior provide the evidence.',
  source: 'Based on The PERIOD Code by Jim Lunsford. Educational adaptation by Only Empowerment.',
  exportNote:
    'Copies, clipboard sync, saved PDFs, and printouts are outside this site’s control. Clear draft removes only the words in this tab.',
} as const;
export const periodBook = {
  heading: 'Explore the complete PERIOD Code',
  paragraphs: [
    'This companion gives you practical explanations, everyday examples, and a way to write one standard. The complete book develops the Code’s origins, the six values, and why they are taught in this order.',
    'The PERIOD Code by Jim Lunsford is available in paperback and Kindle. You can explore the book and read a sample on Jim’s website. Amazon lists current editions, pricing, and availability.',
  ],
  label: 'Explore the book and read a sample',
  url: 'https://jimlunsford.com/period-code/',
} as const;
export type PeriodValueId = (typeof periodValues)[number]['id'];

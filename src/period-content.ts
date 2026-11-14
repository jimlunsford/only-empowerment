// Work 01 teaching with approved Work 06 v1.1 integration copy. Product Vision v0.18.
// Internal implementation and founder evaluation, not public publication approval.
export const contentVersion = 'work-06-v1.1-internal';
export const periodIntro = {
  title: 'Put your values into practice.',
  lead: 'Only Empowerment helps you put The PERIOD Code’s six connected values to work in daily life, for free. Begin with Ownership, explore an ordinary situation, and see how the values work together.',
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
        'Ownership begins when you stop defending what is yours to change. Tell the truth about your choices, their consequences and the responsibility in front of you. You may not have caused the situation. You still have a next response to own, including asking for the help you need.',
      example:
        'You miss a commitment after a difficult week. Explain what happened without using the week to avoid your part. Acknowledge the effect, offer a next step you can carry out, and do it. The other person decides how to respond. Your correction is still yours to make.',
      misconceptionHeading: 'Ownership does not mean everything is your fault.',
      misconception:
        "Someone else's harmful actions belong to them. Taking ownership of your response does not make their harm your fault. You can hold a boundary, seek support and take responsibility without carrying blame that is not yours.",
      application:
        'Choose one responsibility you have been avoiding. Identify an action you can take without waiting for someone else to change. It might be an update, an apology, a boundary, or a request for help.',
      reflection: 'What part of the next response is mine?',
      connectionHeading: 'Why Purpose comes next',
      connection:
        'Owning the next response gets you moving. Purpose asks where that movement is taking you. You can stop avoiding a responsibility and still scatter your effort. Decide what you are building with it.',
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
export const ownershipFoundation = {
  whyFirst: {
    heading: 'Why Ownership comes first',
    paragraphs: [
      'You can want a different life and still leave the responsibility for it somewhere else. You can wait for an apology, a quieter week or someone who finally understands. While you wait, the part you could change stays untouched.',
      'Ownership brings you back to that part. Before you decide where your life is going, you have to face where you are and what your choices are doing. That gives the rest of the Code somewhere to begin. You do not need to control the whole situation. You need to stop handing away the response that is yours.',
    ],
  },
  responsibilityWithoutShame: {
    paragraphs: [
      "When a choice was yours, face it without making it a verdict on your worth. Calling yourself hopeless leaves the correction untouched. Responsibility asks you to name what happened and address your part. It does not ask you to punish yourself or accept someone else's abuse.",
    ],
  },
  explanation: {
    heading: 'An explanation still leaves a response',
    paragraphs: [
      'A difficult week can explain why a commitment became harder to keep. Those facts matter. They help you understand what went wrong and choose a correction that fits the situation. The problem begins when the explanation becomes the reason nothing else is required of you.',
      'If you could act and chose to avoid it, own that choice. If you could not act, tell the truth about the limit. Do not invent a failure just to sound accountable. In either case, look honestly at what is available now. A real limit changes the response you can make. It does not turn an unavailable action into something you should have done.',
    ],
  },
  help: {
    heading: 'Help belongs in the work',
    paragraphs: [
      'Ownership does not require you to pretend you have time, strength, access or knowledge you do not have. A promise beyond your capacity does not become responsible because you mean it. Tell the truth about what you can contribute and where you need help.',
      'That help may be practical support, treatment, care or someone working beside you. Receiving it does not cancel your ownership. Take part in the choices available to you and carry out the part you can. Needing ongoing help is not a failure to live the Code. The question is how you participate, not how quickly you can stop needing anyone.',
    ],
  },
  evidence: {
    heading: 'The correction has to happen',
    paragraphs: [
      'Regret can tell you something needs to change. A promise can name what you intend to do. Neither carries out the correction. The message has to be sent. The boundary has to be held. The request for help has to be made. Let the action be small enough to carry out and honest enough to matter.',
      "If you miss again, tell the truth about that miss and return to the work. A later repair does not erase it. And doing your part does not buy another person's forgiveness. Their response belongs to them. Your responsibility is to keep making the correction real.",
    ],
  },
  connected: {
    heading: 'The foundation stays with you',
    paragraphs: [
      "Ownership is first in the teaching order because the other values need an honest starting point. Purpose gives the responsibility direction. Resilience helps you keep responding when that direction is tested. Integrity keeps you truthful about your part. Discipline makes the response something you repeat. Empowerment turns what you have learned into useful help that leaves another person's choices with them.",
      'You do not finish Ownership and move beyond it. You return when blame starts deciding for you, when a promise needs correcting or when helping someone becomes a way to avoid your own work. The six values belong together. This is a standard for living, not six separate achievements.',
    ],
  },
  practiceBridge:
    'In the practice, change whether a message could be sent and examine what that changes about the responsibility. You can also continue straight to Purpose.',
} as const;
export const periodExercise = {
  title: 'Turn a Value into a Standard',
  lead: 'Use the optional Standard Card to name one behavior you intend to practice within the whole Code and where you will put it into action next. Copy or print it as a reminder. Writing the standard gives you a direction to act on; it does not do the work.',
  teaching:
    'A value names what matters. A standard makes it visible in behavior. “Be more reliable” leaves the action unclear. “Before I agree to a household task, I check what I can realistically do and say so” gives you something to practice.',
  guardrail:
    'Keep the standard within your responsibility. You can choose your response; you cannot guarantee another person’s reaction. A workable standard can include rest, support, and a change of method.',
  privacy:
    'Your words stay in this open tab. The site does not send them to a server. Reloading or closing the tab can discard them. Copy or print anything you want to keep.',
  questions: [
    'Which value will this card focus on?',
    'What standard will guide your behavior?',
    'Where will you practice it next, and what will you do?',
    'What support or correction will help you return? (Optional)',
  ],
  hints: [
    'This gives the card a focus. It does not separate that value from the other five.',
    'Describe something you can do or a boundary you can hold. “When [situation], I [behavior]” is one useful shape. Use your own wording.',
    'Name one real situation and the action you can take there. Keep it small enough to recognize when it happens.',
    'Name a reminder, a person, a change of method, or a repair after a miss. You do not have to describe private history.',
  ],
  selfCheck:
    'Before you make the card, check: Is this my behavior to choose? Could I recognize doing it? Does it respect real limits and support needs?',
  example: {
    valueId: 'integrity',
    standard: 'Before I agree to a household task, I check what I can realistically do and say so.',
    nextApplication:
      "When my family asks me to handle Saturday's shopping, I will check my available time and say what I can take on.",
    returnPlan:
      'If I agree too quickly, I will correct the promise with the people affected and ask for a workable arrangement.',
  },
  exampleLesson:
    'The standard reaches the moment before the promise. Check your capacity, give an honest answer and follow through on what you agree. Those actions give your word weight. The card only names what you intend to do.',
  footnote:
    'This card records one behavior you intend to practice within the connected six-value Code. It does not show that the action has happened or that you have completed the Code. Return to the standard, make the correction when needed, and let your behavior provide the evidence.',
  source: 'Based on The PERIOD Code by Jim Lunsford. Educational adaptation by Only Empowerment.',
  exportNote:
    'Copies, clipboard sync, saved PDFs, and printouts are outside this site’s control. Clear draft removes only the words in this tab.',
} as const;
export const periodBook = {
  heading: 'Explore the complete PERIOD Code',
  paragraphs: [
    'This companion gives you practical explanations, everyday examples, and opportunities to practice the connected values. The complete book develops the Code’s origins, the six values, and why they are taught in this order.',
    'The PERIOD Code by Jim Lunsford is available in paperback and Kindle. You can explore the book and read a sample on Jim’s website. Amazon lists current editions, pricing, and availability.',
  ],
  label: 'Explore the book and read a sample',
  url: 'https://jimlunsford.com/period-code/',
} as const;
export type PeriodValueId = (typeof periodValues)[number]['id'];

export const periodCardContext = {
  footer:
    'Choose one intended behavior. Copy or print it, then return to it when the situation comes up.',
  connectedHeading: 'One behavior. The whole Code.',
  connectedParagraphs: [
    'The value you choose gives this card a focus. Ownership keeps the response yours. Purpose gives it a reason. Resilience helps you adapt when circumstances change. Integrity keeps the standard honest. Discipline brings you back to the behavior. Empowerment asks how what you build can help someone else without taking over their choices.',
    'You do not need six separate actions in every situation. Keep all six values in view as you decide what this one behavior asks of you.',
  ],
  takeaway:
    'Keep your copy where it will be useful before the situation arises, perhaps in a note on your phone or beside the things you need. When that moment comes, read the standard, face the facts and do the part you can. If you miss, make the correction and return.',
  paperParagraphs: [
    'The card editor needs JavaScript. You can use the same pattern on paper: choose a value, write one standard, name the next situation and action, and add support or correction if it would help.',
    'Keep that note where you will see it before the situation arises. Return to it when you need to choose a response. If your circumstances change, judge what is workable now. Writing the note names an intention. Carrying it out is the work.',
  ],
} as const;

// Work 06 v1.1, approved for internal implementation by Product Vision v0.18.
// Fictional educational adaptations, not manuscript quotations or personal records.
// Shared by the interactive experience and complete build-time linear reading.
export const practiceViews = [
  {
    id: 'situation',
    path: '/period/practice',
    label: 'Situation',
    title: 'Practice Ownership.',
    lead: 'An ordinary situation. A response you can own.',
  },
  {
    id: 'responses',
    path: '/period/practice/responses',
    label: 'Responses',
    title: 'Compare the responses.',
    lead: 'Explore what each response changes. There is nothing to submit.',
  },
  {
    id: 'follow-through',
    path: '/period/practice/follow-through',
    label: 'Follow-through',
    title: 'Make the correction real.',
    lead: 'A promise names what you intend to do. Evidence comes from what happens.',
  },
  {
    id: 'connected-code',
    path: '/period/practice/connected-code',
    label: 'The connected Code',
    title: 'Ownership begins the work.',
    lead: 'Purpose gives that responsibility direction.',
  },
] as const;
export type PracticeView = (typeof practiceViews)[number];
export const communicationConditions = {
  worked: {
    label: 'Messaging worked',
    context: 'Current condition: messaging worked before the deadline.',
    situation:
      'You promised a colleague a progress update by 3 p.m. A shared file went offline. One completed section is saved locally and can still be sent. You could send a message, but waited for better news. It is now 4 p.m. Your colleague has had no update.',
    outside: 'The outage, the elapsed hour and the colleague’s response.',
    own: 'Acknowledge choosing to wait; explain the limit; send the available section; set a realistic check-in.',
    acknowledgement: 'I missed the 3 p.m. update and left you waiting.',
    explanation:
      'This owns the missed update without claiming responsibility for the outage. It gives the colleague current facts and names actions within reach.',
  },
  unavailable: {
    label: 'Messaging was unavailable',
    context: 'Current condition: messaging was unavailable until 4 p.m.',
    situation:
      'You promised a colleague a progress update by 3 p.m. A shared file went offline. One completed section is saved locally. Your available messaging channels were also unavailable until 4 p.m. You can send a message and the local section now. Your colleague has had no update.',
    outside: 'The outage and the inability to communicate before 4 p.m.; the colleague’s response.',
    own: 'Explain the gap without inventing a past choice; send what is available now; set a realistic check-in.',
    acknowledgement:
      'I could not send the 3 p.m. update because messaging was unavailable until now.',
    explanation:
      'This explains a real limit without claiming you chose not to communicate. Now that messaging works, it identifies the response you can carry out.',
  },
} as const;
export type Communication = keyof typeof communicationConditions;
export const evidenceRecords = {
  promised: {
    label: 'Only promised',
    record: 'The message is drafted. It has not been sent. The next check-in is planned.',
    interpretation:
      'This is an intention. No sent update or completed check-in is established. Choosing this example or writing a card cannot perform those actions.',
  },
  followed: {
    label: 'Followed through',
    record:
      'At 4 p.m., the update and local section were sent. At 9 tomorrow, access was checked. At 9:10, another update was sent explaining that the shared file was still unavailable.',
    interpretation:
      'These actions are evidence of the correction and kept check-in in this fictional record. The outage remains unresolved. One correction does not guarantee forgiveness, rebuild all trust or establish a whole way of life.',
  },
  missed: {
    label: 'Missed the next update',
    record:
      'The 4 p.m. update and local section were sent. The 9:15 check-in was missed. At 10, you notice the miss.',
    interpretation:
      'The first correction happened; the next commitment was not kept. A later repair can create new evidence, but it cannot turn the missed deadline into a kept promise.',
  },
} as const;
export type EvidenceRecord = keyof typeof evidenceRecords;
export type PracticeSession = { communication: Communication; evidence: EvidenceRecord };
export const newPracticeSession = (): PracticeSession => ({
  communication: 'worked',
  evidence: 'promised',
});
export const practiceCopy = {
  fictional: 'This is a fictional example. No answer about you is collected.',
  situationHeading: 'The update that did not arrive',
  conditionLabel: 'Change one fact in this example',
  limit:
    'Ownership starts with the response available to you. It does not make the outage your fault, give you control over another person’s reaction, or require you to do everything alone.',
  reflection: 'What changed about the responsibility? What can still be done now?',
  situationClose:
    'The response starts with what is actually possible. A limit does not require false blame; an available correction still needs action.',
  responsePause: 'Before reading the explanation, name what this response can actually carry out.',
  honestTitle: 'Send an honest update',
  honestMessage:
    'The shared file is still unavailable. I can send the completed section now. I will check access at 9 tomorrow and update you by 9:15, even if it is still blocked.',
  assumptions:
    'This fictional example assumes you can send the completed section now and are available for the next morning’s check-in. Its clock times are not a rule for everyone.',
  honestLimit:
    'The message gives the colleague information to plan with. It cannot guarantee access, forgiveness or restored trust. Sending it and keeping the next commitment are still required.',
  waiting: {
    title: 'Wait for better news',
    message: 'I’ll update them when the file is back.',
    explanation:
      'At 4 p.m., you can communicate in either version of the situation. Waiting makes the next update depend on an outage ending, even though you can explain the current limit now. Earlier inability to communicate does not make present silence the only option.',
  },
  overpromising: {
    title: 'Promise a late finish',
    message: 'I’m sorry. I’ll finish the whole thing tonight, whatever it takes.',
    explanation:
      'The new promise still depends on a file you cannot access. In this situation it promises more than you can guarantee. Ownership does not require ignoring capacity or using an apology to make an unworkable commitment.',
  },
  help: {
    title: 'See a correction that asks for help',
    message:
      'The shared file is offline. I can send the completed section now. Is there an exported copy I can use? If not, I’ll check access at 9 tomorrow and update you by 9:15.',
    explanation:
      'Specific support may make the work possible. You still own the update and what you have promised. Asking for an exported copy is different from making someone else responsible for your whole correction. Help is legitimate, and the helper can say no.',
  },
  responseClose:
    'A clear message begins the repair when it is sent. Follow-through is still required.',
  workedExample:
    'The honest-update worked example continues here, regardless of which responses you examined. The original task remains blocked.',
  timeline: [
    {
      when: 'Now',
      action: 'Send the honest update and local completed section.',
      evidence: 'The update and available work were sent.',
    },
    {
      when: 'Tomorrow at 9',
      action: 'Check shared-file access.',
      evidence: 'The check was carried out; access is still outside your guarantee.',
    },
    {
      when: 'By 9:15',
      action: 'Send the next update, including a continuing block.',
      evidence:
        'The communication commitment was kept. It does not prove the entire task is complete.',
    },
  ],
  evidenceLabel: 'Inspect what happened',
  evidenceContext: 'These are fictional records, not reports about you.',
  repair:
    'Acknowledge the second miss now. Send the current facts, make a realistic correction, and change what failed: set a reminder, reduce the promise, or ask for specific help. Do not promise completion while access is still blocked. Your colleague does not owe reassurance. The repair becomes evidence when you carry it out.',
  evidenceReflection: 'What has actually happened? What still needs to happen?',
  evidenceClose: 'A correction can be small. It still has to happen.',
  household: {
    title: 'At home: when an agreement needs to change',
    situation:
      'You agreed to handle the evening meal. A change to your work shift means you cannot get home in time. What part of the next response is still yours?',
    disclosure: 'See one workable response',
    response:
      'My shift changed. I cannot cook tonight as agreed. I can arrange a simple meal before work, or we can make another plan. What would be useful?',
    explanation:
      'This example assumes arranging a simple meal is actually possible. If it is not, name your real limit and ask to revise the agreement without promising an unavailable contribution. The other person may disagree. Be honest, contribute what you can, and follow through on any new agreement.',
    agreement:
      'A revised shared agreement needs the other person’s participation. It is not accepted until they agree.',
  },
  connectedOpening:
    'In this situation, Ownership means responding honestly to the update that did not arrive. Purpose asks what that response serves: becoming a dependable colleague. The other values help that direction survive pressure, remain honest, become repeatable and eventually strengthen others.',
  connectedStandard:
    'The PERIOD Code is a connected standard for living. This one correction is a place to practice it.',
  relationships: [
    {
      value: 'Ownership',
      contribution:
        'Own the avoidable delay when messaging worked; in either condition, take responsibility for the response available now.',
      connection:
        'Responsibility needs Purpose so correction has a direction beyond escaping discomfort.',
    },
    {
      value: 'Purpose',
      contribution: 'Aim toward becoming a dependable colleague.',
      connection:
        'A worthwhile direction needs Resilience when progress is blocked. It also needs honest conduct.',
    },
    {
      value: 'Resilience',
      contribution:
        'Continue the useful response while access is blocked; adapt the method and seek help when needed.',
      connection:
        'Continuing needs Integrity so persistence does not protect a false promise or a harmful method.',
    },
    {
      value: 'Integrity',
      contribution:
        'Report what is true, acknowledge your actual part and correct the gap between promise and conduct.',
      connection:
        'Alignment needs Discipline to become repeated behavior, not one accurate explanation.',
    },
    {
      value: 'Discipline',
      contribution:
        'Use workable structure to send updates, keep commitments and return after a miss.',
      connection:
        'Repetition serves Ownership, Purpose, Resilience and Integrity. Greater effort alone cannot replace them.',
    },
    {
      value: 'Empowerment',
      contribution:
        'Later, if useful and welcomed, share a method you have practiced so someone can adapt it for themselves.',
      connection:
        'Developed strength serves another person’s capacity. Their choices remain theirs, returning the emphasis to Ownership.',
    },
  ],
  connectedReturn:
    'The order teaches how the values support one another. You keep returning to all six; you do not finish one and leave it behind. One action can express several values. You do not have to manufacture an act of Empowerment in every situation.',
  empowermentLimit:
    'Asking for an exported copy is receiving useful support. It does not automatically mean you have empowered someone. Sharing a practiced method should be useful, respectful and free of control; it does not require claiming mastery.',
  availability:
    'Only Ownership has a full lesson in this review. These connections introduce the wider philosophy; the other five lessons are not yet available.',
  takeActionHeading: 'Take it into your day',
  takeAction:
    'Think of one ordinary responsibility that needs a response. What can you honestly do next, what direction does it serve, and what would show that you did it? Keep your answer private. Take the action when it is workable, and return to the values when the situation changes.',
  cardLabel: 'Write an optional Standard Card',
  cardNote: 'Keep a reminder of one intended behavior within the connected Code.',
} as const;
export const honestMessage = (communication: Communication) =>
  `${communicationConditions[communication].acknowledgement} ${practiceCopy.honestMessage}`;
export const helpMessage = (communication: Communication) =>
  `${communicationConditions[communication].acknowledgement} ${practiceCopy.help.message}`;

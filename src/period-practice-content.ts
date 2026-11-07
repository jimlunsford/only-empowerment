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
    lead: 'What does each response correct, and what does it leave untouched?',
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
      'The outage was outside your control. Waiting to communicate was your choice. This update owns that delay, tells your colleague where the work stands and names what you can do next.',
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
      'You could not send a message before 4 p.m. Tell that truth without inventing a choice you never had. Now that messaging works, send the update and the section you can provide.',
  },
} as const;
export type Communication = keyof typeof communicationConditions;
export const evidenceRecords = {
  promised: {
    label: 'Only promised',
    record: 'The message is drafted. It has not been sent. The next check-in is planned.',
    interpretation:
      'The draft is still unsent. Your colleague has no update, and the check-in is still ahead. The intention matters when you carry it out.',
  },
  followed: {
    label: 'Followed through',
    record:
      'At 4 p.m., the update and local section were sent. At 9 tomorrow, access was checked. At 9:10, another update was sent explaining that the shared file was still unavailable.',
    interpretation:
      "The update went out and the next check-in happened. That is follow-through, even though the outage continues. Keep building that record. One kept commitment does not settle the other person's trust or forgiveness.",
  },
  missed: {
    label: 'Missed the next update',
    record:
      'The 4 p.m. update and local section were sent. The 9:15 check-in was missed. At 10, you notice the miss.',
    interpretation:
      'You sent the first update, then missed the next commitment. Both facts belong in the record. Correct this miss now; a later repair will not turn it into a promise you kept.',
  },
} as const;
export type EvidenceRecord = keyof typeof evidenceRecords;
export type PracticeSession = { communication: Communication; evidence: EvidenceRecord };
export const newPracticeSession = (): PracticeSession => ({
  communication: 'worked',
  evidence: 'promised',
});
export const practiceCopy = {
  lessonBridge:
    'The same missed update can involve a choice you avoided or a limit you could not change. That difference matters. Change the communication condition and see what is yours to own in each version.',
  purposeBridge:
    'The update is one response. Becoming dependable gives that response a direction beyond this delay.',

  fictional: 'This is a fictional example. No answer about you is collected.',
  situationHeading: 'The update that did not arrive',
  conditionLabel: 'Change one fact in this example',
  limit:
    "Own your response, not the outage or your colleague's reaction. If the next step needs help, ask for it. Responsibility does not require you to do everything alone.",
  reflection: 'What changed about the responsibility? What can still be done now?',
  situationClose:
    'Start with what was possible. Own a delay you chose. Tell the truth about a limit you could not change. Then act on what is possible now.',
  responsePause: 'Before reading on, ask what this response actually changes.',
  honestTitle: 'Send an honest update',
  honestMessage:
    'The shared file is still unavailable. I can send the completed section now. I will check access at 9 tomorrow and update you by 9:15, even if it is still blocked.',
  assumptions:
    "Here, you can send the saved section and make the next morning's check-in. In your own situation, promise a time and contribution you can actually give.",
  honestLimit:
    'Send the message so your colleague has facts to work with. Then keep the check-in. You cannot promise when access will return or decide when they should trust or forgive you.',
  waiting: {
    title: 'Wait for better news',
    message: 'I’ll update them when the file is back.',
    explanation:
      'At 4 p.m., messaging works in both versions. You can explain the problem now. Waiting for the file to return leaves your colleague without information you already have.',
  },
  overpromising: {
    title: 'Promise a late finish',
    message: 'I’m sorry. I’ll finish the whole thing tonight, whatever it takes.',
    explanation:
      'You still cannot open the file. Promising the whole task tonight uses a bigger promise to cover the missed one. Own the delay without committing yourself to work you cannot deliver.',
  },
  help: {
    title: 'See a correction that asks for help',
    message:
      'The shared file is offline. I can send the completed section now. Is there an exported copy I can use? If not, I’ll check access at 9 tomorrow and update you by 9:15.',
    explanation:
      'Ask for the exported copy because it could make the work possible. The update and the check-in are still yours to carry out. The other person can decline; asking for help does not assign them your responsibility.',
  },
  responseClose:
    'A clear message begins the repair when it is sent. Follow-through is still required.',
  workedExample:
    'Now follow the honest update into the next day. The shared file is still blocked. Whatever responses you explored, this continuation follows the honest-update example.',
  timeline: [
    {
      when: 'Now',
      action: 'Send the honest update and local completed section.',
      evidence: 'The update and available work were sent.',
    },
    {
      when: 'Tomorrow at 9',
      action: 'Check shared-file access.',
      evidence: 'You checked access. Whether the file came back was outside your control.',
    },
    {
      when: 'By 9:15',
      action: 'Send the next update, including a continuing block.',
      evidence: 'You kept the check-in, even if the task was still blocked.',
    },
  ],
  evidenceLabel: 'Inspect what happened',
  evidenceContext: 'These are fictional records, not reports about you.',
  repair:
    'Acknowledge the missed check-in and send the facts you have now. Address what failed: set a reminder, make a smaller promise or ask for specific help. Keep completion off the promise while access is blocked. Your colleague does not owe you reassurance. Carry out the correction.',
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
      'Offer the simple meal only if you can arrange it. If you cannot, say so and ask to make another plan. Your changed shift is real. So is the need to tell the other person what you can contribute and follow through on what you agree.',
    agreement: 'A changed plan is a shared agreement only when the other person agrees.',
  },
  connectedOpening:
    'Ownership gets the honest update sent. Purpose asks what you are building through that response: becoming a dependable colleague. Resilience keeps you responding when the file stays blocked. Integrity keeps the facts honest. Discipline keeps the next commitment from becoming another empty promise. Empowerment turns what you learn into useful help for someone else when it is wanted.',
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
        'Repeated effort needs responsibility, direction, resilience and honesty. Doing more cannot replace them.',
    },
    {
      value: 'Empowerment',
      contribution:
        'When someone wants the help, share a method you have practiced and let them adapt it to their own work.',
      connection:
        'Use what you have learned to help them carry their responsibility. Their choices remain theirs. That brings the work back to Ownership.',
    },
  ],
  connectedReturn:
    'You keep returning to all six values. One correction can call on several of them, and learning the next value does not leave the earlier ones behind. Help others when there is a useful place to do it; every situation does not need an act of service.',
  empowermentLimit:
    'Receiving an exported copy helps you do your work. Empowerment asks what your own strength can offer someone else. Share what you know honestly, respect their choices and leave them room to act.',
  availability:
    'All six values now have full lessons. The PERIOD Code remains a connected standard for living, not a sequence of achievements.',
  takeActionHeading: 'Take it into your day',
  takeAction:
    'Think of a responsibility you have been avoiding. What can you do next, what does that action serve, and what will be different once you have done it? Keep your answer private. Act when it is safe and possible, then return to the values as the situation changes.',
  cardLabel: 'Write an optional Standard Card',
  cardNote:
    'If a reminder helps, the optional Standard Card can hold one behavior you intend to practice within the whole Code. The action still belongs to you.',
} as const;
export const honestMessage = (communication: Communication) =>
  `${communicationConditions[communication].acknowledgement} ${practiceCopy.honestMessage}`;
export const helpMessage = (communication: Communication) =>
  `${communicationConditions[communication].acknowledgement} ${practiceCopy.help.message}`;

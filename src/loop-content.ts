// Fixed educational adaptation from the authenticated Work 69 package.
// Editorial provenance and exact changes: docs/work70/editorial-ledger.json.
export type LoopBlock =
  | {
      kind: 'paragraph';
      text: string;
      executionLink?: true;
      related?: { label: string; app: string; reading: string };
    }
  | { kind: 'heading'; text: string; id?: string }
  | { kind: 'comparison'; rows: string[][] };
export type LoopSection = { id: string; title: string; blocks: LoopBlock[] };
export const loopSections: LoopSection[] = [
  {
    id: 'introduction',
    title: 'Change needs proof.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'You can mean the promise and still repeat the behavior. Wanting change tells you what you want. What you do on a tired evening, after the consequences stop hurting, tells you what you have practiced.',
      },
      {
        kind: 'paragraph',
        text: 'Meet the pressure with an action that protects your standard. Finish the responsibility. Tell the truth. Correct the miss. Repeated action changes the record, and that record gives your word something to stand on.',
      },
      {
        kind: 'paragraph',
        text: 'That is the Discipline Loop. Pressure, action, proof, self-trust and identity reinforce one another. The next hard moment still comes. You meet it with a response you have practiced, then run the loop again.',
      },
    ],
  },
  {
    id: 'desire',
    title: 'Desire starts it. Repetition gives it weight.',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Desire matters. It can get you to admit that something has to change. But desire is vulnerable to whatever happens next: stress, boredom, fatigue, a difficult conversation, a craving, a quiet stretch when nobody is watching.',
      },
      {
        kind: 'paragraph',
        text: 'A strong feeling is not the same as a reliable response. If you have practiced avoiding a responsibility for months, one serious promise does not undo that practice. You need something different to happen when the same pressure returns.',
      },
      {
        kind: 'paragraph',
        text: 'Make the action concrete. Put down the phone and make the call. Tell the truth about the responsibility you missed. Keep a realistic agreement. Ask for the help you need, then use it. Understanding the pattern matters, but the record changes when you act.',
      },
      {
        kind: 'paragraph',
        text: 'You also do not have to believe a new identity into existence before acting. The record changes first. As the record grows, seeing yourself differently becomes less of an argument and more of an honest description of what you keep doing.',
      },
    ],
  },
  {
    id: 'five-parts',
    title: 'The five parts feed one another',
    blocks: [
      {
        kind: 'paragraph',
        text: 'These five parts are one reinforcing mechanism. Skip the action and there is no proof. Without proof, self-trust has nothing new to stand on. Repeat the same escape and you keep training the response you say you want to leave behind. Connect the parts and repeat them under real pressure.',
      },
      {
        kind: 'heading',
        text: 'Pressure creates the choice',
        id: 'part-1',
      },
      {
        kind: 'paragraph',
        text: 'Pressure is where the old response makes its case. Avoid the conversation. Leave the responsibility. Shut everything out. Notice that moment before the familiar response takes over. The feeling is real. It still leaves you with a choice about what to practice next.',
      },
      {
        kind: 'paragraph',
        text: 'Name the situation plainly: you are frustrated, the task is unfinished, and you want relief. Then identify what remains within your control. You did not choose every circumstance that brought you here. Ownership concerns your response and the help or adjustment available now, not blame for every hardship in your life.',
      },
      {
        kind: 'paragraph',
        text: 'What feeds the next part: Recognizing the pressure creates room to choose an aligned action. It does not require you to deny exhaustion, danger or a genuine limit.',
      },
      {
        kind: 'heading',
        text: 'Action creates proof',
        id: 'part-2',
      },
      {
        kind: 'paragraph',
        text: 'Answer the pressure with an action that protects your standard. Make the necessary call. Correct the lie. Finish one responsibility. Ask for the help the situation requires. A small action you can repeat builds more than a dramatic promise you never carry out.',
      },
      {
        kind: 'paragraph',
        text: 'Do not make the next move so impressive that you cannot repeat it. Clearing one usable space tonight can support a household standard better than announcing a complete home overhaul that depends on hours you do not have. A grand plan does not count as completed work.',
      },
      {
        kind: 'paragraph',
        text: 'What feeds the next part: The action leaves a fact you can point to. You did something consistent with your standard while pressure was present.',
      },
      {
        kind: 'heading',
        text: 'Proof rebuilds self-trust',
        id: 'part-3',
      },
      {
        kind: 'paragraph',
        text: 'Proof is what you actually did. You kept the agreement. You told the truth. You corrected the miss. Praise can lift your mood, but completed action gives you a fact to stand on when your own word has become hard to believe.',
      },
      {
        kind: 'paragraph',
        text: 'Give the action its honest weight. One action does not erase years of broken promises. It also does not become meaningless because it was small. Repeated follow-through gives you more than hope to draw on when you wonder whether your word can be trusted.',
      },
      {
        kind: 'paragraph',
        text: 'What feeds the next part: A growing record makes a more reliable view of yourself possible. Trust has something concrete beneath it.',
      },
      {
        kind: 'heading',
        text: 'Self-trust stabilizes identity',
        id: 'part-4',
      },
      {
        kind: 'paragraph',
        text: 'Your repeated conduct gives your identity weight. Responsibility stops being a word you admire when you keep practicing it, including when nobody praises you and the mood is wrong. You have a record of follow-through, and that record makes a different view of yourself believable.',
      },
      {
        kind: 'paragraph',
        text: 'This takes repetition. It is not an instant change produced by one good evening. The old story may still show up, but it no longer gets to present the only evidence. A difficult day can be a difficult day without becoming a verdict on your entire life.',
      },
      {
        kind: 'paragraph',
        text: 'What feeds the next part: When the action fits a pattern you recognize in yourself, it takes less convincing to return to it.',
      },
      {
        kind: 'heading',
        text: 'Stable identity reduces negotiation',
        id: 'part-5',
      },
      {
        kind: 'paragraph',
        text: 'A standard backed by repeated proof takes less arguing. You have already shown yourself what you do when the mood is wrong. The action still takes effort. Pressure still hurts. But inspiration no longer has to show up before you answer the responsibility.',
      },
      {
        kind: 'paragraph',
        text: 'Reduced negotiation is not blind rigidity. Sleep, illness, changing responsibilities and real emergencies require judgment. Keep asking how to protect the standard under the conditions you actually have. Do not confuse an honest adjustment with an excuse that keeps postponing responsibility.',
      },
      {
        kind: 'paragraph',
        text: 'Rebuild’s settled boundary concerns the decision you stop reopening; here, negotiation is the argument that repeated proof reduces. Execution applies that steadiness to the next move.',
        related: {
          label: 'Rebuild’s settled boundary',
          app: '#/rebuild/negotiation',
          reading: '/read/rebuild.html#negotiation',
        },
      },
      {
        kind: 'paragraph',
        text: 'What feeds the next turn: The next pressure point meets a practiced response. Another aligned action adds evidence, and the cycle runs again. There is no permanent finish line here.',
      },
    ],
  },
  {
    id: 'two-loops',
    title: 'Two loops can answer the same pressure',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Escape works fast. You avoid the responsibility, the pressure eases, and relief teaches you to reach for the same escape next time. Then the relief wears off. The unfinished responsibility is still there, with another broken agreement beside it.',
      },
      {
        kind: 'paragraph',
        text: 'The Discipline Loop asks for an aligned response while the pressure is present. That response may not make you feel better immediately. It creates evidence that you can act without waiting for the feeling to disappear. With repetition, the response becomes more familiar.',
      },
      {
        kind: 'comparison',
        rows: [
          [
            'An unfinished responsibility feels irritating.',
            'Avoid it, get temporary relief, meet the same responsibility later with another missed agreement behind you.',
            'Complete an honest minimum, or make a responsible adjustment, and know exactly what you did.',
          ],
          [
            'A miss brings shame.',
            'Hide the miss or decide the whole effort is ruined. Delay makes the next correction harder.',
            'Name what happened, repair what you can and take the next aligned action.',
          ],
          [
            'You are genuinely exhausted.',
            'Keep scrolling to avoid both the responsibility and the need for sleep.',
            'Protect sleep, communicate a necessary change and arrange a realistic return or help.',
          ],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Rest is not the enemy. A quiet evening, food, sleep, a conversation or time away can restore your ability to live by your standard. Look at the function and the pattern, not the label on the activity. Does it help you return responsibly, or keep the same responsibility hidden?',
      },
      {
        kind: 'paragraph',
        text: 'Use the help the situation requires. Medical care, accessibility accommodations and needed support can protect your ability to follow through. Refusing them to look strong does not protect the standard.',
      },
    ],
  },
  {
    id: 'recovery',
    title: 'Recovery is part of the foundation',
    blocks: [
      {
        kind: 'paragraph',
        text: 'Removing the substance matters. The response that kept feeding escape still has to change. You can stop using and keep hiding, creating conflict or filling every quiet moment with distraction. Recovery has to reach what you do when pressure returns.',
      },
      {
        kind: 'paragraph',
        text: 'Keep the appointment. Tell the truth. Protect sleep. Meet a basic responsibility. Ask for support and take part in the work. These ordinary actions build evidence of a different response while cravings and struggle may still be present.',
      },
      {
        kind: 'paragraph',
        text: 'Treatment, counseling, meetings, peers, family and medical help can support this work. Ownership means participating honestly in the response, including using help when it is needed. It does not mean recovering alone or discontinuing care to demonstrate independence.',
      },
      {
        kind: 'paragraph',
        text: 'This is a teaching framework, not medical care. Take serious substance-use or health concerns seriously and get appropriate help. A household example cannot tell you the severity of a relapse or replace treatment.',
      },
      {
        kind: 'paragraph',
        text: "Outside recovery, the same mechanism can help you examine follow-through at home, at work or in a neglected part of your life. Keep the recovery context intact without pretending every person's situation is the same.",
      },
    ],
  },
  {
    id: 'breaks',
    title: 'Five places the loop breaks',
    blocks: [
      {
        kind: 'heading',
        text: 'Waiting for Readiness',
      },
      {
        kind: 'paragraph',
        text: 'The feeling you are waiting for keeps moving. First you need motivation, then a clear day, then the right mood. Meanwhile, the responsibility stays untouched and delay gets another repetition.',
      },
      {
        kind: 'paragraph',
        text: 'Choose a safe, specific action you can take with the feelings you have. If you need information, support or rest to act responsibly, getting it can be the action. The distinction is whether you are preparing for the responsibility or endlessly moving the start.',
      },
      {
        kind: 'heading',
        text: 'Overbuilding the Plan',
      },
      {
        kind: 'paragraph',
        text: 'An emotional reset puts every neglected part of life on one enormous list. The plan feels convincing until ordinary responsibilities return. Then one unfinished piece makes the entire effort feel broken.',
      },
      {
        kind: 'paragraph',
        text: 'Choose something that can survive an ordinary day. In the illustrative household example, a usable preparation space is the repeatable commitment. A spotless house every evening is an unnecessary condition that makes the commitment harder to keep. Build capacity through a workable pattern before expanding it.',
      },
      {
        kind: 'heading',
        text: 'Having No Daily Minimum',
      },
      {
        kind: 'paragraph',
        text: 'You know what an ideal day looks like but have no answer for a hard one. When the full routine becomes impossible, everything drops away.',
      },
      {
        kind: 'paragraph',
        text: 'Define a floor you can actually use. Make it specific enough to recognize as done and small enough to repeat on a hard day. If illness or unsafe exhaustion changes what is responsible, adjust the action or get help. Protect the standard under real conditions.',
      },
      {
        kind: 'heading',
        text: 'Negotiating With the Standard',
      },
      {
        kind: 'paragraph',
        text: 'Each exception sounds reasonable by itself. The pattern becomes visible when every uncomfortable moment ends with the same responsibility postponed.',
      },
      {
        kind: 'paragraph',
        text: 'Ask what your adjustment protects. A real adjustment makes the standard workable under changed conditions. An excuse keeps finding language for abandoning it. Name the revised action, the needed help or the realistic return. Then follow through on that decision.',
      },
      {
        kind: 'heading',
        text: 'Replacing the Old Escape With Chaos',
      },
      {
        kind: 'paragraph',
        text: 'Constant activity can hide avoidance. Too many commitments, unnecessary conflict and sacrificed sleep leave no room for the same useful action to happen again.',
      },
      {
        kind: 'paragraph',
        text: 'Separate unavoidable pressure from disorder you can reduce. You cannot control every demand, illness or disruption. You may be able to decline an extra commitment, resolve one lingering task or stop reopening an argument. Make enough room for repetition. Do not make perfect control a condition of beginning.',
      },
    ],
  },
  {
    id: 'restart',
    title: 'A miss calls for a return',
    blocks: [
      {
        kind: 'paragraph',
        text: 'You missed. Own the consequence and correct the break. One unfinished responsibility does not erase every kept agreement, but using it as permission to abandon the next one feeds the same old pattern.',
      },
      {
        kind: 'paragraph',
        text: 'Start by telling the truth about the action, without turning it into a verdict about yourself. Identify where the loop broke. Was the plan too large? Did you never define a minimum? Did you ignore the pressure until avoidance was already running?',
      },
      {
        kind: 'paragraph',
        text: 'Choose the next safe, aligned action. Repair what can be repaired, including an honest apology or a changed arrangement when another person was affected. Restore a minimum you can use and close the obvious opening that helped the miss happen. Get support when the situation calls for it.',
      },
      {
        kind: 'paragraph',
        text: 'Rebuild’s repair teaching addresses the missed responsibility; here, returning also restarts the reinforcing cycle.',
        related: {
          label: 'Rebuild’s repair teaching',
          app: '#/rebuild/return',
          reading: '/read/rebuild.html#return',
        },
      },
      {
        kind: 'paragraph',
        text: 'Correction creates evidence of a return. It does not erase damage, demand forgiveness or make a serious problem small. You can take responsibility for the next action while accepting that trust and consequences may take longer to resolve.',
      },
    ],
  },
  {
    id: 'next-pressure',
    title: 'The next pressure point is the point',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The next pressure point is where you run the loop again. Notice the familiar pull, name the standard and take the action that protects it. Give the next choice another piece of evidence.',
      },
      {
        kind: 'paragraph',
        text: 'Choose one ordinary place to begin. Know the standard you are protecting, the minimum that makes sense under your conditions and what correction will look like if you miss. Keep the scale honest. A return you can practice is more useful than a promise that requires perfect circumstances.',
      },
      {
        kind: 'paragraph',
        text: 'Repeated follow-through shortens the argument. Honest correction gives you a way back after a miss. Keep practicing both. The pressure will return, and the record you build is what you bring to it.',
      },
    ],
  },
  {
    id: 'frameworks',
    title: 'How the frameworks fit',
    blocks: [
      {
        kind: 'paragraph',
        text: 'The PERIOD Code gives you values to live by. Its Discipline value concerns holding a standard through action. The Discipline Loop is a separate explanation of how repeated aligned action reinforces proof, self-trust and identity. It does not add a seventh PERIOD value or replace its Discipline lesson.',
      },
      {
        kind: 'paragraph',
        text: 'How to Rebuild Yourself explains the work of rebuilding a life. This experience focuses on the reinforcement that makes repeated responses more believable within that work. Rebuild’s steps 4 to 7 use this same Loop: proof, self-trust, identity and reduced negotiation.',
      },
      {
        kind: 'paragraph',
        text: 'Pure Execution Mode teaches how to carry an appropriate next move into action. It uses a five-step method for choosing, beginning, following through and returning when the next responsibility calls for it. Explore Pure Execution Mode for that teaching.',
        executionLink: true,
      },
    ],
  },
  {
    id: 'source',
    title: 'About the source',
    blocks: [
      {
        kind: 'paragraph',
        text: 'An educational companion to The Discipline Loop by Jim Lunsford. The book develops the argument across desire, identity, the five-part mechanism, competing relief, recovery, common breaks, correction and continued reinforcement.',
      },
      {
        kind: 'paragraph',
        text: "The lessons explain the full mechanism through practical examples. The scenarios are illustrations, not accounts of Jim Lunsford's personal history.",
      },
      {
        kind: 'paragraph',
        text: "Visit Jim Lunsford's book page for the current excerpt and book information. Buying the book is optional. Everything needed to understand and try the mechanism presented here is available in this experience.",
      },
    ],
  },
  {
    id: 'reflection',
    title: 'Four questions to carry into the next pressure point',
    blocks: [
      {
        kind: 'paragraph',
        text: 'These are optional reflection prompts. You can use them privately on paper. This experience does not collect your answers.',
      },
      {
        kind: 'paragraph',
        text: 'What pressure do I expect?',
      },
      {
        kind: 'paragraph',
        text: 'What standard am I protecting?',
      },
      {
        kind: 'paragraph',
        text: 'What action can I repeat under my actual conditions?',
      },
      {
        kind: 'paragraph',
        text: 'What will I do if I miss?',
      },
      {
        kind: 'paragraph',
        text: 'Keep the answers brief and practical. Choose an ordinary responsibility and a response you can actually use. The reading edition includes these prompts for use on paper.',
      },
    ],
  },
];
export const loopSectionIds = [
  'introduction',
  'desire',
  'five-parts',
  'part-1',
  'part-2',
  'part-3',
  'part-4',
  'part-5',
  'two-loops',
  'recovery',
  'breaks',
  'restart',
  'next-pressure',
  'frameworks',
  'source',
  'reflection',
] as const;
export const loopStages = [
  'Pressure creates the choice',
  'Action creates proof',
  'Proof rebuilds self-trust',
  'Self-trust stabilizes identity',
  'Stable identity reduces negotiation',
] as const;
export const loopBookUrl = 'https://jimlunsford.com/discipline-loop/';

// E2 transfer reflection. Separate from the complete teaching and scenario graph.
export const loopTransfer = {
  heading: 'Apply the Loop somewhere else',
  optional:
    'Optional reflection. This is a fictional situation. Think it through or use your own paper privately. There is no answer to submit.',
  scenario:
    'A person has set aside ten minutes to practice guitar after dinner. The guitar is within reach, but a difficult chord makes another tutorial more appealing than practicing. Time and capacity are available. The temptation is to keep learning about the work without attempting it.',
  reflection:
    'Identify the pressure, the standard and the action that would create real evidence. Trace what repeating that action could mean for self-trust, identity and the next difficult practice. Then consider what changes if an unexpected caregiving responsibility takes that time, or if a practice is simply missed. What would an honest adjustment or return look like?',
} as const;
export const loopHomeCopy =
  'Wanting change can start the work. Repeated action gives you a reason to trust yourself. Learn how pressure becomes a choice, action becomes evidence, and correction keeps one miss from becoming the next pattern.';

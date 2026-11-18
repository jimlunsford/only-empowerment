// Approved Work 69 graph. All choice labels and destinations are unchanged.
export type LoopStateId =
  | 'pressure'
  | 'proof'
  | 'overbuilt'
  | 'fatigue'
  | 'rest'
  | 'pushthrough'
  | 'rest_escape'
  | 'miss'
  | 'spiral'
  | 'hide'
  | 'restart'
  | 'correction'
  | 'return';
export type LoopState = {
  heading: string;
  body: string[];
  loop?: { stage: string; text: string }[];
  options: { label: string; next: LoopStateId }[];
  source: string[];
};
export type LoopScenario = {
  id: string;
  label: string;
  title: string;
  intro: string[];
  initialState: LoopStateId;
  states: Record<LoopStateId, LoopState>;
};
export const loopScenario: LoopScenario = {
  id: 'evening',
  label: 'Illustrative household scenario',
  title: 'One evening. Several possible responses.',
  intro: [
    "This household example is invented for teaching, not taken from Jim Lunsford's life. Follow a choice and see the response it reinforces.",
    'The outcomes illustrate the mechanism. A choice here is practice for understanding it; proof comes from what you do in your own life.',
  ],
  initialState: 'pressure',
  states: {
    pressure: {
      heading: 'The space is still cluttered',
      body: [
        'It is an ordinary evening after a long day. You agreed to leave one usable kitchen preparation space before bed. You are irritated by the clutter and want the day to be over.',
        'In this example, you have enough capacity for a brief task. The standard is a usable space, not a spotless house. Unsafe exhaustion, illness or an emergency would call for a different response.',
      ],
      options: [
        {
          label: 'Clear one usable space, then stop',
          next: 'proof',
        },
        {
          label: 'Plan a complete house reset tonight',
          next: 'overbuilt',
        },
        {
          label: 'Scroll and leave the responsibility unaddressed',
          next: 'miss',
        },
        {
          label: 'Explore a night when sleep must come first',
          next: 'fatigue',
        },
      ],
      source: ['Ch4 pp057-071', 'Ch7 pp159-181,186-187'],
    },
    proof: {
      heading: 'A small action leaves an honest fact',
      body: [
        'You clear one preparation space and stop at the agreed minimum. The house still needs work. You are still irritated. But the responsibility you agreed to handle is done.',
        'You kept your word under pressure. Give that fact its weight, then repeat it. Self-trust grows from a record of follow-through, and identity needs that repeated proof.',
      ],
      loop: [
        {
          stage: 'Pressure creates the choice',
          text: 'You noticed the urge to avoid an ordinary responsibility.',
        },
        {
          stage: 'Action creates proof',
          text: 'You completed the agreed minimum while irritation was present.',
        },
        {
          stage: 'Proof rebuilds self-trust',
          text: 'The completed action is one fact. Repeated follow-through can make your word more credible to you.',
        },
        {
          stage: 'Self-trust stabilizes identity',
          text: 'Over time, repeated facts can support seeing yourself as someone who follows through.',
        },
        {
          stage: 'Stable identity reduces negotiation',
          text: 'A practiced response can shorten the debate at the next pressure point. It still requires a choice.',
        },
      ],
      options: [
        {
          label: 'Meet a different pressure tomorrow',
          next: 'fatigue',
        },
        {
          label: 'Explore what happens after a miss',
          next: 'miss',
        },
        {
          label: 'Compare the bigger plan',
          next: 'overbuilt',
        },
      ],
      source: ['Ch4 pp065-093', 'Ch7 pp173-182'],
    },
    overbuilt: {
      heading: 'The plan asks for a perfect evening',
      body: [
        'You expand the task into deep-cleaning the kitchen, reorganizing cupboards and resetting the whole house. In this illustration, it is soon too late to finish without cutting into sleep.',
        'Making a workable responsibility enormous added a condition you could not sustain. Planning a bigger change has not produced the proof a smaller completed action would have produced.',
        'You can reduce the scope without abandoning the standard. Do not use the failed grand plan to declare yourself incapable.',
      ],
      options: [
        {
          label: 'Return to the usable-space minimum',
          next: 'proof',
        },
        {
          label: 'Consider sleep and a responsible adjustment',
          next: 'fatigue',
        },
        {
          label: 'Call the whole effort ruined and avoid it',
          next: 'spiral',
        },
      ],
      source: ['Ch7 pp159-181'],
    },
    fatigue: {
      heading: 'The conditions have changed',
      body: [
        'On another evening, you have had too little sleep and are struggling to stay awake. Continuing a house reset would take away sleep you need. Treat that limit honestly.',
        'The same task does not have to happen in the same form tonight. Needed rest, assistance or a clear change of arrangement can be the aligned response.',
      ],
      options: [
        {
          label: 'Protect sleep and make an honest arrangement',
          next: 'rest',
        },
        {
          label: 'Keep cleaning to prove I am disciplined',
          next: 'pushthrough',
        },
        {
          label: 'Stay on the phone and avoid deciding',
          next: 'rest_escape',
        },
      ],
      source: ['Ch5 pp105-110', 'Ch7 pp186-187,195-206', 'Ch8 pp235-236'],
    },
    rest: {
      heading: 'Rest protects the ability to return',
      body: [
        'In this illustration, you stop adding work, explain the changed situation to the person sharing the responsibility, and arrange help or a realistic return after sleep. Then you put the phone away and go to bed.',
        'The completed communication, adjustment and rest are evidence of that response. A future promise alone does not prove the original task is complete. When the return becomes possible, follow through or revise the arrangement honestly.',
        'Rest is not a consolation prize for failing at discipline. Here it protects health and sustainable responsibility.',
      ],
      loop: [
        {
          stage: 'Pressure creates the choice',
          text: 'The pressure includes a genuine limit: inadequate sleep.',
        },
        {
          stage: 'Action creates proof',
          text: 'You communicate, adjust the arrangement and protect needed rest.',
        },
        {
          stage: 'Proof rebuilds self-trust',
          text: 'The adjustment and rest count for what they are. The deferred task remains open until addressed.',
        },
        {
          stage: 'Self-trust stabilizes identity',
          text: 'Repeated responsible adjustments can support an identity grounded in honesty and sustainable follow-through.',
        },
        {
          stage: 'Stable identity reduces negotiation',
          text: 'At the next pressure point, rest and help can be considered without a fresh performance of toughness.',
        },
      ],
      options: [
        {
          label: 'Continue to the next pressure point',
          next: 'return',
        },
        {
          label: 'Compare avoiding both sleep and responsibility',
          next: 'rest_escape',
        },
        {
          label: 'Return to the ordinary evening',
          next: 'pressure',
        },
      ],
      source: ['Ch5 pp105-110', 'Ch7 pp186-187,195-206'],
    },
    pushthrough: {
      heading: 'More strain is not better proof',
      body: [
        'In this illustration, pushing on costs more needed sleep. The effort looks intense but makes tomorrow harder and ignores a limit you recognized.',
        'Exhaustion does not prove commitment. You recognized the need for sleep and kept pushing anyway. Stop adding strain. Protect sleep and make an honest arrangement for the responsibility.',
      ],
      options: [
        {
          label: 'Protect sleep and arrange the return',
          next: 'rest',
        },
        {
          label: 'Review the changed conditions',
          next: 'fatigue',
        },
      ],
      source: ['Ch7 pp186-187,198-206'],
    },
    rest_escape: {
      heading: 'Relief has postponed the decision',
      body: [
        'Scrolling takes the edge off for a while. It does not clear the space or give you the sleep you need. You are avoiding both. Look at what the behavior is doing, not what you call it.',
        'Pressure, avoidance, relief. Each repetition makes that escape more familiar. Spot the pattern and interrupt it here, before one missed responsibility becomes the next.',
      ],
      options: [
        {
          label: 'Stop and make a responsible adjustment',
          next: 'rest',
        },
        {
          label: 'Practice correcting the missed responsibility',
          next: 'restart',
        },
      ],
      source: ['Ch5 pp095-119', 'Ch8 pp212-227'],
    },
    miss: {
      heading: 'The action was missed',
      body: [
        'You stay on your phone and leave the space untouched. Morning arrives with the same responsibility waiting. Someone relied on your agreement, and now they have to work around the miss.',
        'The miss matters. It does not erase every earlier action. What happens next can feed avoidance or become evidence that you correct.',
      ],
      options: [
        {
          label: 'Tell the truth and locate the break',
          next: 'restart',
        },
        {
          label: 'Decide the whole effort was fake',
          next: 'spiral',
        },
        {
          label: 'Hide the miss and promise a bigger reset',
          next: 'hide',
        },
      ],
      source: ['Ch5 pp096-100', 'Ch8 pp212-228'],
    },
    spiral: {
      heading: 'A miss is becoming an identity verdict',
      body: [
        'You turn the missed action into a claim that you never follow through, then leave more responsibilities untouched. In this illustration, the original miss becomes permission for further avoidance.',
        'The claim is larger than the facts. Name the missed action accurately, keep its consequences visible, and interrupt what happens next with a specific correction.',
      ],
      options: [
        {
          label: 'Name the miss and begin correction',
          next: 'restart',
        },
        {
          label: 'Revisit the first pressure point',
          next: 'pressure',
        },
      ],
      source: ['Ch8 pp212-222,225-232'],
    },
    hide: {
      heading: 'A bigger promise has not repaired the miss',
      body: [
        'You dodge the missed agreement and announce a complete reset for tomorrow. The bigger promise protects your image. The actual responsibility remains untouched.',
        'Correction needs less theater and more truth. Address the miss and its effect, then choose work you can repeat. An apology does not require someone else to forgive you on your schedule.',
      ],
      options: [
        {
          label: 'Replace the performance with correction',
          next: 'restart',
        },
        {
          label: 'Examine the overbuilt plan',
          next: 'overbuilt',
        },
      ],
      source: ['Ch7 pp159-171', 'Ch8 pp216-237'],
    },
    restart: {
      heading: 'Find the break without attacking yourself',
      body: [
        'Name the fact: the agreed space was not cleared. In this illustration, you opened your phone before deciding how to respond to irritation, then kept postponing the task.',
        'Name the consequence: the space is still unusable, and somebody may have worked around it. Calling yourself useless does not correct that. Neither does pretending it did not matter.',
        'A next move is available: acknowledge the miss where necessary, clear the space when safe to do so, and put the phone aside before the next planned reset.',
      ],
      options: [
        {
          label: 'Take the specific corrective action',
          next: 'correction',
        },
        {
          label: 'Capacity is limited; arrange help or a return',
          next: 'rest',
        },
        {
          label: 'See what shame would reinforce',
          next: 'spiral',
        },
      ],
      source: ['Ch8 pp216-236'],
    },
    correction: {
      heading: 'Correction is evidence of a return',
      body: [
        'In this illustration, you acknowledge the missed agreement without excuses, address the immediate task and restore the small minimum. You put the phone away before the next reset.',
        'The kitchen is usable again. The miss remains part of the record. Someone else may still be frustrated, and trust may need time. What you have proved now is that you can return and begin repair.',
        'Repeated honest correction, alongside repeated follow-through, gives the next pressure point a different record to draw on.',
      ],
      loop: [
        {
          stage: 'Pressure creates the choice',
          text: 'Shame and an unfinished responsibility create another choice.',
        },
        {
          stage: 'Action creates proof',
          text: 'You name the miss, address the task and change the opening that enabled it.',
        },
        {
          stage: 'Proof rebuilds self-trust',
          text: 'Correction is a new fact. It does not delete the earlier miss or its consequences.',
        },
        {
          stage: 'Self-trust stabilizes identity',
          text: 'Repeated correction can support seeing yourself as someone who returns instead of disappearing.',
        },
        {
          stage: 'Stable identity reduces negotiation',
          text: 'The next miss need not trigger the entire identity argument again. You have a practiced way to correct.',
        },
      ],
      options: [
        {
          label: 'Return to another pressure point',
          next: 'return',
        },
        {
          label: 'Try the original choice again',
          next: 'pressure',
        },
      ],
      source: ['Ch8 pp223-237', 'Ch9 pp243-259'],
    },
    return: {
      heading: 'The next pressure point is still yours to answer',
      body: [
        'Another demand will come. So will another feeling, constraint or excuse. The loop keeps running through the response you practice next.',
        'A small completed action, a responsible adjustment and a specific correction create different kinds of evidence. Relief and oversized promises can leave a responsibility untouched.',
        'Carry the distinction into one real situation. Name the standard, choose an action that fits the conditions and recognize the evidence honestly. Then repeat.',
      ],
      options: [
        {
          label: 'Run the example from the beginning',
          next: 'pressure',
        },
        {
          label: 'Practice returning after a miss',
          next: 'miss',
        },
        {
          label: 'Revisit deliberate rest',
          next: 'fatigue',
        },
      ],
      source: ['Ch9 pp246-260', 'Ch10 pp264-280'],
    },
  },
};

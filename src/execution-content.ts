// Work 80: educational adaptation of the checksum-verified Pure Execution Mode.
// Source-row identifiers support editorial review; they are never interface labels.
export type ExecutionText = {
  kind: 'paragraph' | 'quote';
  id: string;
  text: string;
  sources: readonly string[];
  authorship: 'adapted' | 'quotation' | 'illustration';
};
export type ExecutionPractice = {
  kind: 'practice';
  id: string;
  title: string;
  facts: readonly ExecutionText[];
  question: ExecutionText;
  hint?: ExecutionText;
  reasoning: readonly ExecutionText[];
};
export type ExecutionBlock =
  ExecutionText | { kind: 'heading'; text: string; target?: string } | ExecutionPractice;
export type ExecutionSection = {
  id: string;
  title: string;
  blocks: readonly ExecutionBlock[];
};
const p = (
  id: string,
  text: string,
  sources: string,
  authorship: ExecutionText['authorship'] = 'adapted',
): ExecutionText => ({ kind: 'paragraph', id, text, sources: sources.split(' '), authorship });
const heading = (text: string, target?: string): ExecutionBlock => ({
  kind: 'heading',
  text,
  target,
});

export const executionTitle = 'Pure Execution Mode';
export const executionBookUrl = 'https://jimlunsford.com/pure-execution-mode/';
export const executionHomeCopy =
  'Learn the five steps through a complete example, then work out how unfinished situations should continue. Keep the action connected to the responsibility, including when the facts call for help, rest, or a change of plan.';
export const executionOrientationAddition =
  'Pure Execution Mode teaches how to carry a sound responsibility through hesitation into appropriate action, adjust when the facts change, and follow through honestly.';
export const executionPrivacyCopy =
  'Pure Execution Mode offers fixed examples and optional explanations. It has no personal answer fields and records no practice results.';
export const executionSteps = [
  { id: 'identify', title: 'Identify the Next Move' },
  { id: 'negotiation', title: 'Eliminate Negotiation' },
  { id: 'start', title: 'Flip the Switch' },
  { id: 'stack', title: 'Stack the Wins' },
  { id: 'repeat', title: 'Repeat Daily' },
] as const;

export const executionSections: readonly ExecutionSection[] = [
  {
    id: 'why',
    title: 'Why this method exists',
    blocks: [
      p(
        'why-gap',
        'You can understand the responsibility and still leave it sitting there. You mean to follow through. You care about what happens. Then the action becomes inconvenient, and the same decision comes back up for another argument.',
        'M02 M04',
      ),
      p(
        'why-response',
        'Pure Execution Mode gives that moment a response. First, make sure the action serves a real responsibility and fits the facts. When it does, carry it into the work without waiting for your mood to approve it.',
        'M02 M04 M05',
      ),
      p(
        'why-standard',
        'The standard gives the effort its purpose. Returning what you borrowed, telling the truth, keeping a workable agreement, and respecting a boundary ask for different actions. Staying busy cannot answer which one belongs to you now.',
        'M05',
      ),
      {
        ...p(
          'why-origin-quote',
          'The distance between a promise and a kept promise has consequences. I want the teaching to be usable in that distance.',
          'M03',
          'quotation',
        ),
        kind: 'quote',
      },
      p(
        'why-origin',
        "Jim connects this method to rebuilding ordinary life after addiction and to teaching recovery groups. An explanation had to become usable when the person left the room and the pressure returned. You don't need the same history to face the gap between what you intend and what you actually do.",
        'M03',
      ),
      p(
        'why-judgment',
        'You may need information, permission, support, or rest before the original action makes sense. Take that need seriously. Determination cannot supply missing consent or make an unsafe effort responsible. If suitable small actions keep failing, find out what is blocking them and get appropriate help.',
        'M05 M17',
      ),
      p(
        'why-connected',
        'The five steps belong together. Identify the Next Move gives the action direction. Eliminate Negotiation keeps a sound decision from being bargained away. Flip the Switch carries it into the actual work. Stack the Wins connects useful actions to the responsibility. Repeat Daily brings the method back when the next responsibility calls for it.',
        'M06',
      ),
      p(
        'why-reading',
        "Read the explanation, follow the example, then try continuing an unfinished situation. You can skip the practice and read every explanation immediately. There is nothing to submit, and you don't have to complete one section to visit another.",
        'M06 M43',
      ),
    ],
  },
  {
    id: 'hesitation',
    title: 'Recognize the bargain',
    blocks: [
      p(
        'hesitation-bin',
        'Illustration: the bin needs to go out for the collection you know is due. You have time, access, and the capacity to take it out. You pass it, think about doing it, and decide to wait until the next break. At the next break, you reopen the same question.',
        'M07',
        'illustration',
      ),
      p(
        'hesitation-authority',
        "Nothing about the collection changed. You haven't discovered a reason to leave the bin where it is. You have given the wish to avoid an ordinary interruption another chance to decide. Take the bin out while the action is still available. Thinking about it again won't perform it.",
        'M07 M08',
      ),
      p(
        'hesitation-worth',
        'This is a small responsibility, not a verdict on your worth. Its size makes the bargain easy to overlook. Repeatedly granting the same discomfort authority can leave larger commitments waiting too. The useful question is what is actually preventing the action.',
        'M08',
      ),
      p(
        'hesitation-question',
        'Change the facts. If a holiday may have changed the collection day and you genuinely do not know the schedule, check the schedule. That answer affects what should happen. Once you have it, use it. Rechecking an answer that is already clear supplies no new reason to delay.',
        'M09',
        'illustration',
      ),
      p(
        'hesitation-capacity',
        'An uncertain fact or a real capacity problem deserves attention. Ask, clarify, or get help when needed. When the action is suitable and the facts remain unchanged, stop asking for a better feeling before you do it. That is the moment the five steps are meant to carry you through.',
        'M09 M15',
      ),
    ],
  },
  {
    id: 'method',
    title: 'Follow one responsibility through',
    blocks: [
      p(
        'method-tools',
        "Illustration: you borrowed a set of tools and promised to return the complete set before the owner needs it Sunday evening. It is Saturday. You can safely gather the tools now, but you haven't arranged the return. You keep finding other things to straighten in the garage.",
        'M24',
        'illustration',
      ),
      heading('Identify the Next Move', 'identify'),
      p(
        'method-identify',
        'The responsibility is to return the complete set under an agreed arrangement. Your next move is to gather it and check that everything is there. That gives the return something usable to proceed with. Reorganizing the garage would leave the same promise waiting.',
        'M10 M12 M24',
      ),
      p(
        'method-scope',
        'Keep the action small enough to carry out and large enough to serve the work. Opening the garage is preparation. Gathering and checking the set advances the return. The tools still belong to their owner while they sit beside your door.',
        'M12 M20 M25',
      ),
      heading('Eliminate Negotiation', 'negotiation'),
      p(
        'method-negotiation',
        'You have the time, access, and capacity. The pull to keep tidying has supplied no new fact. Put down the unrelated job and stay with the set you owe. You can still dislike the interruption while the decision stands.',
        'M15 M16 M17',
      ),
      p(
        'method-access',
        'If a tool cannot be reached safely, that changes the move. Get appropriate help or arrange safe access. Once that issue is resolved, use the access for the return instead of expanding the preparation into another afternoon of work.',
        'M18 M25',
      ),
      heading('Flip the Switch', 'start'),
      p(
        'method-start',
        'Gather the tools. Check the set. In this illustration, every item is present. You have carried the selected action into the work and finished that useful part.',
        'M19 M20 M24',
      ),
      p(
        'method-progress',
        "Name it accurately: the set is ready to return. You haven't returned it. Giving the action its proper weight lets you recognize progress and still see the responsibility ahead. Deciding, preparing, beginning, advancing, and completing describe different facts. None can quietly stand in for the others.",
        'M20 M21 M25',
      ),
      heading('Stack the Wins', 'stack'),
      p(
        'method-request',
        'Now contact the owner with a time you can actually meet. In this example, the message reads, “I have the complete set ready. Can I bring it back at four tomorrow, before you need it?” You send it through your usual agreed contact channel.',
        'M24 M25',
        'illustration',
      ),
      p(
        'method-agreement',
        "The request is complete. The arrangement is still open. Until the owner answers, four o'clock is your proposal. Silence cannot make it their agreement, and leaving the tools outside their home would need its own permission.",
        'M13 M14 M24 M25',
      ),
      p(
        'method-wait',
        'While the answer is pending, repeatedly opening the message adds nothing. Attend to other appropriate responsibilities. If the approaching deadline needs a follow-up, make it through a suitable route and explain what depends on the answer.',
        'M25 M33 M38',
      ),
      p(
        'method-stop',
        "The owner later agrees to four. You now have an arrangement you can use. Tonight's gathering and request are done; tomorrow's return is still owed. You can stop working on it tonight without pretending the job is finished.",
        'M24 M26',
        'illustration',
      ),
      heading('Repeat Daily', 'repeat'),
      p(
        'method-return',
        'On Sunday, use the method with the responsibility that is actually due. Check that the arrangement still holds, stop postponing the departure merely because it is inconvenient, and return the complete set as agreed. The owner receives it. Now this responsibility is complete.',
        'M24 M26 M27',
        'illustration',
      ),
      p(
        'method-no-streak',
        "You don't need to return the same tools again on Monday or invent another task to preserve a run of productive days. Use the method when the next real responsibility calls for it. Take the rest the day calls for too.",
        'M26 M27 M28',
      ),
      p(
        'method-evidence',
        'The kept agreement is evidence behind your word. The owner still decides whether to lend to you again. Their response and your mood can remain unsettled without changing what you did.',
        'M25 M26 M29',
      ),
      p(
        'method-connected',
        "These are not five isolated events in a rigid conveyor. Gathering the tools, making the request, and later carrying out the return can each require renewed identification and judgment. Stay connected to the responsibility as the facts change. The method gives you a response; it doesn't excuse you from paying attention.",
        'M06 M19 M33',
      ),
      heading('When several responsibilities are real'),
      p(
        'method-obligations',
        'Illustration: a coworker needs an accurate update before you leave, you have to collect your child later, and clean laundry is waiting. You have enough time to send the update and leave for pickup. Folding a few shirts gives you an easy finish while your coworker still has no answer. Send the accurate update, then leave in time to keep the pickup commitment.',
        'M11',
        'illustration',
      ),
      p(
        'method-priority',
        "That is a judgment about these facts, not a rule that work outranks family. If pickup now requires immediate attention, protect that obligation and communicate the work delay as circumstances allow. Don't rush out inaccurate information to make every promise look kept. Completing one commitment doesn't quietly cancel another. If both cannot be met, tell the affected person and seek the adjustment you need.",
        'M11',
      ),
    ],
  },
  {
    id: 'continue',
    title: 'Continue an unfinished example',
    blocks: [
      p(
        'continue-orientation',
        'The first example gave you the complete explanation. These situations stop before the responsibility is met. Think through what should happen next, use a hint, or read the reasoning now. There is no answer field and no later section to unlock.',
        'M06 M42',
      ),
      {
        kind: 'practice',
        id: 'paragraph',
        title: 'Where did the work stop?',
        facts: [
          p(
            'paragraph-facts',
            'Illustration: the assignment is to write one accurate paragraph about a delivery. The notes establish what arrived, which item was missing, and that nobody has contacted the sender. You have suitable time and capacity. You write the first sentence, then go back to arranging the desk and checking whether you feel ready.',
            'M16 M20 M21',
            'illustration',
          ),
        ],
        question: p(
          'paragraph-question',
          'Continue from the work that exists. What action belongs next, and what would make this paragraph complete?',
          'M20 M21',
        ),
        hint: p(
          'paragraph-hint',
          'The notes already answer the factual questions. Look at the missing part of the paragraph.',
          'M20',
        ),
        reasoning: [
          p(
            'paragraph-reasoning',
            'The first sentence is a real start. Returning to the desk arrangement leaves the rest of the paragraph unwritten. Put the missing item and the absence of contact into the account, check those statements against the notes, and finish when the paragraph gives the required facts accurately.',
            'M16 M20 M21',
          ),
          p(
            'paragraph-finish',
            'You have met the writing assignment when that paragraph is complete. Contacting the sender is a different action. If the actual assignment also requires sending the summary, it remains unfinished until you send it through the appropriate channel. Keep the finish line attached to what was agreed.',
            'M10 M21',
          ),
          p(
            'paragraph-discrepancy',
            'You can still feel reluctant after the final sentence. That feeling does not turn the finished paragraph back into an intention. If the notes reveal a discrepancy instead, stop the unsupported claim and resolve it before calling the account complete.',
            'M17 M22',
          ),
        ],
      },
      {
        kind: 'practice',
        id: 'permission',
        title: 'What is still unsettled?',
        facts: [
          p(
            'permission-facts',
            "Illustration: you have been asked to send figures outside your team. You discover that you don't know which version is approved for that recipient. You ask the responsible person. They haven't answered. The planned sending time is getting close.",
            'M13 M18 M38',
            'illustration',
          ),
        ],
        question: p(
          'permission-question',
          'What can happen now? What still cannot honestly be treated as settled?',
          'M13 M21',
        ),
        hint: p('permission-hint', 'Which action still depends on an answer?', 'M13'),
        reasoning: [
          p(
            'permission-release',
            'The missing approval affects what you may send. Hold the release, follow up through the appropriate route, and tell the affected person what the delay depends on. You can prepare confirmed material you are allowed to prepare while you wait. You cannot choose a version simply to make the sending time look met.',
            'M13 M18 M38',
          ),
          p(
            'permission-return',
            'The request happened. Permission has not arrived. Waiting on that answer can be appropriate; failing to ask at all would leave a different situation. Once the answer is clear, use it. Repeating the same resolved question without a new reason can become another postponement.',
            'M13 M33',
          ),
        ],
      },
    ],
  },
  {
    id: 'change',
    title: 'When facts change',
    blocks: [
      p(
        'change-principle',
        'A sound decision can stop fitting the situation. New information belongs in the method, including information you discover after starting. Identify the action the facts now support, stop bargaining for the old plan, and carry the changed decision into what you actually do.',
        'M18 M22 M30 M33',
      ),
      heading('A different kind of stop'),
      p(
        'change-training',
        'Illustration: a planned run was suitable, and at first you simply feel reluctant. On an unchanged day, that reluctance alone would not cancel the session. Then a new injury concern appears before you begin. Stop the planned effort and seek appropriate assessment or guidance. Follow any appropriate care instructions that already apply.',
        'M23 M30 M41',
        'illustration',
      ),
      p(
        'change-rest',
        "Put the gear aside and make the contact needed for help. An unanswered request doesn't clear you to train. You don't owe a replacement workout to make the day count. Appropriate rest or help can be the action for now, while the training question remains unresolved.",
        'M23 M30 M41',
      ),
      p(
        'change-training-return',
        "At the next training opportunity, begin with what is actually known. The calendar hasn't answered an unresolved concern. Follow up when guidance is still needed, and return when conditions and appropriate guidance support it. Yesterday's stop is not a debt to repay with extra effort.",
        'M41',
      ),
      heading('Missing access changes the action'),
      p(
        'change-room',
        'Illustration: you arrive to prepare a room for an agreed meeting and find that it is unavailable. Ask the person responsible whether another suitable room is authorized. You can prepare materials that do not depend on that answer. You cannot declare a replacement room available because moving into it would look decisive.',
        'M31',
        'illustration',
      ),
      p(
        'change-pause',
        'Give the pause a purpose: a specific unanswered question, a request to someone who can resolve it, or a clear point to follow up. Some answers take time. Do not manufacture certainty to shorten the wait, and do not call an unasked question a dependency you are actively resolving.',
        'M33',
      ),
      heading('A responsibility does not grant consent'),
      p(
        'change-consent',
        'Illustration: you owe a household conversation about groceries you repeatedly left to somebody else. They decline an in-person discussion and ask for the practical proposal in a message. Respect that limit. Acknowledge the missed agreement, apologize for shifting the work, and propose a realistic time to finish what remains through the agreed channel.',
        'M32 M39',
        'illustration',
      ),
      p(
        'change-boundary',
        'Read the response and address the practical concern. If the proposed time does not work, resolve it before treating it as an agreement. If permission for direct contact is withdrawn, respect it and use an appropriate permitted route for necessary arrangements. If contact becomes unsafe, end the exchange and seek appropriate help. Follow-through gives you no authority to override a boundary.',
        'M32 M39',
      ),
      p(
        'change-versus-miss',
        'Changing course can be responsible. Avoiding a suitable commitment when the opportunity existed is a different event. Do not rename that choice after the fact. A genuine miss needs its own honest response.',
        'M33 M34',
      ),
    ],
  },
  {
    id: 'miss',
    title: 'Return after a miss',
    blocks: [
      p(
        'miss-facts',
        'Illustration: you promised a volunteer organizer an answer by Tuesday. You knew your availability and could reply, but kept your options open instead. By Wednesday, the organizer has found somebody else and rearranged the crew.',
        'M34',
        'illustration',
      ),
      p(
        'miss-account',
        'Name the actual miss. The answer did not arrive when you said it would. Another person had to plan around your silence. Calling yourself hopeless cannot give them that time back.',
        'M34',
      ),
      p(
        'miss-reenter',
        'Return at Identify the Next Move. Contact the organizer through an appropriate route, acknowledge the missed answer, apologize for the disruption, give your actual availability, and ask what help is still useful. Waiting for the embarrassment to settle would extend the same problem. Write the message, then actually send it.',
        'M35',
      ),
      p(
        'miss-repair',
        "If they agree that you can sort materials for Friday's pickup, agree what must be ready and do that work. The apology did not sort the materials. The new agreement did not complete the repair. Only tell them the materials are ready when they are.",
        'M36',
        'illustration',
      ),
      p(
        'miss-refusal',
        'If no further help is wanted, respect that answer. Do not create another job for them so you can feel better. A completed repair can leave lost time, disappointment, and future trust unresolved. You can tell the truth and do your part without commanding forgiveness.',
        'M36 M39',
      ),
      p(
        'miss-capacity',
        "Choose a repair you can meet. Offering to take over the whole event because you feel guilty can create another broken promise. Until Friday's materials are ready, that commitment remains open. If necessary materials become unavailable, explain what is missing and seek a workable arrangement. Owning the original miss does not require an unsafe or impossible repair.",
        'M37',
        'illustration',
      ),
      p(
        'miss-no-punishment',
        "Lost sleep, unrelated extra work, and promises never to fail again cannot perform the repair. Deal with the consequence and keep the commitment you now make. You don't need to wait for Monday or for a feeling that your record is clean. Bring the existing method to the next responsibility when it belongs there.",
        'M37',
      ),
      p(
        'miss-emergency',
        "An emergency that made Tuesday's reply impossible would change the account. It would call for an accurate explanation and a response to the situation now. In this illustration, the opportunity existed and you avoided it. Keep those facts separate, and carry what remains honestly.",
        'M34 M37',
      ),
    ],
  },
  {
    id: 'daily',
    title: 'Use it in an ordinary day',
    blocks: [
      p(
        'daily-opportunity',
        "Don't put the method away because today went well. Use a responsibility that already returns in your life: preparing for work, keeping up with a course, or carrying out an agreed household task. You don't need another routine devoted to remembering the method. Give it work that actually belongs in your day.",
        'M27',
      ),
      heading('The course still needs your attention'),
      p(
        'daily-course',
        'Illustration: you are taking an evening course. Tonight, the household responsibilities are settled, the materials are available, and you have time and capacity for the next assigned lesson and its exercise. You would rather keep scrolling. Nothing about the work or the available evening has changed.',
        'M27',
        'illustration',
      ),
      p(
        'daily-study',
        'Choose the first section you need to understand. Put the phone aside, begin reading, then attempt the exercise that uses the explanation. If you cannot answer because you do not understand it, identify that difficulty and seek the clarification the course provides. Guessing your way to a finished page defeats the responsibility.',
        'M27',
      ),
      p(
        'daily-enough',
        "Carry the appropriate work through to the evening's stopping point. Then stop. At the next relevant study period, start from what actually remains. Keeping up with the course does not require studying every night or repeatedly finishing a lesson you already completed.",
        'M26 M27 M28',
      ),
      p(
        'daily-change',
        "Now change the evening. A household care need takes the available time. If a smaller useful part fits your remaining capacity, do that part and name what it leaves unfinished. If there is no suitable capacity left, rest or make the needed arrangement. Opening the course just to claim you did something doesn't teach the material.",
        'M12 M28',
        'illustration',
      ),
      p(
        'daily-small',
        'Small still has to serve the work. If the kitchen needs to be ready for dinner, washing the cookware needed for the meal advances that agreement; sorting an easier drawer leaves it waiting. If the course needs understanding, a short section you can actually work through may help. A token action chosen only because it is easy does not answer the responsibility.',
        'M12 M28',
      ),
      p(
        'daily-deadline',
        'If the lost opportunity threatens an agreed deadline, explain the situation and request the adjustment needed. A requested extension is not a granted one. Keep the unresolved commitment visible, follow up appropriately, and return to suitable work when it becomes available. Scheduled rest does not need to be earned by inventing more output.',
        'M11 M28',
      ),
      heading('Support is something you carry out'),
      p(
        'daily-support',
        'Illustration: you are in recovery and have a chosen support plan. It names a person to contact when cravings and shame rise, an alternative if they are unavailable, and an ordinary evening routine. Tonight you want to isolate. You keep turning the phone over, telling yourself you will reach out when you can sound more together.',
        'M40',
        'illustration',
      ),
      p(
        'daily-call',
        'The next move is to contact the person in your plan and tell the truth about what is happening. Waiting until you can report that everything is fine defeats the reason for reaching out. Place the call while the difficult feeling is still present.',
        'M05 M40',
      ),
      p(
        'daily-unanswered',
        'In this illustration, the first person does not answer. Leave an appropriate request for contact if that route is available. The attempt is real; it has not produced a conversation. One unanswered call does not establish that nobody will help.',
        'M21 M40',
        'illustration',
      ),
      p(
        'daily-alternative',
        'Call the alternative person already included in the plan. In this example, they answer. Tell them plainly about the cravings and the urge to isolate. You agree to stay in contact while you eat the planned meal and settle into the evening routine you already chose. Carry out that support action. Having made a call is no reason to abandon the rest of the plan.',
        'M40',
        'illustration',
      ),
      p(
        'daily-care',
        'If the alternative is also unavailable, use the next appropriate support route or seek the professional help you need. An immediate safety or medical concern calls for appropriate urgent professional or emergency help, not waiting through unanswered messages or working harder at this lesson. Preserve prescribed care. This method does not provide withdrawal instructions or replace needed treatment.',
        'M05 M40',
      ),
      p(
        'daily-support-return',
        'You may still feel unsettled after reaching someone. The evidence is that you made contact and followed the appropriate support action, not that the call guaranteed relief. Return to the chosen plan at its next relevant opportunity, including any agreed contact or appointment. Tell the appropriate support person if the unavailable contact exposed a gap that needs addressing.',
        'M40',
      ),
      heading('Let the evidence stay specific'),
      p(
        'daily-trust',
        "The paragraph you finished, the tools you returned, and the support you used give your word evidence. Repeated follow-through can make a different expectation of yourself believable. That's how self-trust and identity gain something to stand on. You don't have to feel transformed for a kept commitment to be real.",
        'M26 M29',
      ),
      p(
        'daily-pattern',
        "Keep unfinished work honest too. One good action doesn't erase an earlier miss, and doubt doesn't erase the action you actually took. Repeat Daily means returning to appropriate action across real opportunities. Weekly groceries stay weekly. Needed rest stays needed. The pattern is reliability under the conditions that exist, not a streak of visible output.",
        'M26 M28 M29 M37 M39',
      ),
    ],
  },
  {
    id: 'transfer',
    title: 'Take it somewhere else',
    blocks: [
      p(
        'transfer-orientation',
        'This situation leaves the step labels and hint out. Work out a responsible continuation in your own words, or open the discussion now. Several arrangements might work; explain how yours reaches the responsibility.',
        'M42',
      ),
      {
        kind: 'practice',
        id: 'event',
        title: 'The event is tomorrow',
        facts: [
          p(
            'event-facts',
            "Illustration: you agreed to correct a community group's event page, which still shows last month's start time. You have the confirmed time and an accurate replacement ready, but your permission to publish has been removed. You can contact the site owner and the organizer, who can send notices to attendees. The event is tomorrow.",
            'M13 M21 M31 M33 M38 M42',
            'illustration',
          ),
        ],
        question: p(
          'event-question',
          "Explain a responsible continuation. Include what can happen, what needs someone else's answer, and what would require you to change the commitment.",
          'M13 M33 M42',
        ),
        reasoning: [
          p(
            'event-requests',
            'Contact the site owner with the accurate correction and the deadline. Ask them to publish it or restore appropriate permission. Tell the organizer which public information is wrong and ask them to send the confirmed time through their available notice channel. These are useful requests to people who can act; neither request proves that the page or the attendees have received the correction.',
            'M13 M21 M31 M38 M42',
          ),
          p(
            'event-follow-through',
            'When a permitted route becomes available, carry out your part and verify what changed. If it remains unavailable, follow up in time to address the approaching event and make the limit clear. A finished draft cannot make the public page accurate, and your promise cannot grant publishing access. Reach the responsibility through a route you are allowed to use.',
            'M13 M21 M31 M33 M42',
          ),
        ],
      },
      p(
        'transfer-your-day',
        'Bring this back to a responsibility already in your day. Name the action that actually serves it and what would need resolving before that action is sound. If the same settled decision keeps waiting for a better mood, carry it into the work. If the facts require a change, make that change real.',
        'M15 M27 M33 M42',
      ),
      p(
        'transfer-private',
        'Be honest about what the action completes, what remains, and where to stop. Return when the next responsibility calls for it. You can think this through privately or use your own paper. The site has nothing to collect from you.',
        'M14 M15 M26 M27 M42 M43',
      ),
    ],
  },
  {
    id: 'reference',
    title: 'The five steps at a glance',
    blocks: [
      p(
        'reference-use',
        'Use this as a reminder of the teaching. If the action is unclear, return to the responsibility and the fact it depends on. If the plan no longer fits, revise it. If you actually missed the commitment, acknowledge it and make the practical repair available now.',
        'M43',
      ),
      heading('Identify the Next Move'),
      p(
        'reference-identify',
        'Choose an action that serves the responsibility and fits the facts and your capacity. If something essential is unknown, the next move may be to find out.',
        'M43',
      ),
      heading('Eliminate Negotiation'),
      p(
        'reference-negotiation',
        'Stop reopening a still-sound decision merely because it is uncomfortable. Relevant new information still belongs in the decision.',
        'M43',
      ),
      heading('Flip the Switch'),
      p(
        'reference-start',
        'Begin the chosen action and carry the start into the work. Name preparation, progress, and completion accurately.',
        'M43',
      ),
      heading('Stack the Wins'),
      p(
        'reference-stack',
        'Continue with connected, useful action where it is needed. Be honest about what is finished, what is waiting on someone else, and where to stop.',
        'M43',
      ),
      heading('Repeat Daily'),
      p(
        'reference-repeat',
        'Return to the same method when the next responsibility calls for it. Daily practice does not make every task a daily task.',
        'M43',
      ),
    ],
  },
];

export const executionTargetIds = [
  ...executionSections.map((section) => section.id),
  ...executionSteps.map((step) => step.id),
];
export function executionRoute(fragment: string): string | null {
  if (fragment === '/execution') return fragment;
  const id = /^\/execution\?section=([a-z][a-z0-9-]*)$/.exec(fragment)?.[1];
  return id && executionTargetIds.includes(id) ? '/execution' : null;
}
export function executionTexts(): ExecutionText[] {
  return executionSections.flatMap((section) =>
    section.blocks.flatMap((block) =>
      block.kind === 'heading'
        ? []
        : block.kind === 'practice'
          ? [
              ...block.facts,
              block.question,
              ...(block.hint ? [block.hint] : []),
              ...block.reasoning,
            ]
          : [block],
    ),
  );
}

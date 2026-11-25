// Work 82. All situations below are authored illustrations, not biography.
// M identifiers refer to the accepted Work 80 manuscript source map.
export type WorkshopOption = {
  id: string;
  label: string;
  consequence: string;
  reasoning: string;
  next?: string;
};
export type WorkshopScreen = {
  id: string;
  stage: number;
  title: string;
  purpose: string;
  facts: string;
  teaching: string[];
  sources: string[];
  baseline: string[];
  action?: { label: string; result: string; remains: string };
  question?: string;
  options?: WorkshopOption[];
  explanation?: string;
  deferred?: boolean;
  next?: string;
  back?: string;
};
export const workshopStages = [
  { title: 'See it demonstrated', entry: 'identify' },
  { title: 'Take over', entry: 'take-over' },
  { title: 'Handle changed facts', entry: 'access' },
  { title: 'Work independently', entry: 'event' },
] as const;
export const workshopOrigin =
  'Jim developed this teaching through rebuilding ordinary life after addiction and leading recovery groups. These situations are illustrations, not accounts of his life.';
export const workshopBridges: Record<string, string> = {
  recover:
    'Continue rejoins the example after the set is checked and any unsupported claim is corrected. This is an authored continuation, not a claim that your earlier choice did that work.',
  arrange:
    'The next scene assumes the owner replies and agrees to four, then changes that arrangement. Every choice can continue.',
  access:
    'The next scene follows an agreed alternative reached through the permitted message route. If your choice left that unresolved, this is where the illustration reconnects after that work is done.',
};
export const workshopSessionCopy =
  'Choices stay in memory while you move within this workshop. Refreshing, restarting or leaving it clears them. The screen address stays shareable; your choices never enter it. Nothing is submitted.';
export const workshopScreens: WorkshopScreen[] = [
  {
    id: 'welcome',
    stage: 0,
    title: 'Pure Execution Mode',
    purpose: 'Carry a sound decision into the work.',
    facts:
      'Illustration: you borrowed a set of tools and promised to return the complete set before the owner needs it Sunday evening. It is Saturday. You have time and can safely gather the tools, but the handoff is not arranged. You keep finding other things to straighten in the garage.',
    teaching: [
      'Knowing what you owe does not return it. A standard is the responsibility or value your action serves. Here, it is keeping your agreement and respecting the owner’s time and property.',
      'First, watch the five steps carry this responsibility through. Then take over unfinished decisions, respond when the facts change, and try a different situation with less guidance. You can compare explanations, skip practice or leave at any point.',
      'The method does not require a special feeling. It requires judgment and appropriate action. Missing permission, unsafe conditions and changed capacity still matter. Help, rest or a stop can be the action the standard requires.',
    ],
    sources: ['M02', 'M03', 'M04', 'M05', 'M06', 'M24', 'M43'],
    baseline: ['why-gap', 'why-origin', 'why-standard', 'why-judgment', 'method-tools'],
    next: 'identify',
  },
  {
    id: 'identify',
    stage: 1,
    title: 'Identify the Next Move',
    purpose: 'Give the next action a job.',
    facts:
      'Illustration, Saturday: the borrowed tools are scattered around your garage. The complete set is due back before Sunday evening. You can reach it safely and have time to act. No handoff is arranged.',
    teaching: [
      'Choose the action that advances the return: gather the tools and check the set. “Sort out the garage” is larger than this responsibility requires. An easy drawer can absorb an afternoon while the owner’s tools stay scattered.',
    ],
    action: {
      label: 'See the chosen action',
      result: 'Gather the borrowed tools and check that every item is present.',
      remains:
        'The move is specific enough to carry out. It is still a decision. The tools have not moved yet, and the return is still owed.',
    },
    sources: ['M10', 'M12', 'M24', 'M25'],
    baseline: ['method-identify', 'method-scope'],
    back: 'welcome',
    next: 'negotiation',
  },
  {
    id: 'negotiation',
    stage: 1,
    title: 'Eliminate Negotiation',
    purpose: 'Stop giving the same objection another vote.',
    facts:
      'Illustration, same garage: you have chosen to gather and check the tools. Time, access and capacity are available. You would rather finish arranging a shelf first. No new fact has changed the return.',
    teaching: [
      'Put down the unrelated shelf job. The wish to finish something easier does not change what you owe. You can dislike the interruption while the decision stands.',
      'This is not an instruction to silence every concern. A blocked route, missing information or a real limit would need a response. Here, the repeated objection adds none of those facts.',
    ],
    action: {
      label: 'See what changes',
      result: 'You put the shelf work aside and turn your attention to the borrowed set.',
      remains:
        'The distraction is set aside. Gathering still needs to happen. A firm decision cannot stand in for the work.',
    },
    sources: ['M09', 'M15', 'M16', 'M17', 'M18'],
    baseline: ['method-negotiation', 'hesitation-capacity'],
    back: 'identify',
    next: 'switch',
  },
  {
    id: 'switch',
    stage: 1,
    title: 'Flip the Switch',
    purpose: 'Carry the start through the selected work.',
    facts:
      'Illustration, Saturday: the unrelated tidying is set aside. You can safely gather the borrowed tools. The selected unit is to gather and check the complete set, not merely open the garage.',
    teaching: [
      'Pick up the tools. Bring the set together and check every item. In this example, everything is present. Starting matters because it puts you into work that can continue. Stopping at the open garage door would leave that work waiting.',
    ],
    action: {
      label: 'See the action and its result',
      result: 'The complete set is gathered and checked. It is ready for the handoff.',
      remains:
        'That is useful progress. The tools are still with you. “Ready to return” does not mean “returned.”',
    },
    sources: ['M19', 'M20', 'M21', 'M24', 'M25'],
    baseline: ['method-start', 'method-progress'],
    back: 'negotiation',
    next: 'stack',
  },
  {
    id: 'stack',
    stage: 1,
    title: 'Stack the Wins',
    purpose: 'Keep each action attached to the same responsibility.',
    facts:
      'Illustration, Saturday: the complete borrowed set is ready. The owner needs it before Sunday evening. You can return it at four on Sunday, but that time has not been agreed.',
    teaching: [
      'Send a specific request through your agreed contact channel: “The complete set is ready. Can I bring it back at four tomorrow?” The sent request is real. Permission to arrive at four is still missing.',
      'While the answer is pending, attend to other appropriate responsibilities. Reopening the message does not create agreement. Follow up if the approaching deadline requires it.',
    ],
    action: {
      label: 'See the owner’s answer',
      result:
        'In this illustration, the owner replies and agrees to four on Sunday. The handoff is now arranged.',
      remains:
        'Tonight’s gathering and arrangement are done. Tomorrow’s return remains owed. You can stop for tonight without calling the whole job complete.',
    },
    sources: ['M13', 'M14', 'M24', 'M25', 'M26', 'M33'],
    baseline: ['method-request', 'method-agreement', 'method-wait', 'method-stop'],
    back: 'switch',
    next: 'repeat',
  },
  {
    id: 'repeat',
    stage: 1,
    title: 'Repeat Daily',
    purpose: 'Return when the responsibility calls for it.',
    facts:
      'Illustration, Sunday: the owner agreed to receive the complete set at four. The arrangement still holds, and you can safely make the return. Leaving now is inconvenient, but no relevant fact has changed.',
    teaching: [
      'Carry the agreement into today. Stop postponing the departure and return the complete set at the agreed time. Yesterday’s preparation made this possible. It did not perform today’s return.',
      'The five steps are a connected response, not five rigid gates. Each new action still needs judgment. Repeated follow-through gives your word evidence even when doubt remains.',
    ],
    action: {
      label: 'See where the work ends',
      result:
        'The owner receives the complete set under the agreed arrangement. This responsibility is complete.',
      remains:
        'You do not owe another return on Monday. Use the method with the next real responsibility, and take the rest the day calls for. The owner still decides whether to lend again.',
    },
    sources: ['M06', 'M24', 'M26', 'M27', 'M28', 'M29'],
    baseline: ['method-return', 'method-no-streak', 'method-evidence', 'method-connected'],
    back: 'stack',
    next: 'take-over',
  },
  {
    id: 'take-over',
    stage: 2,
    title: 'The tools are still scattered',
    purpose: 'You choose what happens next.',
    facts:
      'Illustration: rewind to Saturday before the tools were gathered. The full set is due back before Sunday evening. You have safe access, suitable time and capacity. You are halfway through organizing a shelf when you remember the return.',
    teaching: [
      'Choose an action and examine what it changes. You can reconsider or compare every option. No answer is required to continue.',
    ],
    question: 'What will you do with the available time?',
    options: [
      {
        id: 'shelf',
        label: 'Finish the shelf, then deal with the return.',
        consequence:
          'The shelf is tidier. The borrowed set remains scattered, and no handoff is arranged.',
        reasoning:
          'The shelf is a real job, but these facts do not make it necessary for the return. You used the available time without advancing the responsibility that is waiting.',
        next: 'recover',
      },
      {
        id: 'gather',
        label: 'Set the shelf aside. Gather and check the borrowed set.',
        consequence:
          'Every borrowed item is now accounted for. The set is ready to return; the handoff is still unarranged.',
        reasoning:
          'This action serves the actual promise. It is meaningful progress because the complete return can proceed from it. You still need agreement and delivery.',
        next: 'arrange',
      },
      {
        id: 'prepare',
        label: 'Open the garage and write a return reminder, then stop.',
        consequence: 'Access is available and a reminder exists. The set is still unchecked.',
        reasoning:
          'A reminder may support later work. Here, you already have safe access and suitable time. Preparation has replaced the gathering you could carry out now.',
        next: 'recover',
      },
    ],
    explanation:
      'Use the responsibility to judge the move. Gathering the complete set advances the return. Tidying an unrelated shelf does not, and a reminder leaves the selected work unperformed.',
    sources: ['M12', 'M16', 'M20', 'M24', 'M25'],
    baseline: ['method-tools', 'method-scope', 'method-progress'],
    back: 'repeat',
    next: 'arrange',
  },
  {
    id: 'recover',
    stage: 2,
    title: 'The return is still waiting',
    purpose: 'Continue from what your action actually did.',
    facts:
      'Illustration: the tools are still unchecked. The owner asks whether the complete set will be back before Sunday evening. There is still time to gather it safely and arrange the return.',
    teaching: [
      'An unrelated job or a reminder did not remove the promise. You do not need a new declaration. You need to return to the useful work and give an accurate answer.',
    ],
    question: 'How will you answer and follow through?',
    options: [
      {
        id: 'promise',
        label: 'Say the tools are ready so the owner can stop worrying.',
        consequence:
          'The owner is told the set is ready, but it has not been checked. They are planning from an unsupported claim.',
        reasoning:
          'Reassurance cannot supply the missing check. Correct the claim, gather the set and report what the facts support.',
      },
      {
        id: 'check',
        label: 'Say the set is not checked yet, then gather and check it.',
        consequence:
          'The owner has an accurate account. You gather and check the complete set. A handoff still needs agreement.',
        reasoning:
          'The truth and the practical action belong together. Admitting what remains does not complete it, so carry that admission into the work.',
      },
    ],
    explanation:
      'Gathering and checking remain available. Do that work, communicate accurately and arrange the handoff. The next scene resumes with the complete set checked, after any unsupported claim has been corrected.',
    sources: ['M20', 'M21', 'M25', 'M35'],
    baseline: ['method-progress', 'miss-account', 'miss-reenter'],
    back: 'take-over',
    next: 'arrange',
  },
  {
    id: 'arrange',
    stage: 2,
    title: 'A request is not an agreement',
    purpose: 'Keep progress and completion separate.',
    facts:
      'Illustration: the complete set has now been gathered and checked. You send a proposal to return it at four on Sunday. The owner has not replied. There is still time to arrange the handoff.',
    teaching: ['The message has been sent. Decide what that allows you to claim or do.'],
    question: 'What follows from the unanswered request?',
    options: [
      {
        id: 'deliver',
        label: 'Plan to leave it at the owner’s door at four.',
        consequence: 'You have a convenient drop-off plan, but no permission for that arrangement.',
        reasoning:
          'Silence does not authorize a drop-off. The return must respect the owner’s answer and property, not just your preferred finish time.',
      },
      {
        id: 'done',
        label: 'Mark the return handled because the request is sent.',
        consequence:
          'Your request is complete. The tools remain with you and the return is still open.',
        reasoning:
          'Naming the whole job finished hides its dependency and the delivery still owed. Give the request its proper credit without inflating it.',
      },
      {
        id: 'wait',
        label: 'Keep the return open. Follow up when the deadline requires it.',
        consequence:
          'The set stays ready while agreement is pending. You can attend to other suitable responsibilities.',
        reasoning:
          'Waiting on a real answer is different from avoiding an available action. Follow up through an appropriate route when timing requires it; use the answer when it arrives.',
      },
    ],
    explanation:
      'The request advanced the responsibility. It did not obtain consent or return the tools. For the next scene, the owner replies and agrees to four, then sends a relevant change before the handoff.',
    sources: ['M13', 'M14', 'M21', 'M24', 'M25', 'M33'],
    baseline: ['method-agreement', 'method-wait'],
    back: 'take-over',
    next: 'access',
  },
  {
    id: 'access',
    stage: 3,
    title: 'The agreed handoff changes',
    purpose: 'Revise the move when the facts require it.',
    facts:
      'Illustration, Sunday: the owner had agreed to four, but now says they cannot receive the tools then. They ask you not to leave anything outside and to arrange another handoff by message. They still need the set this evening.',
    teaching: [
      'The original arrangement no longer holds. Compare this with Saturday’s wish to keep tidying. This time, a fact changes what you are allowed to do.',
    ],
    question: 'How will you carry the responsibility forward?',
    options: [
      {
        id: 'old-plan',
        label: 'Keep the original time and leave the tools outside.',
        consequence:
          'The tools would be left in a place the owner explicitly rejected. Arrival at four would not fulfill the revised agreement.',
        reasoning:
          'Persistence cannot restore withdrawn permission. The responsibility includes respecting the owner’s boundary.',
      },
      {
        id: 'revise',
        label: 'Message a workable alternative and ask for agreement.',
        consequence:
          'The owner receives a specific proposal that respects the no-drop-off boundary. A new arrangement is still pending.',
        reasoning:
          'You changed the method while keeping the responsibility. State the deadline and what you can actually do. Your proposal still needs an answer.',
      },
      {
        id: 'abandon',
        label: 'Wait until next week because the original plan fell through.',
        consequence:
          'The tools remain with you while the owner’s need this evening goes unanswered.',
        reasoning:
          'The failed arrangement does not cancel the return. Explain the limit and seek a workable option now; do not silently grant yourself an extension.',
      },
    ],
    explanation:
      'Eliminate Negotiation protects a sound decision. It does not protect an outdated plan from relevant facts. Use the permitted message route, agree a feasible handoff and carry it out. If no arrangement can meet the original deadline, make that limit explicit.',
    sources: ['M13', 'M14', 'M18', 'M30', 'M32', 'M33'],
    baseline: ['method-agreement', 'change-principle', 'change-boundary'],
    back: 'arrange',
    next: 'capacity',
  },
  {
    id: 'capacity',
    stage: 3,
    title: 'Safe access is missing',
    purpose: 'Make the pause do useful work.',
    facts:
      'Illustration: you used the permitted message route and agreed on a later handoff. Before leaving, you find a heavy object blocking the stored tool case. Moving it alone would be unsafe. You can contact someone for appropriate help and message the owner.',
    teaching: [
      'The return remains owed. That does not make unsafe effort responsible. A needed stop or request for help must become something you actually carry out.',
    ],
    question: 'What fits these facts?',
    options: [
      {
        id: 'force',
        label: 'Move the obstruction alone to keep the promised time.',
        consequence:
          'You attempt effort the situation has established as unsafe. The promise has not supplied safe access.',
        reasoning:
          'Keeping the time does not justify ignoring the obstacle. Stop that effort and seek appropriate assistance.',
      },
      {
        id: 'help',
        label: 'Stop the unsafe effort, request help and explain the delay.',
        consequence:
          'The unsafe attempt stops. Help has been requested, and the owner knows the handoff may need adjustment. Access is not yet restored.',
        reasoning:
          'Those actions protect the responsibility. A request is not a helper’s arrival or a new agreement. Follow up and resume only when the conditions support it.',
      },
      {
        id: 'silence',
        label: 'Rest and leave the owner expecting the agreed handoff.',
        consequence:
          'You stop the effort, but the owner still expects a return you may not be able to make.',
        reasoning:
          'Rest can be appropriate without being earned. Where contact is available, an affected commitment still needs an honest update and adjustment.',
      },
    ],
    explanation:
      'Help, rest and stopping belong inside the method. They are not loopholes or punishments. In the demonstration’s responsible continuation, help makes access safe, the owner agrees to the revised time, and the complete set is returned. If those answers do not arrive, keep the unresolved obligation honest.',
    sources: ['M05', 'M18', 'M23', 'M25', 'M26', 'M31', 'M33'],
    baseline: ['method-access', 'change-rest', 'change-pause', 'daily-deadline'],
    back: 'access',
    next: 'event',
  },
  {
    id: 'event',
    stage: 4,
    title: 'The event is tomorrow',
    purpose: 'Make three connected decisions, then compare your reasoning.',
    facts:
      'Illustration: you agreed to correct a community event page that still shows last month’s start time. You have the confirmed time and an accurate replacement, but your publishing access has been removed. The site owner can change the page. The organizer can send attendee notices.',
    teaching: [
      'There are no step labels or hints in this sequence. Your choices shape the situation you see next. Explanations wait until the comparison, which you can open at any time. Think through your reasons privately.',
    ],
    question: 'What will you do first?',
    deferred: true,
    options: [
      {
        id: 'request',
        label: 'Send the correction and deadline to the owner and organizer.',
        consequence:
          'Both receive the facts and specific requests to act. Neither correction is confirmed yet.',
        reasoning:
          'You used available routes without claiming permission you lack. The sent requests are progress, not proof that the page or notices changed.',
      },
      {
        id: 'polish',
        label: 'Improve the replacement wording before contacting anyone.',
        consequence:
          'The wording is polished, but the page still shows the old time. Neither person knows what needs action.',
        reasoning:
          'The replacement was already accurate. Additional polish postponed the people who can act while the approaching event made delay consequential.',
      },
      {
        id: 'announce',
        label: 'Tell the organizer the correction is handled because the draft is ready.',
        consequence:
          'The organizer has reassurance the public page does not support. No publishing route has been established.',
        reasoning:
          'A prepared correction cannot fix the public information. Correct the misleading update and make the actual requests.',
      },
    ],
    explanation:
      'The immediate move is to put the accurate correction and deadline in front of people who can act. Ask the owner to publish or restore appropriate access. Ask the organizer to use the available notice channel. Each person’s response remains outside your control.',
    sources: ['M13', 'M20', 'M21', 'M31', 'M38', 'M42'],
    baseline: ['event-facts', 'event-requests'],
    back: 'capacity',
    next: 'event-wait',
  },
  {
    id: 'event-wait',
    stage: 4,
    title: 'The page still shows the old time',
    purpose: 'Decide from the situation your first move leaves.',
    facts:
      'Illustration: the event is approaching, the public page still has the old time and your access remains unavailable. The organizer’s notice channel is still available. No correction has been confirmed.',
    teaching: [],
    question: 'What needs to happen now?',
    deferred: true,
    options: [
      {
        id: 'follow-up',
        label: 'State what remains wrong, request the notice and follow up on access.',
        consequence:
          'The owner and organizer receive an accurate account of the remaining problem and the approaching deadline.',
        reasoning:
          'If your first request was sent, this is a timely follow-up. If it was not, make the missing request now. If you said it was handled, correct that claim. Continue only through a permitted route.',
      },
      {
        id: 'wait-only',
        label: 'Wait for access before involving the organizer.',
        consequence:
          'The page remains wrong and the available attendee notice route is left unused.',
        reasoning:
          'One blocked route does not block every appropriate action. The organizer can address the information people need while the page correction remains open.',
      },
      {
        id: 'close',
        label: 'Leave the prepared draft and consider your part finished.',
        consequence:
          'The draft exists, but the public correction and attendee notice remain unconfirmed.',
        reasoning:
          'Your agreement concerned the event information people would see. A draft is useful preparation, not evidence that the responsibility has been met.',
      },
    ],
    explanation:
      'Name the remaining public error and use the organizer’s notice route while resolving the page access. Keep the owner’s action and the organizer’s action separate. A request for either is not confirmation of either.',
    sources: ['M13', 'M21', 'M31', 'M33', 'M38', 'M42'],
    baseline: ['event-requests', 'event-follow-through'],
    back: 'event',
    next: 'event-close',
  },
  {
    id: 'event-close',
    stage: 4,
    title: 'One correction is confirmed',
    purpose: 'Name what is complete and what remains.',
    facts:
      'Illustration: for this final decision, the routes reconnect. The organizer has now sent the accurate attendee notice and confirmed it. The site owner says they will update the page, but the page still shows the old time. Your publishing access remains unavailable.',
    teaching: [],
    question: 'What is your next response?',
    deferred: true,
    options: [
      {
        id: 'verify',
        label: 'Confirm the notice is sent. Keep the page correction open and follow through.',
        consequence:
          'The completed notice is acknowledged. The still-wrong page remains an explicit responsibility with the owner, deadline and follow-up identified.',
        reasoning:
          'A promise to publish is not a published correction. Verify the page when the owner acts. If it stays wrong as the event approaches, tell the organizer the limit and agree what can still be done.',
      },
      {
        id: 'finished',
        label: 'Report the whole correction complete because the owner promised.',
        consequence: 'The report says finished while the public page still shows the wrong time.',
        reasoning:
          'An agreed intention cannot substitute for the changed page. The notice is complete; the page is not.',
      },
      {
        id: 'resend',
        label: 'Keep asking the organizer to resend the notice instead.',
        consequence:
          'Attention returns to the part already completed while the public page remains wrong.',
        reasoning:
          'Repeating a completed action does not perform the unfinished one. Return to the page dependency; another notice needs its own factual reason.',
      },
    ],
    explanation:
      'Verify what changed. The sent notice is complete. The page needs follow-through with the owner and honest communication if the deadline cannot be met. At the next relevant opportunity, resume from that actual state. You do not need to invent another daily notice.',
    sources: ['M21', 'M25', 'M27', 'M33', 'M38', 'M42'],
    baseline: ['event-follow-through', 'method-no-streak'],
    back: 'event-wait',
    next: 'compare',
  },
  {
    id: 'compare',
    stage: 4,
    title: 'Compare the whole continuation',
    purpose: 'Look at the responsibility across all three decisions.',
    facts:
      'Illustration: the event page needed a confirmed correction through an authorized route. Your draft alone could not change it. The organizer could reach attendees while the page remained unresolved.',
    teaching: [
      'Read your chosen path beside the explanations. An unchosen decision stays unchosen; you can still read every outcome.',
      'If your earlier action left something undone, the next useful move starts there. Correct an unsupported claim, make a missing request, follow up on a real dependency, or verify the change. A later good decision does not make an earlier consequence disappear.',
    ],
    sources: ['M13', 'M21', 'M33', 'M38', 'M42'],
    baseline: ['event-requests', 'event-follow-through'],
    back: 'event-close',
    next: 'your-responsibility',
  },
  {
    id: 'your-responsibility',
    stage: 4,
    title: 'Bring it back to your day',
    purpose: 'Choose a responsibility, privately.',
    facts:
      'No example to finish here. Think of a responsibility that already belongs in your life. You can use your own paper. There is nothing to enter or submit.',
    teaching: [
      'Name what the responsibility requires, the action that would serve it and what must be known before that action is sound. If the facts are settled and discomfort keeps reopening the decision, carry it into the work. If information, help, consent or rest is needed, make that response real.',
      'Be precise about what the action completes and what remains. Return when the next real responsibility calls for it. Kept commitments give your word evidence; they do not guarantee confidence or another person’s response.',
      'If you actually missed a commitment, acknowledge the miss and its consequence. Ask what repair is still useful, agree only to what you can meet, then carry it out. An apology is not the practical repair, and repair cannot command forgiveness.',
    ],
    sources: ['M05', 'M14', 'M15', 'M26', 'M27', 'M29', 'M34', 'M35', 'M36', 'M37', 'M42', 'M43'],
    baseline: [
      'transfer-your-day',
      'transfer-private',
      'miss-reenter',
      'miss-repair',
      'miss-refusal',
    ],
    back: 'compare',
    next: 'reference',
  },
  {
    id: 'reference',
    stage: 0,
    title: 'The five steps at a glance',
    purpose: 'Use the reminder, then return to the responsibility.',
    facts: 'The method stays the same. The action has to fit the facts.',
    teaching: [
      'Identify the Next Move. Choose an action that serves the responsibility and fits the facts and your capacity. If something essential is unknown, find out.',
      'Eliminate Negotiation. Stop reopening a still-sound decision just because it is uncomfortable. New information still matters.',
      'Flip the Switch. Begin the action and carry it into the work. Preparation, progress and completion are different facts.',
      'Stack the Wins. Continue with connected, useful action. Tell the truth about what is done, what is waiting and where to stop.',
      'Repeat Daily. Return when the next responsibility calls for it. Every task does not become daily. Rest does not need to be earned through extra output.',
    ],
    sources: ['M43'],
    baseline: [
      'reference-identify',
      'reference-negotiation',
      'reference-start',
      'reference-stack',
      'reference-repeat',
    ],
    back: 'your-responsibility',
  },
];
export const workshopScreenIds = workshopScreens.map((screen) => screen.id);
export const workshopById = (id: string) => workshopScreens.find((screen) => screen.id === id)!;
export const workshopHref = (id: string) =>
  id === 'welcome' ? '#/execution' : '#/execution/' + id;
export const legacyWorkshopMap: Record<string, string> = {
  why: 'welcome',
  hesitation: 'negotiation',
  method: 'identify',
  continue: 'take-over',
  change: 'access',
  miss: 'your-responsibility',
  daily: 'repeat',
  transfer: 'event',
  reference: 'reference',
  identify: 'identify',
  negotiation: 'negotiation',
  start: 'switch',
  stack: 'stack',
  repeat: 'repeat',
};
export function workshopLocation(fragment: string) {
  const legacy = /^\/execution\?section=([a-z-]+)$/.exec(fragment)?.[1];
  return {
    id: legacy ? legacyWorkshopMap[legacy] || 'welcome' : fragment.split('/')[2] || 'welcome',
    legacy,
  };
}
export type WorkshopChoices = Record<string, string>;
// Reconsidering an independent decision invalidates dependent decisions, rather
// than showing an old answer as though it was made under the revised facts.
export function chooseWorkshop(
  previous: WorkshopChoices,
  screen: string,
  option: string,
): WorkshopChoices {
  if (!workshopById(screen)?.options?.some((entry) => entry.id === option)) return previous;
  const next = { ...previous, [screen]: option };
  if (previous[screen] !== option) {
    if (screen === 'event') {
      delete next['event-wait'];
      delete next['event-close'];
    }
    if (screen === 'event-wait') delete next['event-close'];
  }
  return next;
}
export function eventCarry(choices: WorkshopChoices): string {
  switch (choices.event) {
    case 'request':
      return 'From your first move: the owner and organizer received your requests. Neither has confirmed a correction.';
    case 'polish':
      return 'From your first move: you polished an already accurate draft. The owner and organizer have not received the requests.';
    case 'announce':
      return 'From your first move: the organizer was told the correction was handled. The organizer expects accurate public information, but the page still shows the old time.';
    default:
      return 'No earlier choice is available in this session. Start from these stated facts, or go Back to choose the first move.';
  }
}

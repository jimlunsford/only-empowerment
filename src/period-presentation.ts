// Work 04 presentation adaptations, for internal author review only.
// These are not quotations or approved public publication copy.
// Full teaching remains in period-content.ts. See docs/WORK-05-EDITORIAL-COMPANION.md.
import { resilienceContent } from './period-resilience-content.ts';
export const periodPresentation = {
  introLead: resilienceContent.homeLead,
  connectedClarification:
    'The PERIOD Code is a connected standard for living. A specific behavior gives you one place to practice it. The six values continue to shape the rest of your life.',
  practiceInvitation:
    'Explore a missed update, change what was possible, and compare the response. Then see what would count as action and how the six values support it.',
  response: [
    {
      heading: 'What you cannot control',
      actions: ['The week that happened.', 'How they respond.'],
    },
    {
      heading: 'What you can own',
      actions: ['Acknowledge the effect.', 'Offer a realistic next step.', 'Make the correction.'],
    },
  ],
} as const;

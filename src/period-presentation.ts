// Work 04 presentation adaptations, for internal author review only.
// These are not quotations or approved public publication copy.
// Full teaching remains in period-content.ts. See docs/WORK-05-EDITORIAL-COMPANION.md.
import { empowermentNavigation } from './period-empowerment-content.ts';
export const periodPresentation = {
  introLead: empowermentNavigation.homeLead,
  connectedClarification:
    'The PERIOD Code is a connected standard for living. A specific behavior gives you one place to practice it. The six values continue to shape the rest of your life.',
  practiceInvitation:
    'Look at a missed update. Separate what was outside your control from what you could have done. Then follow the correction into action and see where the other values enter the work.',
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

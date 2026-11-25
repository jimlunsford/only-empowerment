import { executionOrientationAddition } from './execution-content.ts';
// Accepted D72-01/D72-04 wording plus the exact Work 80 S01 addition.
export const frameworkOrientation = {
  heading: 'Where to start',
  relationship:
    'The PERIOD Code establishes the values and standards you choose to live by. How to Rebuild Yourself teaches how to turn those standards into structure and action. The Discipline Loop explains how repeated action creates proof, builds self-trust, and keeps the work going through setbacks and correction. ' +
    executionOrientationAddition,
  choice:
    "Start where you need to. You don't have to complete one framework to benefit from another.",
} as const;

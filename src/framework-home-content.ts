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

export const frameworkPositioning =
  "Only Empowerment is free to use, with no accounts, no tracking, and nothing you enter leaving your browser. Each framework is a complete, self-contained companion to one of Jim Lunsford's four published books, built so anyone can learn the ideas and put them to work without buying anything first. Direct links to the books are included if you want them, but no purchase is required.";

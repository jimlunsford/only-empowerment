export const frameworks = {
  period: { name: 'The PERIOD Code', role: 'Values', url: 'https://jimlunsford.com/period-code/' },
  rebuild: {
    name: 'How to Rebuild Yourself',
    role: 'Process',
    url: 'https://jimlunsford.com/how-to-rebuild-yourself/',
  },
  loop: {
    name: 'The Discipline Loop',
    role: 'Reinforcement',
    url: 'https://jimlunsford.com/discipline-loop/',
  },
  execution: {
    name: 'Pure Execution Mode',
    role: 'Execution',
    url: 'https://jimlunsford.com/pure-execution-mode/',
  },
} as const;
export type FrameworkKey = keyof typeof frameworks;
export type Tool = {
  id: string;
  name: string;
  situation: string;
  description: string;
  output: string;
  frameworks: FrameworkKey[];
  handoff?: string;
  questions: string[];
};
export const tools: Tool[] = [
  {
    id: 'decision-room',
    name: 'Decision Room',
    situation: 'I have a decision to make.',
    description: 'Examine your options, values, and consequences. Make the call yourself.',
    output: 'Decision Record',
    frameworks: ['period'],
    handoff: 'next-move',
    questions: [
      'What is yours to decide?',
      'What does each option ask of you?',
      'Which choice can you stand behind, and why?',
    ],
  },
  {
    id: 'next-move',
    name: 'Next Move',
    situation: 'I need a place to start.',
    description: 'Turn a direction into one clear action you can actually take.',
    output: 'Execution Card',
    frameworks: ['execution'],
    handoff: 'do-it-now',
    questions: [
      'What needs to move forward?',
      'What can you do without waiting for someone else?',
      'What would count as done?',
    ],
  },
  {
    id: 'reset',
    name: 'Reset',
    situation: 'Something slipped.',
    description: 'Name the miss, repair the structure, and return to your standard.',
    output: 'Reset Plan',
    frameworks: ['period', 'rebuild', 'loop'],
    handoff: 'build-a-standard',
    questions: [
      'What slipped, and what did it affect?',
      'What support or structure was missing?',
      'What action restores alignment now?',
    ],
  },
  {
    id: 'build-a-standard',
    name: 'Build a Standard',
    situation: 'I need a clear line to live by.',
    description: 'Define the behavior, boundaries, and structure behind a personal standard.',
    output: 'Personal Standard',
    frameworks: ['period', 'rebuild'],
    handoff: 'do-it-now',
    questions: [
      'What standard are you choosing?',
      'What behavior supports or violates it?',
      'How will you protect it and correct a miss?',
    ],
  },
  {
    id: 'rebuild-map',
    name: 'Rebuild Map',
    situation: 'I am rebuilding something bigger.',
    description: 'Connect the standard you want to the structure and repeated action it needs.',
    output: 'Rebuild Map',
    frameworks: ['rebuild'],
    handoff: 'next-move',
    questions: [
      'What old standard has stopped working?',
      'What structure will support the new one?',
      'What repeated action will produce proof?',
    ],
  },
  {
    id: 'do-it-now',
    name: 'Do It Now',
    situation: 'I know what needs doing.',
    description: 'Make the action small enough to begin. Do it. Record what happened.',
    output: 'Action Record',
    frameworks: ['execution'],
    questions: [
      'What are you avoiding?',
      'What is the smallest real action?',
      'What did you actually complete?',
    ],
  },
];
export type WorkflowStage = 'lesson' | 'reflection' | 'decision' | 'action' | 'result';
// Concepts shared by tools, not a schema-driven form builder.
export type OutputArtifact = {
  schemaVersion: 1;
  toolId: string;
  title: string;
  sections: { label: string; text: string }[];
  status: 'planned' | 'attempted' | 'completed';
};
export type Handoff = {
  sourceTool: string;
  targetTool: string;
  fields: { label: string; text: string }[];
};

const source = {
  framework: 'Pure Execution Mode',
  canonical: 'https://jimlunsford.com/pure-execution-mode/',
  reviewed: '2026-09-25',
  tool: 'do-it-now',
  reviewer: 'Codex implementation review; Jim Lunsford product approval pending',
};
export const actionLessons = {
  task: {
    title: 'Start after the decision.',
    question: 'What are you doing now?',
    text: 'Name an action you already understand. Choose a beginning small enough to do now and real enough to be part of the work. If the decision is still open, step back instead of forcing execution.',
  },
  begin: {
    title: 'Check the facts, then begin.',
    question: 'Can this action actually begin now?',
    text: 'Information, permission, safety, resources, and support can matter before you act. If those are in place, you do not need another round of motivation. Begin when the action is available.',
  },
  result: {
    title: 'Record what actually happened.',
    question: 'What happened?',
    text: 'Starting and completing are different. Report whether the action is complete, partly done, or blocked after beginning. Your words describe the result; the tool does not judge your effort or assign proof.',
  },
};
export const governedActionLessons = Object.values(actionLessons).map((lesson) => ({
  ...source,
  ...lesson,
}));

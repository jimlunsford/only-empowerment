// Source governance lives with the actual lessons, not a disconnected copy.
const source = {
  framework: 'Pure Execution Mode',
  canonical: 'https://jimlunsford.com/pure-execution-mode/',
  reviewed: '2026-09-20',
  tool: 'next-move',
  reviewer: 'Codex implementation review; Jim Lunsford product approval pending',
};
export const lessons = [
  {
    title: 'Name what is stalled.',
    text: 'Give this action enough context to make sense later. A sentence or two is enough; private background is optional.',
    question: 'What needs movement?',
    field: 'situation',
  },
  {
    title: 'Choose an action you own.',
    text: 'You control what you do. You can influence a response, but another person owns their decision. Name one useful, observable action you can begin, with a manageable scope.',
    example:
      '“Send the completed request” is yours. “Get approval” depends on someone else. Writing a first draft can be a useful move; opening the document may be too little.',
    question: 'What is your next useful action?',
    field: 'action',
  },
  {
    title: 'Check before you commit.',
    text: 'Execution follows a direction you have chosen. Missing information, safety, law, required guidance, and needed support can change what is appropriate. You do not have to force certainty.',
    question: 'Is this ready to become an action plan?',
  },
  {
    title: 'Separate friction from a blocker.',
    text: 'Waiting for motivation or reopening a settled decision can delay a workable action. Missing permission, resources, information, or support can make it unworkable. You decide which is present.',
    question: 'What is likely to get in the way?',
    field: 'obstacle',
  },
  {
    title: 'Make the beginning recognizable.',
    text: 'Choose a time, an event, or a condition you can recognize. Let the start depend on what is needed, without adding a requirement to feel motivated.',
    question: 'What will start this action?',
    field: 'start',
  },
  {
    title: 'Give the action an edge.',
    text: 'Define a finish you can observe in your own behavior. Submitting an application can finish your action; getting hired depends on someone else. A clear boundary keeps the task from expanding.',
    question: 'What will count as complete?',
    field: 'completion',
  },
].map((lesson) => ({ ...source, ...lesson }));

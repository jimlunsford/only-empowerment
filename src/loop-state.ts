import { loopScenario, type LoopStateId } from './loop-practice-content.ts';
import { loopSectionIds } from './loop-content.ts';

// Only these public authored addresses are accepted. Choices never enter a URL.
export function loopRoute(fragment: string): string | null {
  if (
    fragment === '/loop' ||
    fragment === '/loop/practice' ||
    fragment === '/loop/practice?state=miss'
  )
    return fragment;
  const section = /^\/loop\?section=([a-z][a-z0-9-]*)$/.exec(fragment)?.[1];
  return section && loopSectionIds.some((id) => id === section) ? '/loop' : null;
}
export function nextLoopState(state: LoopStateId, option: number): LoopStateId {
  return loopScenario.states[state].options[option]?.next ?? state;
}

export type LoopSelection = { state: LoopStateId; history: LoopStateId[]; revision: number };
export const initialLoopSelection = (state: LoopStateId): LoopSelection => ({
  state,
  history: [],
  revision: 0,
});
export function chooseLoopOutcome(selection: LoopSelection, option: number): LoopSelection {
  if (!loopScenario.states[selection.state].options[option]) return selection;
  return {
    state: nextLoopState(selection.state, option),
    history: [...selection.history, selection.state],
    revision: selection.revision + 1,
  };
}
export function previousLoopChoice(selection: LoopSelection): LoopSelection {
  const previous = selection.history.at(-1);
  return previous === undefined
    ? selection
    : {
        state: previous,
        history: selection.history.slice(0, -1),
        revision: selection.revision + 1,
      };
}

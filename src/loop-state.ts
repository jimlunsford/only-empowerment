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

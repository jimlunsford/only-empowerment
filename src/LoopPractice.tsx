import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { loopScenario, type LoopStateId } from './loop-practice-content';
import { loopCycle, loopStateContent, loopTranscript } from './loop-view';
import { renderLoopNode } from './Loop';
import { nextLoopState } from './loop-state';

export function LoopPractice({ entry = 'pressure' }: { entry?: LoopStateId }) {
  const [selection, setSelection] = useState({ state: entry, revision: 0 });
  const heading = useRef<HTMLHeadingElement>(null);
  const state = loopScenario.states[selection.state];
  const choose = (id: LoopStateId) =>
    setSelection((old) => ({ state: id, revision: old.revision + 1 }));
  useLayoutEffect(() => {
    if (!selection.revision) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'start' });
  }, [selection]);
  return (
    <div class="loop-experience loop-practice">
      <header class="loop-practice-header">
        <p class="loop-kicker">An illustrative pressure point</p>
        <h1 tabIndex={-1}>{loopScenario.title}</h1>
        {loopScenario.intro.map((p) => (
          <p>{p}</p>
        ))}
      </header>
      <div class="loop-practice-layout">
        <div>
          <section
            class="loop-scenario"
            data-state={selection.state}
            aria-labelledby="loop-scenario-heading"
          >
            <h2 id="loop-scenario-heading" tabIndex={-1} ref={heading}>
              {state.heading}
            </h2>
            {loopStateContent(selection.state).map(renderLoopNode)}
            <div class="loop-choices" role="group" aria-label="Choose a response">
              {state.options.map((option, i) => (
                <button type="button" onClick={() => choose(nextLoopState(selection.state, i))}>
                  {option.label}
                  <span aria-hidden="true"> →</span>
                </button>
              ))}
            </div>
          </section>
          <p class="loop-status" role="status" aria-live="polite" aria-atomic="true">
            {selection.revision ? 'Example: ' + state.heading : ''}
          </p>
          <div class="loop-actions loop-reset">
            <button type="button" onClick={() => choose(loopScenario.initialState)}>
              Reset example
            </button>
            <a href="/read/loop-practice.html">Read or print every outcome</a>
            <a href="#/loop">Return to the teaching</a>
          </div>
        </div>
        {renderLoopNode(loopCycle('app'))}
      </div>
      <div class="loop-print-transcript">{renderLoopNode(loopTranscript())}</div>
    </div>
  );
}

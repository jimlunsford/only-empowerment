import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { loopScenario, type LoopStateId } from './loop-practice-content';
import { loopCycle, loopStateContent, loopTranscript } from './loop-view';
import { renderLoopNode } from './Loop';
import { chooseLoopOutcome, initialLoopSelection, previousLoopChoice } from './loop-state';

export function LoopPractice({ entry = 'pressure' }: { entry?: LoopStateId }) {
  const [selection, setSelection] = useState(() => initialLoopSelection(entry));
  const heading = useRef<HTMLHeadingElement>(null);
  const state = loopScenario.states[selection.state];
  const choose = (option: number) => setSelection((old) => chooseLoopOutcome(old, option));
  const reset = () => {
    if (location.hash === '#/loop/practice?state=miss') {
      // Replace the public entry address, not the private choice history.
      // Native navigation lets the router remount at its ordinary initial state.
      location.replace('#/loop/practice');
    } else
      setSelection((old) => ({
        ...initialLoopSelection(loopScenario.initialState),
        revision: old.revision + 1,
      }));
  };
  useLayoutEffect(() => {
    // Also discard choices when a whole document leaves via the back/forward cache.
    const leave = () => setSelection(initialLoopSelection(entry));
    window.addEventListener('pagehide', leave);
    return () => window.removeEventListener('pagehide', leave);
  }, [entry]);
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
                <button type="button" onClick={() => choose(i)}>
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
            <button
              type="button"
              disabled={!selection.history.length}
              onClick={() => setSelection(previousLoopChoice)}
            >
              Previous choice
            </button>
            <button type="button" onClick={reset}>
              Reset example
            </button>
            <a href="/read/loop-practice.html">Read or print every outcome</a>
            <a href="#/loop">Return to the teaching</a>
          </div>
          <p>
            Choices stay in this tab. Leaving or reloading clears them. Use the complete reading to
            link to a specific outcome.
          </p>
        </div>
        {renderLoopNode(loopCycle('app'))}
      </div>
      <div class="loop-print-transcript">{renderLoopNode(loopTranscript())}</div>
    </div>
  );
}

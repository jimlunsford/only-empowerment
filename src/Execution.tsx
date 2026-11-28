import { h, type ComponentChild } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { executionTeaching, type ExecutionNode } from './execution-view';
import {
  chooseWorkshop,
  eventCarry,
  workshopById,
  workshopHref,
  workshopLocation,
  workshopScreens,
  workshopSessionCopy,
  workshopStages,
  workshopOrigin,
  workshopBridges,
  type WorkshopChoices,
  type WorkshopOption,
} from './execution-workshop-content';

function renderExecutionNode(node: ExecutionNode): ComponentChild {
  return typeof node === 'string'
    ? node
    : h(node.tag, node.attrs, node.children.map(renderExecutionNode));
}
const Outcome = ({ option }: { option: WorkshopOption }) => (
  <>
    <p class="workshop-consequence">{option.consequence}</p>
    <p>{option.reasoning}</p>
  </>
);
export function Execution() {
  const { id, legacy } = workshopLocation(location.hash.slice(1));
  const screen = workshopById(id);
  const [choices, setChoices] = useState<WorkshopChoices>({});
  const [demonstrations, setDemonstrations] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState('');
  const feedback = useRef<HTMLHeadingElement>(null);
  const question = useRef<HTMLHeadingElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const feedbackRequested = useRef(false);
  const restartPending = useRef(false);
  const restartMessage =
    'Workshop restarted. Previous choices and open explanations have been cleared.';
  const option = screen.options?.find((entry) => entry.id === choices[id]);
  const stageScreens = workshopScreens.filter(
    (entry) => entry.stage === screen.stage && entry.id !== 'recover',
  );
  const position = stageScreens.findIndex((entry) => entry.id === id) + 1;
  const next = option?.next || screen.next;
  const takeoverChoice = workshopById('take-over').options!.find(
    (entry) => entry.id === choices['take-over'],
  );
  const back = id === 'arrange' && takeoverChoice?.next === 'recover' ? 'recover' : screen.back;
  const clear = () => {
    setChoices({});
    setDemonstrations({});
    setRevealed({});
    setAnnouncement('');
  };
  useLayoutEffect(() => {
    window.addEventListener('pagehide', clear);
    return () => window.removeEventListener('pagehide', clear);
  }, []);
  useLayoutEffect(() => {
    setAnnouncement(restartPending.current && id === 'welcome' ? restartMessage : '');
    restartPending.current = false;
    feedbackRequested.current = false;
  }, [id]);
  useLayoutEffect(() => {
    if (!feedbackRequested.current) return;
    feedbackRequested.current = false;
    feedback.current?.focus({ preventScroll: true });
    feedback.current?.scrollIntoView({ block: 'nearest' });
  }, [choices, demonstrations, revealed]);
  const choose = (choice: string) => {
    setChoices((old) => chooseWorkshop(old, id, choice));
    if (screen.deferred)
      setAnnouncement(
        'Choice kept for comparison. Continue when you are ready. Changing this choice clears later decisions in this sequence.',
      );
    else {
      setAnnouncement('');
      feedbackRequested.current = true;
    }
  };
  const reconsider = () => {
    setChoices((old) => {
      const next = { ...old };
      delete next[id];
      if (id === 'event') {
        delete next['event-wait'];
        delete next['event-close'];
      }
      if (id === 'event-wait') delete next['event-close'];
      return next;
    });
    setAnnouncement('Choice cleared. You can choose again or continue without choosing.');
    question.current?.focus();
  };
  const restart = () => {
    clear();
    restartPending.current = id !== 'welcome';
    location.hash = '/execution';
    title.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    setAnnouncement(restartMessage);
  };
  const guide = (
    <aside class="workshop-guide">
      <nav aria-label="Workshop stages">
        <p class="workshop-guide-title">The workshop</p>
        <a
          href={workshopHref('foundation')}
          aria-current={id === 'foundation' ? 'step' : undefined}
        >
          Why &amp; The Bargain
        </a>
        <ol>
          {workshopStages.map((stage, index) => (
            <li>
              <a
                href={workshopHref(stage.entry)}
                aria-current={screen.stage === index + 1 ? 'step' : undefined}
              >
                <span>{stage.title}</span>
              </a>
            </li>
          ))}
        </ol>
        <a href={workshopHref('reference')}>The five steps at a glance</a>
      </nav>
      {id === 'welcome' && (
        <a href="/read/execution.html" target="_blank" rel="noopener noreferrer">
          Complete reading and print edition (new tab)
        </a>
      )}
      <p>
        Move at your own pace. Continue is always available. Choosing an option does not advance the
        screen.
      </p>
      <details class="workshop-session">
        <summary>Choices, refresh and restart</summary>
        <p>{workshopSessionCopy}</p>
        <p>
          Browser Back and Forward restore screens within an active workshop. Changing an earlier
          independent decision clears the later decisions that depended on it. Leaving for another
          framework or opening the reading edition in this tab ends this workshop session. Opening
          the reading edition in a new tab preserves your active workshop choices.
        </p>
      </details>
      <button type="button" class="workshop-text-button" onClick={restart}>
        Restart workshop
      </button>
    </aside>
  );
  return (
    <>
      <article class="execution-screen workshop" data-workshop={id}>
        {id !== 'welcome' && (
          <div class="workshop-local-nav">
            <p class="workshop-kicker">Pure Execution Mode · Guided workshop</p>
            <div class="workshop-position">
              {screen.stage ? (
                <span>
                  Stage {screen.stage} of 4 ·{' '}
                  {id === 'recover'
                    ? 'Return to the work'
                    : `Screen ${position} of ${stageScreens.length}`}
                </span>
              ) : (
                <span>
                  {id === 'foundation' ? 'Foundation · Before Stage 1' : 'Field reference'}
                </span>
              )}
              <a href="/read/execution.html" target="_blank" rel="noopener noreferrer">
                Complete reading and print edition (new tab)
              </a>
            </div>
          </div>
        )}
        <div class="workshop-editorial">
          <div class={id === 'welcome' ? 'workshop-hero' : undefined}>
            <header class="workshop-heading">
              <h1 id={legacy || location.hash.slice(1)} tabIndex={-1} ref={title}>
                {screen.title}
              </h1>
              <p class="workshop-purpose">{screen.purpose}</p>
              {id === 'welcome' && (
                <div class="workshop-hero-actions">
                  <a class="workshop-continue" href={workshopHref('foundation')}>
                    Continue: Why &amp; The Bargain
                  </a>
                  <a href="#/">All frameworks</a>
                </div>
              )}
              {legacy && (
                <p class="workshop-legacy">
                  This earlier section link now opens the related workshop screen.{' '}
                  <a
                    href={'/read/execution.html#' + legacy}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read the original section in full (new tab)
                  </a>
                  .
                </p>
              )}
            </header>
            {id === 'welcome' && guide}
          </div>
          <div class="workshop-layout">
            {id === 'welcome' && (
              <section class="workshop-facts" aria-label="The situation">
                <p>{screen.facts}</p>
              </section>
            )}
            <div class="workshop-main">
              {id !== 'welcome' && (
                <section class="workshop-facts" aria-label="The situation">
                  <p>{screen.facts}</p>
                </section>
              )}
              {id === 'event-wait' && <p class="workshop-carry">{eventCarry(choices)}</p>}
              {id === 'recover' && takeoverChoice?.next === 'recover' && (
                <p class="workshop-carry">Your earlier move: {takeoverChoice.label}</p>
              )}
              {screen.teaching.map((paragraph) => (
                <p>{paragraph}</p>
              ))}
              {id === 'welcome' && (
                <p class="workshop-origin">
                  {workshopOrigin}{' '}
                  <a href="/read/execution.html#why" target="_blank" rel="noopener noreferrer">
                    Read the foundation (new tab)
                  </a>
                  .
                </p>
              )}
              {screen.action && (
                <section class="workshop-demonstration" aria-label="Demonstrated action">
                  <button
                    type="button"
                    aria-expanded={!!demonstrations[id]}
                    aria-controls="workshop-demonstration-result"
                    onClick={() => {
                      setDemonstrations((old) => ({ ...old, [id]: !old[id] }));
                      feedbackRequested.current = !demonstrations[id];
                    }}
                  >
                    {demonstrations[id] ? 'Hide the demonstrated result' : screen.action.label}
                  </button>
                  {demonstrations[id] && (
                    <div class="workshop-feedback" id="workshop-demonstration-result">
                      <h2 tabIndex={-1} ref={feedback}>
                        What changed
                      </h2>
                      <p class="workshop-consequence">{screen.action.result}</p>
                      <h3>What remains</h3>
                      <p>{screen.action.remains}</p>
                    </div>
                  )}
                </section>
              )}
              {screen.options && (
                <section class="workshop-decision" aria-labelledby="workshop-question">
                  <h2 id="workshop-question" ref={question} tabIndex={-1}>
                    {screen.question}
                  </h2>
                  <div class="workshop-options" role="group" aria-labelledby="workshop-question">
                    {screen.options.map((entry) => (
                      <button
                        type="button"
                        aria-label={entry.label}
                        aria-pressed={option?.id === entry.id}
                        onClick={() => choose(entry.id)}
                      >
                        <span>{entry.label}</span>
                        {option?.id === entry.id && (
                          <span class="workshop-selected" aria-hidden="true">
                            Selected
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {option && !screen.deferred && (
                    <div class="workshop-feedback">
                      <h2 ref={feedback} tabIndex={-1}>
                        What this choice does
                      </h2>
                      <Outcome option={option} />
                    </div>
                  )}
                  {option && (
                    <button class="workshop-text-button" type="button" onClick={reconsider}>
                      Reconsider this decision
                    </button>
                  )}
                  {screen.deferred ? (
                    <p>
                      <a href={workshopHref('compare')}>
                        Skip practice and compare the reasoning now
                      </a>
                    </p>
                  ) : (
                    <>
                      <button
                        class="workshop-text-button"
                        type="button"
                        aria-expanded={!!revealed[id]}
                        aria-controls="workshop-comparison"
                        onClick={() => setRevealed((old) => ({ ...old, [id]: !old[id] }))}
                      >
                        {revealed[id]
                          ? 'Hide comparison'
                          : 'Compare every option and read the explanation'}
                      </button>
                      {revealed[id] && (
                        <section
                          id="workshop-comparison"
                          class="workshop-comparison"
                          aria-label="Compare the reasoning"
                        >
                          <h2>The responsibility decides</h2>
                          <p>{screen.explanation}</p>
                          {screen.options.map((entry) => (
                            <section>
                              <h3>{entry.label}</h3>
                              <Outcome option={entry} />
                            </section>
                          ))}
                        </section>
                      )}
                    </>
                  )}
                </section>
              )}
              {id === 'compare' &&
                ['event', 'event-wait', 'event-close'].map((key) => {
                  const decision = workshopById(key);
                  const selected = decision.options!.find((entry) => entry.id === choices[key]);
                  return (
                    <section class="workshop-review" aria-label={decision.title}>
                      <h2>{decision.title}</h2>
                      <p>
                        <strong>{selected ? 'Your choice: ' : 'No choice in this session.'}</strong>
                        {selected?.label}
                      </p>
                      {selected && <Outcome option={selected} />}
                      <p>{decision.explanation}</p>
                      <details>
                        <summary>Compare all options for this decision</summary>
                        {decision.options!.map((entry) => (
                          <section>
                            <h3>{entry.label}</h3>
                            <Outcome option={entry} />
                          </section>
                        ))}
                      </details>
                      <a href={workshopHref(key)}>Revisit this decision</a>
                    </section>
                  );
                })}
              {id === 'your-responsibility' && (
                <p>
                  <a href="/read/execution.html#miss" target="_blank" rel="noopener noreferrer">
                    Read the complete explanation of repair after a miss (new tab)
                  </a>
                  .{' '}
                  <a href="/read/execution.html#daily" target="_blank" rel="noopener noreferrer">
                    Read about ordinary responsibilities, support and rest (new tab)
                  </a>
                  .{' '}
                  <a
                    href="https://www.amazon.com/dp/B0HR68MLGR"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Paperback &amp; Kindle on Amazon (new tab)
                  </a>
                </p>
              )}
              {id === 'reference' && (
                <p>
                  <a href="/read/execution.html#change" target="_blank" rel="noopener noreferrer">
                    Changed plans (new tab)
                  </a>{' '}
                  ·{' '}
                  <a href="/read/execution.html#miss" target="_blank" rel="noopener noreferrer">
                    Missed commitments (new tab)
                  </a>{' '}
                  ·{' '}
                  <a href="/read/execution.html#daily" target="_blank" rel="noopener noreferrer">
                    Support and daily use (new tab)
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://www.amazon.com/dp/B0HR68MLGR"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Paperback &amp; Kindle on Amazon (new tab)
                  </a>
                </p>
              )}
              <p class="workshop-status" role="status" aria-live="polite" aria-atomic="true">
                {announcement}
              </p>
              <nav class="workshop-navigation" aria-label="Workshop screen navigation">
                {back ? (
                  <a href={workshopHref(back)}>
                    Back <span>{workshopById(back).title}</span>
                  </a>
                ) : (
                  <a href="#/">All frameworks</a>
                )}
                {next ? (
                  <a class="workshop-continue" href={workshopHref(next)}>
                    Continue <span>{workshopById(next).title}</span>
                  </a>
                ) : (
                  <a href="#/">Choose another framework</a>
                )}
              </nav>
              {(screen.stage === 2 || screen.stage === 3) && (
                <p>
                  <a href={workshopHref(screen.stage === 2 ? 'access' : 'event')}>
                    Skip this practice and continue to{' '}
                    {screen.stage === 2 ? 'changed facts' : 'independent work'}
                  </a>
                </p>
              )}
              {workshopBridges[id] && <p class="workshop-bridge">{workshopBridges[id]}</p>}
              {id === 'welcome' && (
                <p>
                  <a href="/read/execution.html" target="_blank" rel="noopener noreferrer">
                    Open the complete reading edition (new tab)
                  </a>{' '}
                  ·{' '}
                  <a
                    href="https://www.amazon.com/dp/B0HR68MLGR"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Paperback &amp; Kindle on Amazon (new tab)
                  </a>
                </p>
              )}
            </div>
            {id !== 'welcome' && guide}
          </div>
        </div>
      </article>
      <div class="execution-print">{renderExecutionNode(executionTeaching('print'))}</div>
    </>
  );
}

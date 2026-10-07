import { DoItNow } from './DoItNow';
import { RebuildMap } from './RebuildMap';
import { Reset } from './Reset';
import { BuildStandard } from './BuildStandard';
import { render } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { frameworks, tools } from './model';
import { PageIntro } from './components/shared';
import { DecisionRoom } from './DecisionRoom';
import { NextMove } from './NextMove';
import { SavedWork, LocalDataControls } from './SavedWork';
import { useLocalWork, type LocalWork } from './use-local-work';
import './style.css';
const repository = 'https://github.com/jimlunsford/only-empowerment';
function route() {
  return location.hash.slice(1) || '/';
}
function Home() {
  return (
    <>
      <section class="hero">
        <div>
          <h1 tabIndex={-1}>
            Think clearly.
            <br />
            Choose deliberately.
            <br />
            <span>Act on what is yours.</span>
          </h1>
          <p class="hero-copy">
            A place to sort out the decision, define the standard, and find the action you can take
            next.
          </p>
          <div class="hero-actions">
            <a class="button primary" href="#/tools/next-move">
              Open Next Move <span aria-hidden="true">↗</span>
            </a>
            <a class="quiet-link" href="#/approach">
              How it works
            </a>
          </div>
          <p class="privacy-line">
            <span class="small-square" aria-hidden="true" />
            No account. No tracking of what you enter. No answer collection.
          </p>
        </div>
        <aside class="hero-note">
          <p class="note-title">
            A useful question.
            <br />A clearer choice.
            <br />
            Something to do.
          </p>
          <p>
            The tool helps you think.
            <br />
            You make the decision.
          </p>
          <div class="note-divider" />
          <p class="small">
            Leave with a record you can use.
            <br />
            Leave when you are ready to act.
          </p>
        </aside>
      </section>
      <section class="tools-section" aria-labelledby="tools-title">
        <div class="section-heading">
          <h2 id="tools-title">Start with what is in front of you.</h2>
          <p>
            Decision Room, Next Move, Build a Standard, Reset, Rebuild Map, and Do It Now are
            available.
            <br />
            Each has a different job.
          </p>
        </div>
        <ToolGrid />
      </section>
      <section class="bottom-band">
        <h2>Your thinking should stay yours.</h2>
        <div>
          <p>
            No account is required. What you enter into the tools is not sent to analytics. Work
            stays in memory unless you choose to save a Decision Record, Execution Card, Personal
            Standard, Reset Plan, Rebuild Map, or Action Record on this device. Read how saving and
            deletion work.
          </p>
          <a href="#/privacy">
            Understand your privacy <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </>
  );
}
function ToolGrid() {
  return (
    <div class="tool-grid">
      {tools.map((tool) => (
        <a class="tool-card" key={tool.id} href={`#/tools/${tool.id}`}>
          <p class="situation">{tool.situation}</p>
          <h3>{tool.name}</h3>
          <p>{tool.description}</p>
          <div class="card-bottom">
            <span>{tool.output}</span>
            <span aria-hidden="true">↗</span>
          </div>
        </a>
      ))}
    </div>
  );
}
function ToolsPage() {
  return (
    <>
      <PageIntro title="Different situations. Useful next steps.">
        <p>
          Use Decision Room to choose a direction, Next Move to define an executable action, or
          Build a Standard to choose a clear behavioral line. Reset helps you correct a miss and
          return to a standard. Rebuild Map connects a sustained rebuild to structure, repeated
          action, and proof. Do It Now helps you begin a known action and record what happened.
        </p>
      </PageIntro>
      <ToolGrid />
    </>
  );
}
function Approach() {
  return (
    <div class="narrow">
      <PageIntro title="Understand it. Use it. Make it yours.">
        <p>
          You should not need to study a system before you can use a tool. A short lesson gives you
          the distinction you need for the next question.
        </p>
      </PageIntro>
      <ol class="approach-steps">
        {[
          ['Lesson', 'Learn a useful distinction at the moment it matters.'],
          ['Reflection', 'Apply it to the situation in front of you.'],
          [
            'Decision',
            'Choose what you are willing to do. The application does not choose for you.',
          ],
          ['Action', 'Define a real step you can take outside this page.'],
          ['Result', 'Record what happened, including what still needs correction.'],
        ].map(([name, text]) => (
          <li key={name}>
            <h2>{name}</h2>
            <p>{text}</p>
          </li>
        ))}
      </ol>
      <section class="principle-panel">
        <h2>Support should increase capability.</h2>
        <p>
          No scores, streaks, or labels. No reason to keep feeding a system once you have what you
          need. The aim is useful work you can take into your life.
        </p>
      </section>
      <section class="framework-list">
        <h2>The thinking behind the tools</h2>
        <p>
          These frameworks were developed by Jim Lunsford. The application teaches small, relevant
          parts of them. The full explanations live on JimLunsford.com.
        </p>
        {Object.values(frameworks).map((f) => (
          <a href={f.url} rel="noreferrer" key={f.url}>
            <span>{f.name}</span>
            <span>{f.role} ↗</span>
          </a>
        ))}
      </section>
    </div>
  );
}
function Privacy({ work }: { work: LocalWork }) {
  return (
    <div class="narrow">
      <PageIntro title="Your answers are not ours to collect.">
        <p>
          Decision Room, Next Move, Build a Standard, Reset, Rebuild Map, and Do It Now work without
          an account or answer submission. Saving is a choice you make on this device.
        </p>
      </PageIntro>
      <LocalDataControls work={work} />
      <div class="privacy-facts">
        <section>
          <h2>What stays in the page</h2>
          <p>
            Decision Room, Next Move, Build a Standard, Reset, Rebuild Map, and Do It Now keep
            answers in memory during navigation within this site. Reloading or closing the tab can
            discard unsaved work. Nothing is automatically saved.
          </p>
          <p>
            Choose “Save on this device” to store only the confirmed Decision Record, Execution
            Card, Personal Standard, Reset Plan, Rebuild Map, or Action Record in this browser
            profile. Someone using this profile may see it. Clearing site data can remove it. There
            is no server recovery, cross-device sync, or transfer between sites.
          </p>
        </section>
        <section>
          <h2>What leaves the browser</h2>
          <p>
            Your browser requests the application files from the host. Those requests expose
            ordinary connection information, such as your IP address and requested file paths. The
            application has no answer-submission endpoint and does not intentionally send your
            response over the network.
          </p>
          <p>
            Hosting systems keep operational request logs. Retention depends on the host, provider,
            and backup policies; deleting local app data does not delete those logs.
          </p>
          {__STAGING__ && (
            <p>
              The staging policy rotates daily and retains up to 14 rotated logs. Provider logs and
              backup retention are separate; this is not a promise that all infrastructure copies
              disappear after 14 days.
            </p>
          )}
          <p>Answers are not included in ordinary application requests by design.</p>
        </section>
        <section>
          <h2>Analytics and tracking boundaries</h2>
          <p>
            Only Empowerment will use Google Analytics on the production site to understand
            aggregate site and product usage.{' '}
            {__STAGING__
              ? 'Google Analytics is not enabled on this development staging site.'
              : 'Google Analytics is not enabled in this build.'}
          </p>
          <p>
            Analytics may include page and tool visits, traffic source, limited browser and device
            information, broad geographic information, and fixed content-free events such as a tool
            being opened, started, or reaching a result.
          </p>
          <p>
            What you enter into the tools is not sent to Google Analytics. Tool answers, Saved Work,
            artifact contents, copied text, and other user-authored private data are excluded.
          </p>
          <p>
            Only Empowerment does not use session replay, heatmaps, advertising personalization,
            remarketing, Google Signals, User-ID, or user-provided data for analytics. It does not
            build behavioral advertising profiles.
          </p>
          <p>
            No AI service or remote fonts are used. Links to JimLunsford.com and GitHub open those
            sites only when you choose them, with no answer content added to the link.
          </p>
        </section>
        <section>
          <h2>Copy and print are your choice</h2>
          <p>
            Copying puts the record on your device’s clipboard. Your operating system may sync that
            clipboard. Printing or saving a PDF passes content to your browser and printing system.
            Those copies and device backups are yours to manage and are not removed by deleting
            local data.
          </p>
        </section>
        <section>
          <h2>The limits matter</h2>
          <p>
            This is not encrypted private storage. Shared devices, browser extensions, browser
            recovery features, screenshots, and a compromised device or host can expose information.
            No website can prove privacy simply by publishing its source.
          </p>
        </section>
        <section>
          <h2>Inspect the source</h2>
          <p>
            The footer links this build to its Git commit. Public source helps you inspect intended
            behavior; a commit label alone does not prove the delivered files match it. The build
            also includes file checksums for deployment verification.
          </p>
          <a class="button" href={repository} rel="noreferrer">
            View the source on GitHub ↗
          </a>
          <p class="small">
            Copyright (C) 2026 Jim Lunsford. Only Empowerment is free software under
            AGPL-3.0-or-later and comes without warranty. You may use, modify, and redistribute it
            under that license. View the <a href="/LICENSE.txt">license</a> and this build’s{' '}
            <a href={__BUILD__.source} rel="noreferrer">
              corresponding source
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <div class="narrow">
      <PageIntro title="That page is not here.">
        <p>
          <a href="#/tools">Explore the tool collection</a> or <a href="#/">return home</a>.
        </p>
      </PageIntro>
    </div>
  );
}
function App() {
  const [path, setPath] = useState(route);
  const work = useLocalWork();
  const initial = useRef(true);
  useEffect(() => {
    const onHash = () => setPath(route());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useLayoutEffect(() => {
    const heading = document.querySelector('h1');
    document.title = `${heading?.textContent || 'Page'} | Only Empowerment`;
    if (initial.current) {
      initial.current = false;
      return;
    }
    heading?.focus();
    window.scrollTo(0, 0);
  }, [path]);
  let content;
  if (path === '/') content = <Home />;
  else if (path === '/tools') content = <ToolsPage />;
  else if (path === '/approach') content = <Approach />;
  else if (path === '/privacy') content = <Privacy work={work} />;
  else if (path === '/saved') content = <SavedWork work={work} />;
  else if (path === '/tools/decision-room') content = <DecisionRoom work={work} />;
  else if (path === '/tools/build-a-standard') content = <BuildStandard work={work} />;
  else if (path === '/tools/rebuild-map') content = <RebuildMap work={work} />;
  else if (path === '/tools/reset') content = <Reset work={work} />;
  else if (path === '/tools/do-it-now') content = <DoItNow work={work} />;
  else if (path === '/tools/next-move') content = <NextMove work={work} />;
  else content = <NotFound />;
  return (
    <>
      <a
        class="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <header class="site-header">
        <a class="wordmark" href="#/" aria-label="Only Empowerment home">
          only<span>empowerment</span>
          <span class="brand-dot" aria-hidden="true">
            .
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#/tools" aria-current={path.startsWith('/tools') ? 'page' : undefined}>
            The tools
          </a>
          <a href="#/saved" aria-current={path === '/saved' ? 'page' : undefined}>
            Saved work
          </a>
          <a href="#/approach" aria-current={path === '/approach' ? 'page' : undefined}>
            The approach
          </a>
          <a href="#/privacy" aria-current={path === '/privacy' ? 'page' : undefined}>
            Privacy & source
          </a>
        </nav>
      </header>
      {__STAGING__ && (
        <div class="staging-banner" role="region" aria-label="Development status">
          <span class="stage-label">Development staging</span>
          <span>
            Current tools are staged for development and review. Not a production release.
          </span>
          <a href="#/tools/next-move">
            Try Next Move <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
      <main id="main" tabIndex={-1} class="site-main">
        {work.notice && (
          <p class="global-notice no-print" role="status">
            {work.notice}
          </p>
        )}
        {content}
      </main>
      <footer class="site-footer">
        <div>
          <p>
            Built by{' '}
            <a href="https://jimlunsford.com/" rel="noreferrer">
              Jim Lunsford
            </a>
          </p>
        </div>
        <div class="footer-meta">
          <a href="#/privacy">Privacy & source</a>
          <p class="small">
            v{__BUILD__.version} ·{' '}
            {__BUILD__.dirty ? (
              <span>local changes · base {__BUILD__.commit.slice(0, 7)}</span>
            ) : (
              <a href={__BUILD__.source} rel="noreferrer">
                source {__BUILD__.commit.slice(0, 7)}
              </a>
            )}
          </p>
        </div>
      </footer>
    </>
  );
}
render(<App />, document.getElementById('app')!);

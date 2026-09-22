import { BuildStandard } from './BuildStandard';
import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { frameworks, tools } from './model';
import { PageIntro, SourceNote } from './components/shared';
import { Preview } from './Preview';
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
          <p class="eyebrow">Practical tools. Your decisions.</p>
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
            No account. No trackers. No answer collection.
          </p>
        </div>
        <aside class="hero-note">
          <p class="eyebrow">The work belongs to you</p>
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
          <div>
            <p class="eyebrow">The tool collection</p>
            <h2 id="tools-title">Start with what is in front of you.</h2>
          </div>
          <p>
            Decision Room, Next Move, and Build a Standard are available on staging.
            <br />
            Each has a different job.
          </p>
        </div>
        <ToolGrid />
      </section>
      <section class="bottom-band">
        <div>
          <p class="eyebrow">Private by design</p>
          <h2>Your thinking should stay yours.</h2>
        </div>
        <div>
          <p>
            No accounts or analytics. Work stays in memory unless you choose to save a Decision
            Record, Execution Card, or Personal Standard on this device. Read how saving and
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
      {tools.map((tool, i) => (
        <a class="tool-card" key={tool.id} href={`#/tools/${tool.id}`}>
          <div class="card-top">
            <span class="tool-number">0{i + 1}</span>
            <span class="availability">
              {tool.id === 'next-move'
                ? 'Try Next Move'
                : tool.id === 'decision-room'
                  ? 'Try Decision Room'
                  : tool.id === 'build-a-standard'
                    ? 'Try Build a Standard'
                    : 'In development'}
            </span>
          </div>
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
      <PageIntro label="The tool collection" title="Different situations. Useful next steps.">
        <p>
          Use Decision Room to choose a direction, Next Move to define an executable action, or
          Build a Standard to choose a clear behavioral line. The other three tools are in
          development.
        </p>
      </PageIntro>
      <ToolGrid />
    </>
  );
}
function ToolPage({ id }: { id: string }) {
  const tool = tools.find((t) => t.id === id);
  if (!tool) return <NotFound />;
  const next = tools.find((t) => t.id === tool.handoff);
  return (
    <div class="narrow">
      <a class="back-link" href="#/tools">
        ← All tools
      </a>
      <PageIntro label="Tool outline · In development" title={tool.name}>
        <p>{tool.description}</p>
      </PageIntro>
      <div class="detail-panel">
        <h2>{tool.situation}</h2>
        <p>This tool will help you work through questions such as:</p>
        <ul class="question-list">
          {tool.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
        <div class="deliverable">
          <p class="eyebrow">What you will leave with</p>
          <h2>{tool.output}</h2>
          <p>A clear record in your own words, ready to keep, copy, or print.</p>
        </div>
        <SourceNote items={tool.frameworks} />
      </div>
      {next && (
        <section class="handoff-outline">
          <h2>When a next tool is useful</h2>
          <p>
            An optional continuation to {next.name} will help carry selected work forward. You will
            choose what to bring. Nothing will move automatically.
          </p>
        </section>
      )}
      <p class="availability-note">
        This tool is not available yet. <a href="#/preview">View the interaction preview</a>.
      </p>
    </div>
  );
}
function Approach() {
  return (
    <div class="narrow">
      <PageIntro label="How it works" title="Understand it. Use it. Make it yours.">
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
        ].map(([name, text], i) => (
          <li key={name}>
            <span class="step-number">0{i + 1}</span>
            <div>
              <h2>{name}</h2>
              <p>{text}</p>
            </div>
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
      <PageIntro label="Privacy & source" title="Your answers are not ours to collect.">
        <p>
          Decision Room, Next Move, and Build a Standard work without an account or answer
          submission. Saving is a choice you make on this device.
        </p>
      </PageIntro>
      <LocalDataControls work={work} />
      <div class="privacy-facts">
        <section>
          <h2>What stays in the page</h2>
          <p>
            Decision Room, Next Move, and Build a Standard keep answers in memory during navigation
            within this site. Reloading or closing the tab can discard unsaved work. Nothing is
            automatically saved. The older interaction preview remains disposable when you leave it.
          </p>
          <p>
            Choose “Save on this device” to store only the confirmed Decision Record, Execution
            Card, or Personal Standard in this browser profile. Someone using this profile may see
            it. Clearing site data can remove it. There is no server recovery, device sync, or
            transfer from staging to production.
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
            Hosting systems keep operational request logs. The staging policy rotates daily and
            retains up to 14 rotated logs. Provider logs and backup retention are separate; this is
            not a promise that all infrastructure copies disappear after 14 days.
          </p>
        </section>
        <section>
          <h2>No trackers. No AI service.</h2>
          <p>
            No advertising, analytics, session replay, remote fonts, third-party scripts, or AI APIs
            are loaded by the application. Links to JimLunsford.com and GitHub open those sites only
            when you choose them, with no answer content added to the link.
          </p>
        </section>
        <section>
          <h2>Copy and print are your choice</h2>
          <p>
            Copying puts the record on your device’s clipboard. Your operating system may sync that
            clipboard. Printing or saving a PDF passes content to your browser and printing system.
            Those copies are yours to manage and are not removed by deleting local data.
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
      <PageIntro label="Page not found" title="That page is not here.">
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
  useEffect(() => {
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
  else if (path === '/tools/next-move') content = <NextMove work={work} />;
  else if (path === '/preview') content = <Preview key={work.clearEpoch} />;
  else if (path.startsWith('/tools/')) content = <ToolPage id={path.slice(7)} />;
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
      <div class="staging-banner" role="region" aria-label="Development status">
        <span class="stage-label">Development staging</span>
        <span>Current tools are staged for development and review. Not a production release.</span>
        <a href="#/tools/next-move">
          Try Next Move <span aria-hidden="true">↗</span>
        </a>
      </div>
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
          <p class="small">Practical tools. Ownership stays with you.</p>
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

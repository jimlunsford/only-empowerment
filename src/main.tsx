import { SiteNotices } from './SiteNotices';
import { DoItNow } from './DoItNow';
import { RebuildMap } from './RebuildMap';
import { Reset } from './Reset';
import { BuildStandard } from './BuildStandard';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { useRoute } from './use-route';
import { PeriodIntro, PeriodOwnership, PeriodUnavailable, PeriodBook } from './PeriodLearning';
import { PeriodStandard } from './PeriodStandard';
import { PracticeOwnership } from './PracticeOwnership';
import { PurposeLesson, PurposeEvening } from './Purpose';
import { newPurposeSession } from './period-purpose-content';
import { newPracticeSession, practiceViews } from './period-practice-content';
import { newPeriodSession, enterPeriodExercise, hasPeriodDraft } from './period-standard-model';
import { periodBook } from './period-content';
import { ConfirmDialog } from './components/work';
import { frameworks, tools } from './model';
import { PageIntro } from './components/shared';
import { DecisionRoom } from './DecisionRoom';
import { NextMove } from './NextMove';
import { SavedWork, LocalDataControls } from './SavedWork';
import { useLocalWork, type LocalWork } from './use-local-work';
import './style.css';
import './period.css';
import './period-practice.css';
import './period-purpose.css';
import './period-resilience.css';
import './period-integrity.css';
import './period-discipline.css';
import './period-empowerment.css';
import './navigation.css';
import './period-lessons.css';
import './site-footer.css';
import { EmpowermentLesson, EmpowermentConversation } from './Empowerment';
import { DisciplineLesson, DisciplinePattern } from './Discipline';
import { IntegrityLesson, IntegrityRecord } from './Integrity';
import { ResilienceLesson, ResiliencePressure } from './Resilience';
const repository = 'https://github.com/jimlunsford/only-empowerment';
function ToolGrid() {
  return (
    <div class="tool-grid legacy-catalog">
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
      <div class="legacy-info">
        <PageIntro title="Legacy tools">
          <p>
            These earlier tools remain available, along with work you chose to save in this browser.
            The PERIOD Code lessons are now the main learning experience.
          </p>
          <p>
            Moving these tools out of the main navigation does not delete saved records. Open Saved
            work to return to a record, or choose a tool below.
          </p>
          <div class="legacy-links">
            <a href="#/saved">Open Saved work</a>
            <a href="#/period/teaching-order">Explore the values</a>
            <a href="#/approach">About the legacy tools</a>
          </div>
        </PageIntro>
      </div>
      <ToolGrid />
    </>
  );
}
function Approach() {
  return (
    <div class="narrow legacy-info">
      <PageIntro title="About the legacy tools">
        <p>
          These earlier tools pair short explanations with reflection, a decision, a practical
          action, and an honest record of what happened. Those are workflow ideas, not five values
          and not a replacement for The PERIOD Code. You make the decision; the tool does not choose
          or certify it for you.
        </p>
        <p>
          Use a tool when it helps with work you already need to do. You do not need to complete
          every tool. The aim is useful action outside this page, without scores, streaks, or
          labels.
        </p>
        <div class="legacy-links">
          <a href="#/tools">Return to Legacy tools</a>
          <a href="#/saved">Open Saved work</a>
        </div>
      </PageIntro>
      <section class="framework-list">
        <h2>Framework sources behind these tools</h2>
        <p>
          These frameworks were developed by Jim Lunsford. The PERIOD Code teaches values; How to
          Rebuild Yourself teaches a rebuilding process; The Discipline Loop teaches reinforcement;
          Pure Execution Mode teaches execution. These source pages are references, not links to
          finished Only Empowerment companions for the other frameworks.
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
    <div class="narrow legacy-info">
      <PageIntro title="Your answers are not ours to collect.">
        <p>
          You can read the six lessons and explore their examples without an account or submitting
          personal answers. The optional Standard Card stays in the open tab. The legacy tools save
          a record in this browser only when you choose Save on this device.
        </p>
      </PageIntro>
      <LocalDataControls work={work} />
      <div class="privacy-facts">
        <section>
          <h2>What stays in the page</h2>
          <p>
            The optional PERIOD Standard Card keeps its draft only in application session memory in
            this open tab during in-site navigation. It never enters Saved work or browser storage.
            Reloading or closing can discard it; copy or print anything you want to keep.
          </p>
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
            and backup policies; deleting legacy tool data does not delete those logs.
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
            Google Analytics is not enabled in this build. Production is planned to use minimal
            aggregate site and product usage analytics. Your written answers, Saved work records,
            Standard Card text, and clipboard contents are excluded. We will update this page before
            activating analytics.
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
            Clipboard copies, PDFs, printouts, screenshots, and device backups are yours to manage
            and are not removed by deleting legacy tool data.
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
    <div class="narrow legacy-info">
      <PageIntro title="That page is not here.">
        <p>
          <a href="#/period/teaching-order">Explore the values</a> or{' '}
          <a href="#/tools">open Legacy tools</a>.
        </p>
      </PageIntro>
    </div>
  );
}
function App() {
  const path = useRoute();
  const editorial = path === '/' || path.startsWith('/period/');
  const work = useLocalWork();
  const [periodSession, setPeriodSession] = useState(newPeriodSession);
  const [practiceSession, setPracticeSession] = useState(newPracticeSession);
  const [purposeSession, setPurposeSession] = useState(newPurposeSession);
  const purposeView = path === '/period/values/purpose' || path === '/period/purpose/evening';
  const resilienceView =
    path === '/period/values/resilience' || path === '/period/resilience/pressure';
  const integrityView = path === '/period/values/integrity' || path === '/period/integrity/record';
  const disciplineView =
    path === '/period/values/discipline' || path === '/period/discipline/pattern';
  const empowermentView =
    path === '/period/values/empowerment' || path === '/period/empowerment/conversation';
  const openEmpowermentCard = () =>
    setPeriodSession((old) => enterPeriodExercise(old, 'empowerment'));
  const openDisciplineCard = () =>
    setPeriodSession((old) => enterPeriodExercise(old, 'discipline'));
  const openIntegrityCard = () => setPeriodSession((old) => enterPeriodExercise(old, 'integrity'));
  const practiceView = practiceViews.find((view) => view.path === path);
  const openPracticeCard = () => setPeriodSession((old) => enterPeriodExercise(old, 'ownership'));
  const openPurposeCard = () => setPeriodSession((old) => enterPeriodExercise(old, 'purpose'));
  const openResilienceCard = () =>
    setPeriodSession((old) => enterPeriodExercise(old, 'resilience'));
  const [bookExit, setBookExit] = useState(false);
  let content;
  if (path === '/') content = <PeriodIntro />;
  else if (path === '/period/values/ownership' || path === '/period/values')
    content = <PeriodOwnership />;
  else if (path === '/period/values/purpose')
    content = <PurposeLesson openCard={openPurposeCard} />;
  else if (path === '/period/purpose/evening')
    content = <PurposeEvening session={purposeSession} setSession={setPurposeSession} />;
  else if (path === '/period/values/resilience')
    content = <ResilienceLesson openCard={openResilienceCard} />;
  else if (path === '/period/resilience/pressure') content = <ResiliencePressure />;
  else if (path === '/period/values/integrity')
    content = <IntegrityLesson openCard={openIntegrityCard} />;
  else if (path === '/period/integrity/record') content = <IntegrityRecord />;
  else if (path === '/period/values/discipline')
    content = <DisciplineLesson openCard={openDisciplineCard} />;
  else if (path === '/period/discipline/pattern') content = <DisciplinePattern />;
  else if (path === '/period/values/empowerment')
    content = <EmpowermentLesson openCard={openEmpowermentCard} />;
  else if (path === '/period/empowerment/conversation') content = <EmpowermentConversation />;
  else if (path.startsWith('/period/values/')) content = <PeriodUnavailable />;
  else if (practiceView)
    content = (
      <PracticeOwnership
        view={practiceView}
        session={practiceSession}
        setSession={setPracticeSession}
        openCard={openPracticeCard}
      />
    );
  else if (path === '/period/standard')
    content = <PeriodStandard session={periodSession} setSession={setPeriodSession} />;
  else if (path === '/period/book') content = <PeriodBook standalone />;
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
    <div class={`site-shell ${editorial ? 'period-shell' : ''}`}>
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
      <div
        class={`period-review-notice no-print ${__STAGING__ ? 'staging-banner' : ''}`}
        role="region"
        aria-label="Review status"
      >
        {__STAGING__ && (
          <span class="stage-label">Development staging. Not a production release.</span>
        )}
        <span>
          Internal review. Teaching copy is proposed, not approved for public publication.
        </span>
      </div>
      <header class="site-header">
        <a class="wordmark" href="#/" aria-label="Only Empowerment home">
          only<span>empowerment</span>
          <span class="brand-dot" aria-hidden="true">
            .
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a
            href="#/"
            aria-current={
              path === '/' && location.hash !== '#/period/teaching-order' ? 'page' : undefined
            }
          >
            Why PERIOD?
          </a>
          <a
            href="#/period/teaching-order"
            aria-current={
              location.hash === '#/period/teaching-order'
                ? 'location'
                : path.startsWith('/period/') &&
                    path !== '/period/standard' &&
                    path !== '/period/book'
                  ? 'location'
                  : undefined
            }
          >
            Explore the values
          </a>
          <a
            href="#/period/standard"
            aria-current={path === '/period/standard' ? 'page' : undefined}
            onClick={(event) => {
              if (
                (practiceView ||
                  purposeView ||
                  resilienceView ||
                  integrityView ||
                  disciplineView ||
                  empowermentView) &&
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey
              )
                empowermentView
                  ? openEmpowermentCard()
                  : disciplineView
                    ? openDisciplineCard()
                    : integrityView
                      ? openIntegrityCard()
                      : resilienceView
                        ? openResilienceCard()
                        : purposeView
                          ? openPurposeCard()
                          : openPracticeCard();
            }}
          >
            Optional Standard Card
          </a>
        </nav>
      </header>
      <main
        id="main"
        tabIndex={-1}
        class="site-main"
        onClick={(e) => {
          const link = (e.target as Element).closest('a');
          if (link?.href === periodBook.url && hasPeriodDraft(periodSession.draft)) {
            e.preventDefault();
            setBookExit(true);
          }
        }}
      >
        {work.notice && (
          <p class="global-notice no-print" role="status">
            {work.notice}
          </p>
        )}
        {content}
        {bookExit && (
          <ConfirmDialog
            title="Before you leave"
            cancel="Stay here"
            confirm="Continue to the book page"
            onCancel={() => setBookExit(false)}
            onConfirm={() => {
              window.location.assign(periodBook.url);
            }}
          >
            <p>Your card is only in this tab. Copy it before leaving if you want to keep it.</p>
          </ConfirmDialog>
        )}
      </main>
      <footer class="site-footer notice-footer">
        <div class="footer-intro">
          <p>Only Empowerment</p>
          <span>Free learning. Practical application.</span>
        </div>
        <nav class="footer-group" aria-label="About this site">
          <h2>About this site</h2>
          <a href="#/period/book" aria-current={path === '/period/book' ? 'page' : undefined}>
            About the book
          </a>
          <a href="#/privacy" aria-current={path === '/privacy' ? 'page' : undefined}>
            Privacy &amp; source
          </a>
        </nav>
        <nav class="footer-group" aria-label="Existing work">
          <h2>Existing work</h2>
          <a
            href="#/tools"
            aria-current={
              path === '/tools' ? 'page' : path.startsWith('/tools/') ? 'location' : undefined
            }
          >
            Legacy tools
          </a>
          <a href="#/saved" aria-current={path === '/saved' ? 'page' : undefined}>
            Saved work
          </a>
          <span>Saved in this browser, on this site.</span>
        </nav>
        <SiteNotices build={__BUILD__} path={path} />
      </footer>
    </div>
  );
}
render(<App />, document.getElementById('app')!);
// Static teaching remains available if JavaScript is disabled or the app cannot load.
// Remove it only after a successful mount, so enhancement is never a reading gate.
document.getElementById('educational-fallback')?.remove();

import { LegacyDataRemoval } from './LegacyDataRemoval';
import { SiteNotices } from './SiteNotices';
import { SourceNotice } from './SourceNotice';
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { useRoute } from './use-route';
import { RebuildGuide, FrameworkHome } from './Rebuild';
import { rebuildTrees } from './rebuild-content';
import type { RebuildSection } from './Rebuild';
import { PeriodIntro, PeriodOwnership, PeriodUnavailable, PeriodBook } from './PeriodLearning';
import { PeriodStandard } from './PeriodStandard';
import { PracticeOwnership } from './PracticeOwnership';
import { PurposeLesson, PurposeEvening } from './Purpose';
import { newPurposeSession } from './period-purpose-content';
import { newPracticeSession, practiceViews } from './period-practice-content';
import { newPeriodSession, enterPeriodExercise, hasPeriodDraft } from './period-standard-model';
import { periodBook, periodCardContext } from './period-content';
import { ConfirmDialog } from './components/work';
import { PageIntro } from './components/shared';
import './style.css';
import './period.css';
import './period-practice.css';
import './period-purpose.css';
import './period-resilience.css';
import './period-integrity.css';
import './period-discipline.css';
import './period-empowerment.css';
import './navigation.css';
import './period-homepage.css';
import './period-lessons.css';
import './lesson-transitions.css';
import './site-footer.css';
import './rebuild-source-scoped.css';
import './rebuild-app.css';
import { EmpowermentLesson, EmpowermentConversation } from './Empowerment';
import { DisciplineLesson, DisciplinePattern } from './Discipline';
import { IntegrityLesson, IntegrityRecord } from './Integrity';
import { ResilienceLesson, ResiliencePressure } from './Resilience';
function Privacy() {
  return (
    <div class="narrow legacy-info">
      <PageIntro title="Your answers are not ours to collect.">
        <p>
          You can read the six lessons and explore their examples without an account or submitting
          personal answers. The optional Standard Card stays in the open tab. The earlier tools and
          Saved work are retired from this application. Records saved with an older version may
          still remain in this browser profile on this site.
        </p>
      </PageIntro>
      <LegacyDataRemoval />
      <div class="privacy-facts">
        <section>
          <h2>What stays in the page</h2>
          <p>
            The optional PERIOD Standard Card keeps its draft only in application session memory in
            this open tab during in-site navigation. It never enters Saved work or browser storage.
            Reloading or closing can discard it; copy or print anything you want to keep.
          </p>
        </section>
        <section>
          <h2>Records from the retired tools</h2>
          <p>
            This application does not open, read, list, change, or automatically delete old saved
            records. Visiting a lesson, navigating the site, or reloading leaves them alone. The
            deletion control above accesses only the old storage keys after you confirm.
          </p>
          <p>
            Old records are not encrypted by this application. Someone using this browser profile,
            an extension, or an older copy of the application may still be able to access them.
            There is no server recovery, cross-device sync, or transfer between sites.
          </p>
          <p>
            Browser data belongs to its original site origin (scheme, host, and port). A future
            private or offline copy on another origin would not automatically recover records saved
            here. Retiring public access does not make previously published GitHub history private.
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
            Any future analytics would be limited to approved, content-free site usage. Retiring the
            tools does not authorize new tracking or collection of old records.
          </p>
          <p>
            Standard Card text and residual legacy records are not sent to Google Analytics. Written
            answers, artifact contents, copied text, and other user-authored private data are
            excluded.
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
            Copying puts the Standard Card on your device’s clipboard. Your operating system may
            sync that clipboard. Printing or saving a PDF passes content to your browser and
            printing system. Clipboard copies, PDFs, printouts, screenshots, and device backups are
            yours to manage and are not removed by deleting legacy tool data.
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
        <SourceNotice build={__BUILD__} />
      </div>
    </div>
  );
}
function NotFound() {
  return (
    <div class="narrow legacy-info">
      <PageIntro title="That page is not here.">
        <p>
          The earlier tools, Saved work, and Approach page have been retired. Retiring these pages
          does not remove existing browser data.{' '}
          <a href="#/period/teaching-order">Explore the values</a>, return to{' '}
          <a href="#/period/why">Why PERIOD?</a>, or read{' '}
          <a href="#/privacy">Privacy &amp; source</a>.
        </p>
      </PageIntro>
    </div>
  );
}
function App() {
  const path = useRoute();
  const editorial = path === '/period' || path.startsWith('/period/');
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
  if (path === '/') content = <FrameworkHome />;
  else if (path === '/period' || path === '/period/why' || path === '/period/teaching-order')
    content = <PeriodIntro />;
  else if (path === '/rebuild') content = <RebuildGuide section="index" />;
  else if (path.startsWith('/rebuild/')) {
    const section = path.slice('/rebuild/'.length);
    content = Object.hasOwn(rebuildTrees, section) ? (
      <RebuildGuide section={section as RebuildSection} key={section} />
    ) : (
      <NotFound />
    );
  } else if (path === '/period/values/ownership' || path === '/period/values')
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
  else if (path === '/privacy') content = <Privacy />;
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
      <header class="site-header">
        <a class="wordmark" href="#/" aria-label="Only Empowerment home">
          only
          <wbr />
          <span>
            {'empower\u00adment'}
            <span class="brand-dot" aria-hidden="true">
              .
            </span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#/" aria-current={path === '/' ? 'page' : undefined}>
            Frameworks
          </a>
          <a href="#/period" aria-current={editorial ? 'location' : undefined}>
            The PERIOD Code
          </a>
          <a href="#/rebuild" aria-current={path.startsWith('/rebuild') ? 'location' : undefined}>
            How to Rebuild Yourself
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
          <a href="#/period">The PERIOD Code</a>
          <a href="#/rebuild">How to Rebuild Yourself</a>
          <a href="#/period/book" aria-current={path === '/period/book' ? 'page' : undefined}>
            About the book
          </a>
          <a href="#/privacy" aria-current={path === '/privacy' ? 'page' : undefined}>
            Privacy &amp; source
          </a>
        </nav>
        <nav class="footer-group" aria-label="Your practice">
          <h2>Your practice</h2>
          <p>{periodCardContext.footer}</p>
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
        <SiteNotices build={__BUILD__} />
      </footer>
    </div>
  );
}
render(<App />, document.getElementById('app')!);
// Static teaching remains available if JavaScript is disabled or the app cannot load.
// Remove it only after a successful mount, so enhancement is never a reading gate.
document.getElementById('educational-fallback')?.remove();

import { h } from 'preact';
import { useRef } from 'preact/hooks';
import { frameworkAuthor, frameworkChoices } from './framework-navigation';
import { FrameworkLinks } from './FrameworkLinks';
import type { ComponentChild } from 'preact';
import { rebuildTrees } from './rebuild-content';
import { loopHomeCopy } from './loop-content';
import { frameworkOrientation, frameworkPositioning } from './framework-home-content';
import { executionHomeCopy } from './execution-content';

export type RebuildSection = keyof typeof rebuildTrees;

type TeachingNode =
  | string
  | {
      readonly tag: string;
      readonly attrs: Readonly<Record<string, string | boolean>>;
      readonly children: readonly TeachingNode[];
    };

// Only validated build-generated elements and attributes reach Preact.
// This deliberately does not parse or inject HTML at runtime.
function renderTeachingNode(
  node: TeachingNode,
  selectedNote: string,
  section: RebuildSection,
  insideInternalLink = false,
): ComponentChild {
  if (typeof node === 'string') return node;
  const attrs = { ...node.attrs };
  // Work 53's linkedset uses native :target. The enhanced selector uses one in-memory choice.
  if (attrs.class === 'linkedset') attrs.class = 'phrase-selector';
  if (
    typeof attrs.href === 'string' &&
    attrs.href.startsWith('#note-') &&
    attrs.href.slice(1) === selectedNote
  )
    attrs['aria-current'] = 'true';
  if (typeof attrs.id === 'string' && attrs.id.startsWith('note-'))
    attrs.hidden = attrs.id !== selectedNote;
  // A copied or modified-clicked link must identify its framework and lesson.
  // The same public URL also identifies a selected Line note on reload/history.
  if (typeof attrs.href === 'string' && /^#[a-z][a-z0-9-]*$/.test(attrs.href))
    attrs.href = '#/rebuild/' + section + '?section=' + attrs.href.slice(1);
  const internalLink =
    insideInternalLink ||
    (node.tag === 'a' && typeof attrs.href === 'string' && /^(#|\/(?!\/))/.test(attrs.href));
  if (internalLink && attrs.class === 'arrow') return null;
  return h(
    node.tag,
    attrs,
    node.children.map((child) => renderTeachingNode(child, selectedNote, section, internalLink)),
  );
}

export const rebuildSections: { id: RebuildSection; title: string }[] = [
  { id: 'line', title: 'Draw the line' },
  { id: 'structure', title: 'Give the standard a place' },
  { id: 'return', title: 'Return after a miss' },
  { id: 'trust', title: 'Know what you can count on' },
  { id: 'negotiation', title: 'Decide what stays settled' },
  { id: 'help', title: 'Keep help in the picture' },
];

export function FrameworkHome() {
  return (
    <div class="framework-hub">
      <div class="framework-home-hero">
        <div class="framework-home-copy">
          <header class="framework-hub-intro">
            <h1 tabIndex={-1}>A place to learn how to live differently.</h1>
            <p>
              Work through a complete philosophy, examine decisions in real situations, and take
              what is useful into your own life. The work belongs to you.
            </p>
          </header>
          <p class="framework-author">
            {frameworkAuthor[0]}
            <br />
            {frameworkAuthor[1]}
          </p>
        </div>
        <nav class="framework-chooser" aria-label="Start here if">
          <h2>Start here if...</h2>
          <ul>
            {frameworkChoices.map((item) => (
              <li key={item.id}>
                <a href={'#/' + item.id}>
                  {item.situation} <span>{item.title}</span>
                  <span class="framework-chooser-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p class="framework-positioning">{frameworkPositioning}</p>
      <section class="framework-orientation" aria-labelledby="framework-orientation-title">
        <h2 id="framework-orientation-title">{frameworkOrientation.heading}</h2>
        <div>
          <p>{frameworkOrientation.relationship}</p>
          <p>{frameworkOrientation.choice}</p>
        </div>
      </section>
      <div class="framework-options">
        <article>
          <p class="framework-kicker">Values and standards</p>
          <h2>The PERIOD Code</h2>
          <p>
            Six connected values taught through substantial lessons and practical examples:
            Ownership, Purpose, Resilience, Integrity, Discipline and Empowerment.
          </p>
          <a href="#/period">Explore The PERIOD Code</a>
        </article>
        <article>
          <p class="framework-kicker">Rebuilding through action</p>
          <h2>How to Rebuild Yourself</h2>
          <p>
            Understand how standards become structure, repeated proof, self-trust and a life worth
            showing up for. Six different situations let you test the ideas.
          </p>
          <a href="#/rebuild">Explore How to Rebuild Yourself</a>
        </article>
        <article>
          <p class="framework-kicker">Reinforcement through proof</p>
          <h2>The Discipline Loop</h2>
          <p>{loopHomeCopy}</p>
          <a href="#/loop">Explore The Discipline Loop</a>
        </article>
        <article>
          <p class="framework-kicker">From decision to action</p>
          <h2>Pure Execution Mode</h2>
          <p>{executionHomeCopy}</p>
          <a href="#/execution">Explore Pure Execution Mode</a>
        </article>
      </div>
      <p class="framework-stage">No account or submission of private answers is required.</p>
    </div>
  );
}

export function RebuildGuide({ section }: { section: RebuildSection }) {
  const status = useRef<HTMLParagraphElement>(null);
  const directNote =
    section === 'line'
      ? /^#\/rebuild\/line\?section=(note-[1-4])$/.exec(location.hash)?.[1]
      : undefined;
  const selectedNote = directNote || 'note-1';

  return (
    <section
      class="rebuild-guide"
      onChange={(event) => {
        const input = event.target;
        if (
          input instanceof HTMLInputElement &&
          (input.type === 'radio' || input.type === 'checkbox') &&
          status.current
        ) {
          const label = input.labels?.[0]?.textContent?.trim();
          // Announce the native CSS view without rerendering its uncontrolled inputs.
          if (label)
            status.current.textContent = `${input.checked ? 'Showing' : 'Hidden'}: ${label}.`;
        }
      }}
    >
      <p
        class="sr-only no-print"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        ref={status}
      />
      <div class="wrap">
        {rebuildTrees[section].map((node) => renderTeachingNode(node, selectedNote, section))}
        {(section === 'end' || section === 'complete') && (
          <p>
            <a
              href="https://www.amazon.com/dp/B0HQVNBCWP"
              target="_blank"
              rel="noopener noreferrer"
            >
              Paperback &amp; Kindle on Amazon (new tab)
            </a>
          </p>
        )}
      </div>
      {section === 'end' && <FrameworkLinks current="rebuild" />}
      <nav class="rebuild-footlinks" aria-label="Rebuilding framework navigation">
        <a href="#/rebuild">Explore the full rebuilding path</a>
        <a href="#/rebuild/complete">Read or print all teaching</a>
        <a href="/read/rebuild.html" target="_blank" rel="noopener noreferrer">
          Open the complete reading edition (new tab)
        </a>
        {section === 'index' && (
          <a
            href="https://jimlunsford.com/how-to-rebuild-yourself/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Jim Lunsford's book page (new tab)
          </a>
        )}
        {section === 'index' && (
          <a href="https://www.amazon.com/dp/B0HQVNBCWP" target="_blank" rel="noopener noreferrer">
            Paperback &amp; Kindle on Amazon (new tab)
          </a>
        )}
      </nav>
    </section>
  );
}

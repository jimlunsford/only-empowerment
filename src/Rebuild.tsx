import { h } from 'preact';
import type { ComponentChild } from 'preact';
import { rebuildTrees } from './rebuild-content';
import { loopHomeCopy } from './loop-content';
import { frameworkOrientation } from './framework-home-content';

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
  return h(
    node.tag,
    attrs,
    node.children.map((child) => renderTeachingNode(child, selectedNote, section)),
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
      <header class="framework-hub-intro">
        <p class="framework-kicker">Only Empowerment • Founding learning experiences</p>
        <h1 tabIndex={-1}>A place to learn how to live differently.</h1>
        <p>
          Work through a complete philosophy, examine decisions in real situations, and take what is
          useful into your own life. The work belongs to you.
        </p>
      </header>
      <section class="framework-orientation" aria-labelledby="framework-orientation-title">
        <h2 id="framework-orientation-title">{frameworkOrientation.heading}</h2>
        <p>{frameworkOrientation.relationship}</p>
        <p>{frameworkOrientation.choice}</p>
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
      </div>
      <p class="framework-stage">
        Development review: these experiences are being evaluated here before any public release. No
        account or submission of private answers is required.
      </p>
    </div>
  );
}

export function RebuildGuide({ section }: { section: RebuildSection }) {
  const directNote =
    section === 'line'
      ? /^#\/rebuild\/line\?section=(note-[1-4])$/.exec(location.hash)?.[1]
      : undefined;
  const selectedNote = directNote || 'note-1';

  return (
    <section class="rebuild-guide">
      <div class="rebuild-approval">
        <span>Development concept, not a published book edition</span>
        <a href="#/rebuild">How to Rebuild Yourself</a>
      </div>
      <div class="wrap">
        {rebuildTrees[section].map((node) => renderTeachingNode(node, selectedNote, section))}
      </div>
      <nav class="rebuild-footlinks" aria-label="Rebuilding framework navigation">
        <a href="#/rebuild">Explore the full rebuilding path</a>
        <a href="#/rebuild/complete">Read or print all teaching</a>
      </nav>
    </section>
  );
}

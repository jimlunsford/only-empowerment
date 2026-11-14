import { h } from 'preact';
import type { ComponentChild } from 'preact';
import { useState } from 'preact/hooks';
import { rebuildTrees } from './rebuild-content';

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
function renderTeachingNode(node: TeachingNode): ComponentChild {
  if (typeof node === 'string') return node;
  return h(node.tag, { ...node.attrs }, node.children.map(renderTeachingNode));
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
      </div>
      <p class="framework-stage">
        Development review: these experiences are being evaluated here before any public release. No
        account or submission of private answers is required.
      </p>
    </div>
  );
}

export function RebuildGuide({ section }: { section: RebuildSection }) {
  const [note, setNote] = useState('note-1');

  function onGuideClick(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (href.startsWith('#note-')) {
      event.preventDefault();
      const selected = href.slice(1);
      setNote(selected);
      // Keep the selected note in focus without changing the application route.
      requestAnimationFrame(() => {
        document.getElementById(selected)?.focus({ preventScroll: true });
        document.getElementById(selected)?.scrollIntoView({ block: 'nearest' });
      });
    } else if (href.startsWith('#') && !href.startsWith('#/')) {
      event.preventDefault();
      const target = document.getElementById(href.slice(1));
      target?.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (target instanceof HTMLElement) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  }

  return (
    <section class="rebuild-guide" data-note={note} onClick={onGuideClick}>
      <div class="rebuild-approval">
        <span>Development concept, not a published book edition</span>
        <a href="#/rebuild">How to Rebuild Yourself</a>
      </div>
      <div class="wrap">{rebuildTrees[section].map(renderTeachingNode)}</div>
      <nav class="rebuild-footlinks" aria-label="Rebuilding framework navigation">
        <a href="#/rebuild">Explore the full rebuilding path</a>
        <a href="#/rebuild/complete">Read or print all teaching</a>
      </nav>
    </section>
  );
}

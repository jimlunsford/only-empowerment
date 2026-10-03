import type { ComponentChildren } from 'preact';
import { frameworks, type FrameworkKey } from '../model';
export function SourceNote({ items }: { items: FrameworkKey[] }) {
  return (
    <p class="source-note">
      Based on{' '}
      {items.map((key, i) => (
        <span key={key}>
          {i > 0 && ' and '}
          <a href={frameworks[key].url} rel="noreferrer">
            {frameworks[key].name}
          </a>
        </span>
      ))}
      .
    </p>
  );
}
export function Lesson({ title, children }: { title: string; children: ComponentChildren }) {
  return (
    <aside class="lesson" aria-label="A useful distinction">
      <h2>{title}</h2>
      <div>{children}</div>
    </aside>
  );
}
export function PageIntro({ title, children }: { title: string; children: ComponentChildren }) {
  return (
    <div class="page-intro">
      <h1 tabIndex={-1}>{title}</h1>
      <div class="intro-copy">{children}</div>
    </div>
  );
}

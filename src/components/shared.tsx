import type { ComponentChildren } from 'preact';
export function PageIntro({ title, children }: { title: string; children: ComponentChildren }) {
  return (
    <div class="page-intro">
      <h1 tabIndex={-1}>{title}</h1>
      <div class="intro-copy">{children}</div>
    </div>
  );
}

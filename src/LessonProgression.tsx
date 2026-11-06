const nextLessons: Record<string, { href: string; label: string }> = {
  ownership: { href: '#/period/values/purpose', label: 'Continue to Purpose' },
  purpose: { href: '#/period/values/resilience', label: 'Continue to Resilience' },
  resilience: { href: '#/period/values/integrity', label: 'Continue to Integrity' },
  integrity: { href: '#/period/values/discipline', label: 'Continue to Discipline' },
  discipline: { href: '#/period/values/empowerment', label: 'Continue to Empowerment' },
  empowerment: { href: '#/period/teaching-order', label: 'Review all six values' },
};

export function LessonProgression({ path }: { path: string }) {
  const value = path === '/period/values' ? 'ownership' : path.replace('/period/values/', '');
  const next = Object.hasOwn(nextLessons, value) ? nextLessons[value] : undefined;
  if (!next) return null;
  return (
    <nav class="lesson-progression no-print" aria-label="Lesson progression">
      <a href={next.href}>
        {next.label}
        <span aria-hidden="true"> →</span>
      </a>
    </nav>
  );
}

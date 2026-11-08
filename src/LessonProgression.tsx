import { lessonTransition, type LessonValue } from './period-lesson-transitions';

export function LessonProgression({ value }: { value: LessonValue }) {
  const { forward, previous, ownership } = lessonTransition(value);
  return (
    <nav class="lesson-progression no-print" aria-label="Lesson progression">
      <a class="transition-next" href={forward.href}>
        {forward.label}
      </a>
      {previous && (
        <div class="transition-previous">
          <a href={previous.href}>{previous.label}</a>
          {ownership && <a href={ownership.href}>{ownership.label}</a>}
        </div>
      )}
    </nav>
  );
}

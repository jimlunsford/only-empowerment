import { LessonProgression } from './LessonProgression';
import { lessonBridges, lessonTransition, type LessonValue } from './period-lesson-transitions';

export function LessonTransition({ value }: { value: LessonValue }) {
  const { current, next } = lessonTransition(value);
  const bridge = lessonBridges[value];
  return (
    <section
      class="transition lesson-transition"
      id={value === 'resilience' || value === 'integrity' ? value + '-L10' : undefined}
      data-value={value}
      aria-labelledby={'transition-' + value}
    >
      <div class="transition-path">
        <span>
          {current.label}
          <br />
          <b>{current.role}</b>
        </span>
        <span aria-hidden="true">→</span>
        <span>
          {next.label}
          <br />
          <b>{next.role}</b>
        </span>
      </div>
      <h2 id={'transition-' + value}>{bridge.heading}</h2>
      {bridge.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      {bridge.note && (
        <p class="small">
          <strong>{bridge.note}</strong>
        </p>
      )}
      <LessonProgression value={value} />
    </section>
  );
}

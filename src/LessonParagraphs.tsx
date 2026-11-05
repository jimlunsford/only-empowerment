// Presentation only: split approved sentences without changing their text or order.
export function LessonParagraphs({
  texts,
  treatment,
}: {
  texts: readonly string[];
  treatment?: string;
}) {
  return (
    <>
      {texts.map((text, index) => {
        if (
          index === 0 &&
          (treatment === 'purpose-contrast' || treatment === 'resilience-standard')
        ) {
          const first = text.indexOf('.') + 1;
          const second =
            treatment === 'resilience-standard' ? text.indexOf('.', first) + 1 : text.length;
          return (
            <p
              key={text}
              class={`lesson-distinction ${treatment === 'resilience-standard' ? 'standard-method' : 'activity-direction'}`}
            >
              <span>{text.slice(0, first)}</span>
              <span>{text.slice(first, second)}</span>
              {second < text.length && (
                <span class="distinction-remainder">{text.slice(second)}</span>
              )}
            </p>
          );
        }
        const emphasis =
          treatment === 'integrity-evidence' && index === texts.length - 1
            ? 'evidence-question'
            : treatment === 'integrity-correction' && index === 2
              ? 'correction-action'
              : treatment === 'discipline-repetition' && index === 0
                ? 'repetition-statement'
                : treatment === 'discipline-correction' && index === texts.length - 1
                  ? 'correction-return'
                  : treatment === 'empowerment-agreement'
                    ? ['offer-stage', 'reply-stage', 'reply-stage', 'agreement-stage', ''][index]
                    : treatment === 'empowerment-help' && index === 4
                      ? 'necessary-care'
                      : undefined;
        return (
          <p key={text} class={emphasis}>
            {text}
          </p>
        );
      })}
    </>
  );
}

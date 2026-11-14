// Optional word-part breaks for enlarged text. No letters or punctuation are changed.
// Normal 1440/390/320 layouts keep each complete value name on one line.
export function LessonTitle({ text }: { text: string }) {
  const boundaries: Record<string, number[]> = {
    Ownership: [5],
    Purpose: [3],
    Resilience: [5],
    Integrity: [5],
    Discipline: [5],
    Empowerment: [2, 7],
  };
  const points = [...(boundaries[text.replace(/\.$/, '')] ?? []), text.length];
  let start = 0;
  return (
    <>
      {points.map((end, index) => {
        const part = text.slice(start, end);
        start = end;
        return (
          <span key={end}>
            {index > 0 && <wbr />}
            {part}
          </span>
        );
      })}
    </>
  );
}

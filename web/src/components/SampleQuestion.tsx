import { LETTERS } from "@/lib/format";
import { lessons } from "@/lib/quizzes";

/** Static preview of the quiz panel for the landing page. */
export function SampleQuestion() {
  const q = lessons[0].questions[2];
  return (
    <div aria-hidden className="rounded-lg border border-border bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between font-mono text-xs text-text-faint">
        <span>Q3 / 5</span>
        <span>{lessons[0].title}</span>
      </div>
      <div className="mt-3 h-1 rounded-full bg-border">
        <div className="h-1 w-3/5 rounded-full bg-text" />
      </div>
      <p className="mt-5 text-lg leading-7 font-medium text-text">{q.q}</p>
      <ul className="mt-4 space-y-2">
        {q.options.map((o, i) => {
          const correct = i === q.answer;
          return (
            <li
              key={o}
              className={`flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${
                correct ? "border-correct text-text" : "border-border text-text-faint"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-sm border font-mono text-xs ${
                  correct ? "border-correct bg-correct text-canvas" : "border-border"
                }`}
              >
                {LETTERS[i]}
              </span>
              {o}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 border-t border-dashed border-border pt-4 text-sm text-text-muted">{q.explain}</p>
    </div>
  );
}

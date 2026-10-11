"use client";

import Link from "next/link";
import { usePassed, useQuizzes } from "@/hooks/useQuizData";
import { formatBot } from "@/lib/format";
import { lessons } from "@/lib/quizzes";

export function LessonGrid() {
  const { data: quizzes } = useQuizzes();
  const { data: passed } = usePassed();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((l, id) => {
        const reward = quizzes?.[id]?.reward;
        const done = passed?.[id];
        return (
          <Link
            key={l.slug}
            href={`/quiz/${l.slug}`}
            className="group flex flex-col rounded-md border border-border bg-surface p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="label-sm rounded-sm border border-border px-2 py-1 text-text-muted">{l.topic}</span>
              {reward !== undefined && <span className="font-mono text-sm text-reward">+{formatBot(reward)} BOT</span>}
            </div>
            <h3 className="mt-4 text-xl leading-7 font-semibold tracking-[-0.01em] text-text">{l.title}</h3>
            <p className="mt-2 line-clamp-2 text-text-muted">{l.summary}</p>
            <div className="mt-auto flex items-center justify-between pt-6 font-mono text-xs text-text-faint">
              <span>
                {String(id + 1).padStart(2, "0")} · {l.questions.length} questions · {l.minutes} min
              </span>
              {done ? (
                <span className="text-correct">✓ Passed</span>
              ) : (
                <span className="text-text-muted transition-colors group-hover:text-text">Start →</span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

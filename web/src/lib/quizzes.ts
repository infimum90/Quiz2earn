import data from "@/content/quizzes.json";

export type Question = { q: string; options: string[]; answer: number; explain: string };
export type Lesson = {
  slug: string;
  title: string;
  topic: string;
  minutes: number;
  summary: string;
  lesson: string[];
  questions: Question[];
};

/** Array index is the on-chain quiz id. Append new lessons; never reorder. */
export const lessons = data as Lesson[];

export function getLesson(slug: string) {
  const id = lessons.findIndex((l) => l.slug === slug);
  return id === -1 ? null : { id, lesson: lessons[id] };
}

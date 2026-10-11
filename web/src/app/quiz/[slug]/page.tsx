import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { QuizRunner } from "@/components/QuizRunner";
import { getLesson, lessons } from "@/lib/quizzes";

export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(props: PageProps<"/quiz/[slug]">): Promise<Metadata> {
  const found = getLesson((await props.params).slug);
  return found ? { title: `${found.lesson.title} · Quiz2Earn`, description: found.lesson.summary } : {};
}

export default function QuizPage(props: PageProps<"/quiz/[slug]">) {
  return (
    <Suspense>
      <LessonForSlug params={props.params} />
    </Suspense>
  );
}

async function LessonForSlug({ params }: { params: Promise<{ slug: string }> }) {
  const found = getLesson((await params).slug);
  if (!found) notFound();
  return <QuizRunner id={found.id} lesson={found.lesson} />;
}

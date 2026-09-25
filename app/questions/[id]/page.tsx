import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import QuestionDetail from "@/components/questions/QuestionDetail";
import { getQuestion } from "@/lib/queries/questions";
import { getAnswers } from "@/lib/queries/answers";
import { getCurrentUser } from "@/lib/queries/profiles";
import { notFound } from "next/navigation";
import { parseFilters, type RawSearchParams } from "@/lib/validation/filters";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();
  return { title: question.title, description: question.content.slice(0, 150) };
}

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<RawSearchParams>;
}) {
  const { id } = await params;
  const [question, user] = await Promise.all([getQuestion(id), getCurrentUser()]);
  if (!question) notFound();
  const { page } = parseFilters(await searchParams);
  const answers = await getAnswers(id, page);
  return (
    <main className="detail-page">
      <div className="container detail-container">
        <Link href="/questions" className="back-link">
          <ChevronLeft size={17} />
          질문 목록
        </Link>
        <QuestionDetail question={question} answers={answers} currentUserId={user?.id} />
      </div>
    </main>
  );
}

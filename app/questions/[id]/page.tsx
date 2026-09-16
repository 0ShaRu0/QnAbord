import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import QuestionDetail from "@/components/QuestionDetail";
import { getQuestion, incrementViews } from "@/lib/queries/questions";
import { getCurrentUser } from "@/lib/queries/profiles";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const question = await getQuestion(id);
  return { title: question.title, description: question.content.slice(0, 150) };
}

export default async function QuestionPage({ params }: { params: Params }) {
  const { id } = await params;
  await incrementViews(id);
  const [question, user] = await Promise.all([getQuestion(id), getCurrentUser()]);
  return <main className="detail-page"><div className="container detail-container"><Link href="/questions" className="back-link"><ChevronLeft size={17} />질문 목록</Link><QuestionDetail question={question} currentUserId={user?.id} /></div></main>;
}

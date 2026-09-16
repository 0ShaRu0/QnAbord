import type { Metadata } from "next";
import { redirect } from "next/navigation";
import QuestionForm from "@/components/QuestionForm";
import { createQuestion } from "@/app/actions/questions";
import { getCurrentUser } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "질문하기" };

export default async function WriteQuestionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/questions/write");
  return <main className="form-page"><div className="container narrow-container"><QuestionForm action={createQuestion} /></div></main>;
}

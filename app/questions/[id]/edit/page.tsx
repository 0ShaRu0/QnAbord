import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import QuestionForm from "@/components/questions/QuestionForm";
import { updateQuestion } from "@/app/actions/questions";
import { getEditableQuestion } from "@/lib/queries/questions";
import { getCurrentUser } from "@/lib/queries/profiles";

export const metadata: Metadata = { title: "질문 수정" };
type Params = Promise<{ id: string }>;

export default async function EditQuestionPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(`/questions/${id}/edit`)}`);
  const question = await getEditableQuestion(id, user.id);
  if (!question) notFound();
  return (
    <main className="form-page">
      <div className="container narrow-container">
        <QuestionForm action={updateQuestion.bind(null, id)} question={question} />
      </div>
    </main>
  );
}

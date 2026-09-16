import Link from "next/link";
import { CalendarDays, Eye, MessageSquareText, Pencil, UserRound } from "lucide-react";
import type { QuestionDetailData } from "@/types/database.types";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmSubmitButton from "./ConfirmSubmitButton";
import AnswerList from "./AnswerList";
import AnswerForm from "./AnswerForm";
import { createAnswer, deleteAnswer, updateAnswer } from "@/app/actions/answers";
import { deleteQuestion } from "@/app/actions/questions";

export default function QuestionDetail({ question, currentUserId }: { question: QuestionDetailData; currentUserId?: string }) {
  const mine = question.user_id === currentUserId;
  const createAction = createAnswer.bind(null, question.id);
  const updateAction = async (answerId: string, formData: FormData) => {
    "use server";
    await updateAnswer(answerId, question.id, formData);
  };
  const deleteAction = async (answerId: string) => {
    "use server";
    await deleteAnswer(answerId, question.id);
  };
  return (
    <div className="detail-layout">
      <article className="detail-card">
        <div className="detail-topline"><span className={`category-badge category-${question.category}`}>{question.category}</span><span className={question.status === "answered" ? "status-answered" : "status-waiting"}>{question.status === "answered" ? "답변완료" : "답변대기"}</span></div>
        <h1>{question.title}</h1>
        <div className="detail-meta"><span><UserRound size={15} />{question.username}</span><span><CalendarDays size={15} />{formatRelativeTime(question.created_at)}</span><span><Eye size={15} />조회 {question.views}</span><span><MessageSquareText size={15} />답변 {question.answer_count}</span></div>
        {question.tags.length > 0 && <div className="tags detail-tags">{question.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
        <div className="detail-content">{question.content}</div>
        {mine && <div className="owner-actions detail-actions"><Link className="text-button" href={`/questions/${question.id}/edit`}><Pencil size={15} />수정</Link><ConfirmSubmitButton action={deleteQuestion.bind(null, question.id)} title="질문을 삭제할까요?" description="질문과 등록된 모든 답변이 함께 삭제되며 복구할 수 없습니다." /></div>}
      </article>
      <AnswerList answers={question.answers} currentUserId={currentUserId} updateAction={updateAction} deleteAction={deleteAction} />
      <AnswerForm action={createAction} authenticated={Boolean(currentUserId)} />
    </div>
  );
}

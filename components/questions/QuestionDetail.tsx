import Link from "next/link";
import { CalendarDays, Eye, MessageSquareText, Pencil, UserRound } from "lucide-react";
import type { AnswerWithAuthor, PageResult, QuestionListItem } from "@/types/models";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";
import AnswerList from "@/components/answers/AnswerList";
import AnswerForm from "@/components/answers/AnswerForm";
import Pagination from "@/components/ui/Pagination";
import ViewTracker from "./ViewTracker";
import { createAnswer } from "@/app/actions/answers";
import { deleteQuestion } from "@/app/actions/questions";

export default function QuestionDetail({
  question,
  answers,
  currentUserId,
}: {
  question: QuestionListItem;
  answers: PageResult<AnswerWithAuthor>;
  currentUserId?: string;
}) {
  return (
    <div className="detail-layout">
      <ViewTracker questionId={question.id} />
      <article className="detail-card">
        <div className="detail-topline">
          <span className={`category-badge category-${question.category}`}>
            {question.category}
          </span>
          <span className={question.status === "answered" ? "status-answered" : "status-waiting"}>
            {question.status === "answered" ? "답변완료" : "답변대기"}
          </span>
        </div>
        <h1>{question.title}</h1>
        <div className="detail-meta">
          <span>
            <UserRound size={15} />
            {question.username}
          </span>
          <span>
            <CalendarDays size={15} />
            <time dateTime={question.created_at}>{formatRelativeTime(question.created_at)}</time>
          </span>
          <span>
            <Eye size={15} />
            조회 {question.views}
          </span>
          <span>
            <MessageSquareText size={15} />
            답변 {question.answer_count}
          </span>
        </div>
        {question.tags.length > 0 && (
          <div className="tags detail-tags">
            {question.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}
        <div className="detail-content">{question.content}</div>
        {question.user_id === currentUserId && (
          <div className="owner-actions detail-actions">
            <Link className="text-button" href={`/questions/${question.id}/edit`}>
              <Pencil size={15} />
              수정
            </Link>
            <ConfirmSubmitButton
              action={deleteQuestion.bind(null, question.id)}
              title="질문을 삭제할까요?"
              description="질문과 등록된 모든 답변이 함께 삭제되며 복구할 수 없습니다."
            />
          </div>
        )}
      </article>
      <div id="answers">
        <AnswerList
          answers={answers.items}
          total={question.answer_count}
          page={answers.page}
          currentUserId={currentUserId}
        />
        <Pagination
          page={answers.page}
          hasMore={answers.hasMore}
          previousHref={`/questions/${question.id}?page=${answers.page - 1}#answers`}
          nextHref={`/questions/${question.id}?page=${answers.page + 1}#answers`}
          label="답변 페이지"
        />
      </div>
      <AnswerForm
        action={createAnswer.bind(null, question.id)}
        authenticated={Boolean(currentUserId)}
        questionId={question.id}
      />
    </div>
  );
}

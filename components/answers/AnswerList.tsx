import { CheckCircle2, MessageSquareText, UserRound } from "lucide-react";
import type { AnswerWithAuthor } from "@/types/models";
import { formatRelativeTime } from "@/lib/utils";
import { PAGE_SIZE } from "@/lib/validation/filters";
import AnswerEditor from "./AnswerEditor";

export default function AnswerList({
  answers,
  currentUserId,
  total,
  page,
}: {
  answers: AnswerWithAuthor[];
  currentUserId?: string;
  total: number;
  page: number;
}) {
  if (!answers.length)
    return (
      <div className="no-answers">
        <MessageSquareText size={34} />
        <strong>{total ? "이 페이지에는 답변이 없습니다." : "아직 답변이 없습니다."}</strong>
        <p>{total ? "이전 페이지를 확인해주세요." : "첫 번째 답변을 작성해보세요!"}</p>
      </div>
    );
  return (
    <section className="answers-section">
      <h2>
        <CheckCircle2 size={20} />
        답변 {total}개
      </h2>
      <div className="answer-list">
        {answers.map((answer, index) => (
          <article className="answer-card" key={answer.id}>
            <div className="answer-number">
              A{String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
            </div>
            <div className="answer-author">
              <span className="avatar">
                <UserRound size={17} />
              </span>
              <div>
                <strong>{answer.profiles?.username ?? "알 수 없는 사용자"}</strong>
                <time dateTime={answer.created_at}>{formatRelativeTime(answer.created_at)}</time>
              </div>
            </div>
            {answer.user_id === currentUserId ? (
              <AnswerEditor answerId={answer.id} content={answer.content} />
            ) : (
              <p className="answer-content">{answer.content}</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

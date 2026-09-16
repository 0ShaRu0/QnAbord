import Link from "next/link";
import { Eye, MessageSquareText } from "lucide-react";
import type { QuestionListItem as QuestionListItemType } from "@/types/database.types";
import { formatRelativeTime } from "@/lib/utils";

export default function QuestionItem({ question }: { question: QuestionListItemType }) {
  return (
    <article className="question-item">
      <div className="question-main">
        <div className="question-title-line">
          <Link href={`/questions/${question.id}`}>{question.title}</Link>
          <span className={`category-badge category-${question.category}`}>{question.category}</span>
          {question.status === "answered" && <span className="answered-badge">답변완료</span>}
        </div>
        <p>{question.content}</p>
        {question.tags.length > 0 && <div className="tags">{question.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
        <div className="question-meta"><span>{question.username}</span><i /> <span>{formatRelativeTime(question.created_at)}</span></div>
      </div>
      <div className="question-stats"><span><Eye size={15} />{question.views}</span><span><MessageSquareText size={15} />{question.answer_count}</span></div>
    </article>
  );
}

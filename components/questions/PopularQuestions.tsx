import Link from "next/link";
import { Flame, Lightbulb } from "lucide-react";
import type { PopularQuestion } from "@/types/models";

export default function PopularQuestions({ questions }: { questions: PopularQuestion[] }) {
  return (
    <aside className="popular-column">
      <div className="tip-card">
        <span>
          <Lightbulb size={23} />
        </span>
        <div>
          <strong>다른 사람들의 질문을 확인해보세요!</strong>
          <p>이미 많은 사람들이 같은 고민을 하고 있어요.</p>
        </div>
      </div>
      <div className="popular-card">
        <h2>
          <Flame size={18} />
          인기 질문 TOP 5
        </h2>
        {questions.length ? (
          <ol>
            {questions.map((question, index) => (
              <li key={question.id}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <div>
                  <Link href={`/questions/${question.id}`}>{question.title}</Link>
                  <span>
                    {question.views} 조회 · {question.answer_count} 답변
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="popular-empty">아직 인기 질문이 없습니다.</p>
        )}
        <div className="speech-note">
          질문은
          <br />
          언제든 환영해요!
        </div>
      </div>
    </aside>
  );
}

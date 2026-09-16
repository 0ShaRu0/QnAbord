import { SearchX } from "lucide-react";
import type { QuestionListItem as QuestionListItemType } from "@/types/database.types";
import QuestionItem from "./QuestionItem";

export default function QuestionList({ questions }: { questions: QuestionListItemType[] }) {
  if (!questions.length) {
    return <div className="empty-state"><SearchX size={36} /><strong>검색 결과를 찾을 수 없습니다.</strong><p>다른 검색어나 카테고리를 선택해보세요.</p></div>;
  }
  return <div className="question-list">{questions.map((question) => <QuestionItem key={question.id} question={question} />)}</div>;
}

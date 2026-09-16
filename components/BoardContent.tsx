import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { getPopularQuestions, getQuestions, type QuestionFilters } from "@/lib/queries/questions";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import QuestionSidebar from "./QuestionSidebar";
import QuestionList from "./QuestionList";
import PopularQuestions from "./PopularQuestions";
import SortSelect from "./SortSelect";
import Loading from "./Loading";

export default async function BoardContent({ filters = {} }: { filters?: QuestionFilters }) {
  const [questions, popular] = await Promise.all([getQuestions(filters), getPopularQuestions()]);
  return (
    <section className="board-section">
      <div className="container">
        {!hasSupabaseEnv() && <div className="setup-notice"><div><strong>Supabase 연결 준비가 필요합니다</strong><span><code>.env.example</code>을 참고해 환경변수를 설정하고 마이그레이션을 적용하세요.</span></div><ChevronRight size={19} /></div>}
        <div className="board-grid">
          <QuestionSidebar category={filters.category} status={filters.status} />
          <main className="questions-column">
            <div className="list-toolbar"><Suspense fallback={null}><SortSelect value={filters.sort} /></Suspense><p>전체 <strong>{questions.length}</strong>개의 질문</p></div>
            <QuestionList questions={questions} />
          </main>
          <PopularQuestions questions={popular} />
        </div>
      </div>
    </section>
  );
}

export function BoardFallback() {
  return <div className="container"><Loading /></div>;
}

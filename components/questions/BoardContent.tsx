import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { getPopularQuestions, getQuestions } from "@/lib/queries/questions";
import { DEFAULT_FILTERS, questionListUrl, type QuestionFilters } from "@/lib/validation/filters";
import QuestionSidebar from "./QuestionSidebar";
import QuestionList from "./QuestionList";
import PopularQuestions from "./PopularQuestions";
import SortSelect from "./SortSelect";
import Loading from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";
import type { PopularQuestion } from "@/types/models";

async function PopularSection() {
  let questions: PopularQuestion[];
  try {
    questions = await getPopularQuestions();
  } catch (error) {
    unstable_rethrow(error);
    return (
      <aside className="popular-column popular-card">
        <p role="status">인기 질문을 불러오지 못했습니다.</p>
      </aside>
    );
  }
  return <PopularQuestions questions={questions} />;
}

async function QuestionResults({ filters }: { filters: QuestionFilters }) {
  const result = await getQuestions(filters);
  return (
    <>
      <div className="list-toolbar">
        <SortSelect filters={filters} />
        <p>
          현재 페이지 <strong>{result.items.length}</strong>개의 질문
        </p>
      </div>
      <QuestionList questions={result.items} />
      <Pagination
        page={result.page}
        hasMore={result.hasMore}
        previousHref={questionListUrl(filters, { page: result.page - 1 })}
        nextHref={questionListUrl(filters, { page: result.page + 1 })}
      />
    </>
  );
}

export default function BoardContent({ filters = DEFAULT_FILTERS }: { filters?: QuestionFilters }) {
  return (
    <section className="board-section">
      <div className="container">
        <div className="board-grid">
          <QuestionSidebar filters={filters} />
          <main className="questions-column">
            <Suspense key={questionListUrl(filters, { page: filters.page })} fallback={<Loading />}>
              <QuestionResults filters={filters} />
            </Suspense>
          </main>
          <Suspense
            fallback={
              <aside className="popular-column">
                <Loading message="인기 질문을 불러오는 중..." />
              </aside>
            }
          >
            <PopularSection />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

export function BoardFallback() {
  return (
    <div className="container">
      <Loading />
    </div>
  );
}

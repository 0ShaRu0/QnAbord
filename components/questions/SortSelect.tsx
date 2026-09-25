import type { QuestionFilters } from "@/lib/validation/filters";

export default function SortSelect({ filters }: { filters: QuestionFilters }) {
  return (
    <form action="/questions" method="get">
      {filters.query && <input type="hidden" name="query" value={filters.query} />}
      {filters.category && <input type="hidden" name="category" value={filters.category} />}
      {filters.status && <input type="hidden" name="status" value={filters.status} />}
      <select
        className="sort-select"
        aria-label="질문 정렬"
        name="sort"
        defaultValue={filters.sort}
        key={filters.sort}
      >
        <option value="latest">최신순</option>
        <option value="views">조회수순</option>
        <option value="answers">답변 많은 순</option>
      </select>
      <button className="sort-apply" type="submit">
        적용
      </button>
    </form>
  );
}

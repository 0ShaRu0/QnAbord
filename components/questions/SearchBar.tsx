import { Search } from "lucide-react";
import { DEFAULT_FILTERS, type QuestionFilters } from "@/lib/validation/filters";

export default function SearchBar({ filters = DEFAULT_FILTERS }: { filters?: QuestionFilters }) {
  return (
    <form className="search-bar" action="/questions" method="get">
      {filters.category && <input type="hidden" name="category" value={filters.category} />}
      {filters.status && <input type="hidden" name="status" value={filters.status} />}
      {filters.sort !== "latest" && <input type="hidden" name="sort" value={filters.sort} />}
      <Search size={21} aria-hidden="true" />
      <input
        name="query"
        defaultValue={filters.query}
        key={filters.query}
        maxLength={200}
        aria-label="질문 검색"
        placeholder="궁금한 내용을 검색해보세요. (예: Next.js, 과제, 오류 해결 등)"
      />
      <button type="submit">검색</button>
    </form>
  );
}

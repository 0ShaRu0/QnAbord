import { Search } from "lucide-react";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form className="search-bar" action="/questions">
      <Search size={21} aria-hidden="true" />
      <input name="query" defaultValue={defaultValue} aria-label="질문 검색" placeholder="궁금한 내용을 검색해보세요. (예: Next.js, 과제, 오류 해결 등)" />
      <button type="submit">검색</button>
    </form>
  );
}

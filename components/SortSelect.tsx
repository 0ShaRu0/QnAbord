"use client";

import { useSearchParams } from "next/navigation";

export default function SortSelect({ value = "latest" }: { value?: string }) {
  const searchParams = useSearchParams();
  return (
    <form action="/questions" method="get">
      {[...searchParams.entries()].filter(([key]) => key !== "sort").map(([key, entryValue]) => <input key={`${key}-${entryValue}`} type="hidden" name={key} value={entryValue} />)}
      <select className="sort-select" aria-label="질문 정렬" name="sort" defaultValue={value}>
        <option value="latest">최신순</option>
        <option value="views">조회수순</option>
        <option value="answers">답변 많은 순</option>
      </select>
      <button className="sort-apply" type="submit">적용</button>
    </form>
  );
}

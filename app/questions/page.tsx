import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/questions/Hero";
import BoardContent, { BoardFallback } from "@/components/questions/BoardContent";
import { parseFilters, type RawSearchParams } from "@/lib/validation/filters";

export const metadata: Metadata = { title: "질문게시판" };

type SearchParams = Promise<RawSearchParams>;

export default async function QuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);
  return (
    <>
      <Hero filters={filters} />
      <Suspense fallback={<BoardFallback />}>
        <BoardContent filters={filters} />
      </Suspense>
    </>
  );
}

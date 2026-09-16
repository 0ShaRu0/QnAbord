import type { Metadata } from "next";
import { Suspense } from "react";
import Hero from "@/components/Hero";
import BoardContent, { BoardFallback } from "@/components/BoardContent";

export const metadata: Metadata = { title: "질문게시판" };

type SearchParams = Promise<{ query?: string; category?: string; sort?: string; status?: string }>;

export default async function QuestionsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = await searchParams;
  return <><Hero /><Suspense fallback={<BoardFallback />}><BoardContent filters={filters} /></Suspense></>;
}

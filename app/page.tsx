import { Suspense } from "react";
import Hero from "@/components/questions/Hero";
import BoardContent, { BoardFallback } from "@/components/questions/BoardContent";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<BoardFallback />}>
        <BoardContent />
      </Suspense>
    </>
  );
}

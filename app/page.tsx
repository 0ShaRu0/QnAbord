import { Suspense } from "react";
import Hero from "@/components/Hero";
import BoardContent, { BoardFallback } from "@/components/BoardContent";

export default function HomePage() {
  return <><Hero /><Suspense fallback={<BoardFallback />}><BoardContent /></Suspense></>;
}

"use client";

import ErrorMessage from "@/components/ErrorMessage";

export default function QuestionsError({ reset }: { reset: () => void }) {
  return <main className="container route-state"><ErrorMessage /><button className="primary-button" onClick={reset}>다시 시도</button></main>;
}

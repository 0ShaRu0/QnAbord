import Link from "next/link";
import { PenLine } from "lucide-react";
import CategoryFilter from "./CategoryFilter";

export default function QuestionSidebar({ category, status }: { category?: string; status?: string }) {
  return (
    <aside className="sidebar-card">
      <Link href="/questions/write" className="ask-button"><PenLine size={17} />질문하기</Link>
      <CategoryFilter active={category} status={status} />
    </aside>
  );
}

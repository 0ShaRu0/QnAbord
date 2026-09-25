import Link from "next/link";
import { PenLine } from "lucide-react";
import CategoryFilter from "./CategoryFilter";
import type { QuestionFilters } from "@/lib/validation/filters";

export default function QuestionSidebar({ filters }: { filters: QuestionFilters }) {
  return (
    <aside className="sidebar-card">
      <Link href="/questions/write" className="ask-button">
        <PenLine size={17} />
        질문하기
      </Link>
      <CategoryFilter filters={filters} />
    </aside>
  );
}

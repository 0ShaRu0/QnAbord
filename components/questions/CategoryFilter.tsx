import Link from "next/link";
import {
  CheckCircle2,
  CircleEllipsis,
  Code2,
  Globe2,
  Library,
  Palette,
  TimerReset,
} from "lucide-react";
import { EDITABLE_CATEGORIES } from "@/lib/validation/questions";
import { questionListUrl, type QuestionFilters } from "@/lib/validation/filters";

const icons = { 프로그래밍: Code2, 웹개발: Globe2, 디자인: Palette, 기타: CircleEllipsis };

export default function CategoryFilter({ filters }: { filters: QuestionFilters }) {
  return (
    <nav className="category-list" aria-label="질문 필터">
      <Link
        className={!filters.status ? "active" : ""}
        aria-current={!filters.status ? "true" : undefined}
        href={questionListUrl(filters, { status: undefined })}
      >
        <Library size={17} />
        <span>모든 답변 상태</span>
      </Link>
      <Link
        className={filters.status === "answered" ? "active" : ""}
        aria-current={filters.status === "answered" ? "true" : undefined}
        href={questionListUrl(filters, { status: "answered" })}
      >
        <CheckCircle2 size={17} />
        <span>답변완료</span>
      </Link>
      <Link
        className={filters.status === "waiting" ? "active" : ""}
        aria-current={filters.status === "waiting" ? "true" : undefined}
        href={questionListUrl(filters, { status: "waiting" })}
      >
        <TimerReset size={17} />
        <span>답변대기</span>
      </Link>
      <div className="sidebar-rule" />
      <Link
        className={!filters.category ? "active" : ""}
        aria-current={!filters.category ? "true" : undefined}
        href={questionListUrl(filters, { category: undefined })}
      >
        <Library size={17} />
        <span>전체 카테고리</span>
      </Link>
      {EDITABLE_CATEGORIES.map((category) => {
        const Icon = icons[category];
        return (
          <Link
            className={filters.category === category ? "active" : ""}
            aria-current={filters.category === category ? "true" : undefined}
            href={questionListUrl(filters, { category })}
            key={category}
          >
            <Icon size={17} />
            <span>{category}</span>
          </Link>
        );
      })}
    </nav>
  );
}

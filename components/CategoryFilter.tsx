import Link from "next/link";
import { CheckCircle2, CircleEllipsis, Code2, Globe2, Library, Palette, TimerReset } from "lucide-react";
import { CATEGORIES } from "@/lib/utils";

const icons = [Library, Code2, Globe2, Palette, CircleEllipsis];

export default function CategoryFilter({ active = "전체", status }: { active?: string; status?: string }) {
  return (
    <div className="category-list">
      <Link className={!status ? "active" : ""} href={`/questions?category=${encodeURIComponent(active)}`}><Library size={17} /><span>전체 질문</span></Link>
      <Link className={status === "answered" ? "active" : ""} href="/questions?status=answered"><CheckCircle2 size={17} /><span>답변완료</span></Link>
      <Link className={status === "waiting" ? "active" : ""} href="/questions?status=waiting"><TimerReset size={17} /><span>답변대기</span></Link>
      <div className="sidebar-rule" />
      {CATEGORIES.slice(1).map((category, index) => {
        const Icon = icons[index + 1];
        return <Link className={active === category ? "active" : ""} href={`/questions?category=${encodeURIComponent(category)}`} key={category}><Icon size={17} /><span>{category}</span></Link>;
      })}
    </div>
  );
}

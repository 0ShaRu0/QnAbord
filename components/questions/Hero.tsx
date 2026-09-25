import SearchBar from "./SearchBar";
import type { QuestionFilters } from "@/lib/validation/filters";

export default function Hero({ filters }: { filters?: QuestionFilters }) {
  return (
    <section className="hero">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      <div className="container hero-content">
        <p className="eyebrow">LEARN TOGETHER, GROW TOGETHER</p>
        <h1>궁금한 것을 물어보세요!</h1>
        <p>함께 배우고 성장하는 개발자들의 질문 공간입니다.</p>
        <SearchBar filters={filters} />
      </div>
    </section>
  );
}

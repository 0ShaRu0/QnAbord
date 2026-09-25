import Link from "next/link";

export default function Pagination({
  page,
  hasMore,
  previousHref,
  nextHref,
  label = "질문 페이지",
}: {
  page: number;
  hasMore: boolean;
  previousHref: string;
  nextHref: string;
  label?: string;
}) {
  if (page === 1 && !hasMore) return null;
  return (
    <nav className="pagination" aria-label={label}>
      {page > 1 && (
        <Link className="secondary-button" href={previousHref} rel="prev">
          이전
        </Link>
      )}
      <span aria-current="page">{page} 페이지</span>
      {hasMore && (
        <Link className="secondary-button" href={nextHref} rel="next">
          다음
        </Link>
      )}
    </nav>
  );
}

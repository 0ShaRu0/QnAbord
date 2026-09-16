export const CATEGORIES = ["전체", "프로그래밍", "웹개발", "디자인", "기타"] as const;
export const EDITABLE_CATEGORIES = CATEGORIES.slice(1);

export function formatRelativeTime(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "방금 전";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

export function normalizeTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))].slice(0, 5);
}

export function getSafeRedirect(value: FormDataEntryValue | null, fallback = "/") {
  const path = typeof value === "string" ? value : fallback;
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}

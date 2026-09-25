export function formatRelativeTime(date: string, now = Date.now()) {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return "날짜 미상";
  const seconds = Math.floor((now - timestamp) / 1000);
  if (seconds >= 0 && seconds < 60) return "방금 전";
  if (seconds >= 60 && seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds >= 3600 && seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds >= 86400 && seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(timestamp);
}

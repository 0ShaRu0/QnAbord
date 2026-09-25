export default function Loading({ message = "질문을 불러오는 중..." }: { message?: string }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true" />
      {message}
    </div>
  );
}

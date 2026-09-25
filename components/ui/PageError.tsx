"use client";

export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container route-state">
      <h1>페이지를 불러오지 못했습니다.</h1>
      <p role="alert">잠시 후 다시 시도해주세요.</p>
      {error.digest && (
        <p>
          오류 번호: <code>{error.digest}</code>
        </p>
      )}
      <button className="primary-button" type="button" onClick={reset}>
        다시 시도
      </button>
    </main>
  );
}

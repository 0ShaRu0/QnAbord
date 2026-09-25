"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "sans-serif", padding: "3rem", lineHeight: 1.7 }}>
        <main>
          <h1>서비스를 불러오지 못했습니다.</h1>
          <p role="alert">잠시 후 다시 시도해주세요.</p>
          {error.digest && <p>오류 번호: {error.digest}</p>}
          <button type="button" onClick={reset}>
            다시 시도
          </button>
          <p>
            <Link href="/">홈으로 이동</Link>
          </p>
        </main>
      </body>
    </html>
  );
}

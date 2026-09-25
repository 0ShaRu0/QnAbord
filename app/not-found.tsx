import Link from "next/link";
import { CircleHelp } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found">
      <CircleHelp size={44} />
      <p>404</p>
      <h1>질문을 찾을 수 없습니다</h1>
      <span>삭제되었거나 잘못된 주소일 수 있어요.</span>
      <Link className="primary-button" href="/questions">
        질문 목록으로
      </Link>
    </main>
  );
}

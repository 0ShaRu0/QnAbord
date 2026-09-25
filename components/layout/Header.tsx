import Link from "next/link";
import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import { LogIn, Menu, MessageCircleMore, Search, UserRound } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { reportError } from "@/lib/errors";
import LogoutButton from "@/components/auth/LogoutButton";
import NavigationLinks from "./NavigationLinks";

async function AccountControls() {
  let session: Awaited<ReturnType<typeof getCurrentProfile>>;
  try {
    session = await getCurrentProfile();
  } catch (error) {
    unstable_rethrow(error);
    reportError("header.account", error);
    return (
      <span className="account-unavailable" role="status">
        계정 정보를 불러올 수 없습니다.
      </span>
    );
  }
  if (!session.user)
    return (
      <Link className="login-button" href="/login">
        <LogIn size={16} />
        로그인
      </Link>
    );
  return (
    <>
      <span className="user-name">
        <UserRound size={17} />
        {session.profile?.username ?? "회원"}
      </span>
      <LogoutButton />
    </>
  );
}

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Q&A 홈">
          <span className="brand-mark">
            <MessageCircleMore size={20} />
          </span>
          <span>Q&amp;A</span>
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          <NavigationLinks />
        </nav>
        <div className="header-actions">
          <Link className="icon-link" href="/questions" aria-label="질문 검색">
            <Search size={20} />
          </Link>
          <Suspense
            fallback={
              <span className="account-unavailable" role="status">
                계정 확인 중...
              </span>
            }
          >
            <AccountControls />
          </Suspense>
          <details className="mobile-menu">
            <summary aria-label="메뉴 열기">
              <Menu size={22} />
            </summary>
            <nav aria-label="모바일 메뉴">
              <NavigationLinks />
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { LogIn, LogOut, Menu, MessageCircleMore, Search, UserRound } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries/profiles";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "홈" },
  { href: "/questions", label: "질문게시판" },
  { href: "/questions?category=기타", label: "자유게시판" },
  { href: "/#notice", label: "공지사항" },
];

export default async function Header() {
  const profile = await getCurrentProfile();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Q&A 홈">
          <span className="brand-mark"><MessageCircleMore size={20} /></span>
          <span>Q&amp;A</span>
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link className="icon-link" href="/questions" aria-label="질문 검색"><Search size={20} /></Link>
          {profile ? (
            <>
              <span className="user-name"><UserRound size={17} />{profile.username}</span>
              <form action={logout}><button className="login-button" type="submit"><LogOut size={16} />로그아웃</button></form>
            </>
          ) : (
            <Link className="login-button" href="/login"><LogIn size={16} />로그인</Link>
          )}
          <details className="mobile-menu">
            <summary aria-label="메뉴 열기"><Menu size={22} /></summary>
            <nav>{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
          </details>
        </div>
      </div>
    </header>
  );
}

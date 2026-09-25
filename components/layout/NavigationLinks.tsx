"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "홈" },
  { href: "/questions", label: "질문게시판" },
];

export default function NavigationLinks() {
  const pathname = usePathname();
  return links.map(({ href, label }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link key={href} href={href} aria-current={active ? "page" : undefined}>
        {label}
      </Link>
    );
  });
}

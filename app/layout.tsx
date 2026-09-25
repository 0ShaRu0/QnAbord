import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Q&A | 함께 배우는 질문 커뮤니티", template: "%s | Q&A" },
  description: "개발과 디자인의 궁금증을 나누고 함께 성장하는 Q&A 커뮤니티",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <div className="page-shell">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

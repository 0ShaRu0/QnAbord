import Link from "next/link";
import { MessageCircleMore } from "lucide-react";

export default function Footer() {
  return <footer className="footer"><div className="container footer-inner"><Link href="/" className="brand"><span className="brand-mark"><MessageCircleMore size={18} /></span>Q&amp;A</Link><p>질문하며 배우고, 답하며 함께 성장합니다.</p><span>© 2026 Q&amp;A Community</span></div></footer>;
}

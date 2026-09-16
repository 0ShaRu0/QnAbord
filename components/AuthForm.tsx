"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import type { AuthState } from "@/app/actions/auth";

type AuthAction = (state: AuthState, formData: FormData) => Promise<AuthState>;

export default function AuthForm({ mode, action, redirectTo }: { mode: "login" | "signup"; action: AuthAction; redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(action, {});
  const signup = mode === "signup";
  return (
    <div className="auth-card">
      <div className="auth-intro"><span>{signup ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span><h1>{signup ? "함께 질문하고 성장해요" : "다시 만나서 반가워요"}</h1><p>{signup ? "계정을 만들고 첫 질문을 남겨보세요." : "로그인하고 질문과 답변을 이어가세요."}</p></div>
      <form action={formAction}>
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        {signup && <label>사용자 이름<div className="input-with-icon"><UserRound size={18} /><input name="username" maxLength={20} required placeholder="표시할 이름" /></div></label>}
        <label>이메일<div className="input-with-icon"><Mail size={18} /><input name="email" type="email" required placeholder="name@example.com" /></div></label>
        <label>비밀번호<div className="input-with-icon"><LockKeyhole size={18} /><input name="password" type="password" minLength={8} required placeholder="8자 이상 입력" /></div></label>
        {state.error && <p className="inline-error">{state.error}</p>}
        {state.message && <p className="success-message">{state.message}</p>}
        <button className="primary-button auth-submit" type="submit" disabled={pending}>{pending ? "처리 중..." : signup ? "회원가입" : "로그인"}<ArrowRight size={17} /></button>
      </form>
      <p className="auth-switch">{signup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link></p>
    </div>
  );
}

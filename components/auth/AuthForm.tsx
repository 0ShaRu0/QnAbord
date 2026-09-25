"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import { INITIAL_ACTION_STATE, type FormAction } from "@/types/actions";
import ActionFeedback from "@/components/ui/ActionFeedback";
import styles from "./AuthForm.module.css";

export default function AuthForm({
  mode,
  action,
  redirectTo,
  confirmationFailed = false,
}: {
  mode: "login" | "signup";
  action: FormAction;
  redirectTo?: string;
  confirmationFailed?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const signup = mode === "signup";
  return (
    <div className={styles.card}>
      <div className={styles.intro}>
        <span>{signup ? "JOIN THE COMMUNITY" : "WELCOME BACK"}</span>
        <h1>{signup ? "함께 질문하고 성장해요" : "다시 만나서 반가워요"}</h1>
        <p>
          {signup ? "계정을 만들고 첫 질문을 남겨보세요." : "로그인하고 질문과 답변을 이어가세요."}
        </p>
      </div>
      {confirmationFailed && (
        <p className="inline-error" role="alert">
          인증 링크가 만료되었거나 유효하지 않습니다. 다시 가입을 시도하거나 이메일 인증 상태를
          확인해주세요.
        </p>
      )}
      <form action={formAction} aria-busy={pending}>
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        {signup && (
          <label>
            사용자 이름
            <div className="input-with-icon">
              <UserRound size={18} />
              <input
                name="username"
                autoComplete="nickname"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="표시할 이름"
              />
            </div>
          </label>
        )}
        <label>
          이메일
          <div className="input-with-icon">
            <Mail size={18} />
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>
        </label>
        <label>
          비밀번호
          <div className="input-with-icon">
            <LockKeyhole size={18} />
            <input
              name="password"
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              minLength={signup ? 8 : undefined}
              required
              placeholder={signup ? "8자 이상 입력" : "비밀번호 입력"}
            />
          </div>
        </label>
        <ActionFeedback state={state} />
        <button className={`primary-button ${styles.submit}`} type="submit" disabled={pending}>
          {pending ? "처리 중..." : signup ? "회원가입" : "로그인"}
          <ArrowRight size={17} />
        </button>
      </form>
      <p className={styles.switcher}>
        {signup ? "이미 계정이 있나요?" : "아직 계정이 없나요?"}{" "}
        <Link href={signup ? "/login" : "/signup"}>{signup ? "로그인" : "회원가입"}</Link>
      </p>
    </div>
  );
}

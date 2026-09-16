"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import type { AnswerState } from "@/app/actions/answers";

type AnswerAction = (state: AnswerState, formData: FormData) => Promise<AnswerState>;

export default function AnswerForm({ action, authenticated }: { action: AnswerAction; authenticated: boolean }) {
  const [state, formAction, pending] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.success) formRef.current?.reset(); }, [state.success]);
  return (
    <form ref={formRef} action={formAction} className="answer-form">
      <div><h2>답변 작성</h2><span>알고 있는 내용을 친절하게 공유해주세요.</span></div>
      <textarea name="content" maxLength={10000} required disabled={!authenticated} placeholder={authenticated ? "답변을 작성해주세요..." : "로그인 후 답변을 작성할 수 있습니다."} />
      {state.error && <p className="inline-error">{state.error}</p>}
      {state.success && <p className="success-message">답변이 등록되었습니다.</p>}
      <div className="answer-submit"><span>최대 10,000자</span><button className="primary-button" type="submit" disabled={!authenticated || pending}>{pending ? "등록 중..." : "답변 등록"}<Send size={16} /></button></div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { ArrowRight, Hash, Send } from "lucide-react";
import type { QuestionListItem } from "@/types/database.types";
import type { FormState } from "@/app/actions/questions";
import { EDITABLE_CATEGORIES } from "@/lib/utils";

type QuestionAction = (state: FormState, formData: FormData) => Promise<FormState>;

export default function QuestionForm({ action, question }: { action: QuestionAction; question?: QuestionListItem }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="editor-card">
      <div className="form-heading"><span>{question ? "EDIT QUESTION" : "NEW QUESTION"}</span><h1>{question ? "질문을 수정하세요" : "무엇이 궁금한가요?"}</h1><p>상황과 시도한 방법을 자세히 적으면 더 좋은 답변을 받을 수 있어요.</p></div>
      {state.error && <div className="inline-error">{state.error}</div>}
      <label className="field-label" htmlFor="title">질문 제목 <b>*</b><small>최대 120자</small></label>
      <input className="form-input" id="title" name="title" maxLength={120} required defaultValue={question?.title} placeholder="질문을 한 문장으로 요약해주세요" />
      <label className="field-label" htmlFor="category">카테고리 <b>*</b></label>
      <select className="form-input" id="category" name="category" required defaultValue={question?.category ?? ""}>
        <option value="" disabled>카테고리를 선택해주세요</option>
        {EDITABLE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
      </select>
      <label className="field-label" htmlFor="content">질문 내용 <b>*</b><small>최대 10,000자</small></label>
      <textarea className="form-textarea" id="content" name="content" maxLength={10000} required defaultValue={question?.content} placeholder="문제 상황, 기대한 결과, 이미 시도한 방법을 작성해주세요." />
      <label className="field-label" htmlFor="tags">태그 <small>쉼표로 구분 · 최대 5개</small></label>
      <div className="input-with-icon"><Hash size={18} /><input id="tags" name="tags" defaultValue={question?.tags.join(", ")} placeholder="nextjs, supabase, typescript" /></div>
      <div className="form-submit-row"><span>커뮤니티 가이드를 지켜주세요.</span><button className="primary-button" type="submit" disabled={pending}>{pending ? "저장 중..." : question ? "수정 완료" : "질문 등록"}{question ? <ArrowRight size={17} /> : <Send size={17} />}</button></div>
    </form>
  );
}

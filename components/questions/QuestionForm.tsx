"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Hash, Send } from "lucide-react";
import type { QuestionDraft } from "@/types/models";
import { INITIAL_ACTION_STATE, type FormAction } from "@/types/actions";
import { EDITABLE_CATEGORIES, textLength } from "@/lib/validation/questions";
import ActionFeedback from "@/components/ui/ActionFeedback";

export default function QuestionForm({
  action,
  question,
}: {
  action: FormAction;
  question?: QuestionDraft;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);
  const [title, setTitle] = useState(question?.title ?? "");
  const [content, setContent] = useState(question?.content ?? "");
  const [category, setCategory] = useState<string>(question?.category ?? "");
  const [tags, setTags] = useState(question?.tags.join(", ") ?? "");
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  return (
    <form action={formAction} className="editor-card" aria-busy={pending}>
      <div className="form-heading">
        <span>{question ? "EDIT QUESTION" : "NEW QUESTION"}</span>
        <h1>{question ? "질문을 수정하세요" : "무엇이 궁금한가요?"}</h1>
        <p>상황과 시도한 방법을 자세히 적으면 더 좋은 답변을 받을 수 있어요.</p>
      </div>
      <ActionFeedback state={state} id="question-feedback" />
      <label className="field-label" htmlFor="title">
        질문 제목 <b>*</b>
        <small>{textLength(title)}/120자</small>
      </label>
      <input
        className="form-input"
        id="title"
        name="title"
        required
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        aria-invalid={Boolean(errors?.title)}
        aria-describedby={errors?.title ? "question-feedback" : undefined}
        placeholder="질문을 한 문장으로 요약해주세요"
      />
      <label className="field-label" htmlFor="category">
        카테고리 <b>*</b>
      </label>
      <select
        className="form-input"
        id="category"
        name="category"
        required
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        aria-invalid={Boolean(errors?.category)}
      >
        <option value="" disabled>
          카테고리를 선택해주세요
        </option>
        {EDITABLE_CATEGORIES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
      <label className="field-label" htmlFor="content">
        질문 내용 <b>*</b>
        <small>{textLength(content)}/10,000자</small>
      </label>
      <textarea
        className="form-textarea"
        id="content"
        name="content"
        required
        value={content}
        onChange={(event) => setContent(event.target.value)}
        aria-invalid={Boolean(errors?.content)}
        aria-describedby={errors?.content ? "question-feedback" : undefined}
        placeholder="문제 상황, 기대한 결과, 이미 시도한 방법을 작성해주세요."
      />
      <label className="field-label" htmlFor="tags">
        태그 <small>쉼표로 구분 · 최대 5개 · 각 30자</small>
      </label>
      <div className="input-with-icon">
        <Hash size={18} />
        <input
          id="tags"
          name="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          aria-invalid={Boolean(errors?.tags)}
          aria-describedby={errors?.tags ? "question-feedback" : undefined}
          placeholder="nextjs, supabase, typescript"
        />
      </div>
      <div className="form-submit-row">
        <span>커뮤니티 가이드를 지켜주세요.</span>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? "저장 중..." : question ? "수정 완료" : "질문 등록"}
          {question ? <ArrowRight size={17} /> : <Send size={17} />}
        </button>
      </div>
    </form>
  );
}

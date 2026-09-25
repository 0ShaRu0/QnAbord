"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { Send } from "lucide-react";
import { INITIAL_ACTION_STATE, type FormAction } from "@/types/actions";
import ActionFeedback from "@/components/ui/ActionFeedback";

export default function AnswerForm({
  action,
  authenticated,
  questionId,
}: {
  action: FormAction;
  authenticated: boolean;
  questionId: string;
}) {
  const id = useId();
  const [content, setContent] = useState("");
  const [state, formAction, pending] = useActionState(
    async (previous: typeof INITIAL_ACTION_STATE, form: FormData) => {
      const result = await action(previous, form);
      if (result.status === "success") setContent("");
      return result;
    },
    INITIAL_ACTION_STATE,
  );
  return (
    <form action={formAction} className="answer-form" aria-busy={pending}>
      <div>
        <h2>답변 작성</h2>
        <span>알고 있는 내용을 친절하게 공유해주세요.</span>
      </div>
      <label className="sr-only" htmlFor={id}>
        답변 내용
      </label>
      <textarea
        id={id}
        name="content"
        required
        disabled={!authenticated}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        aria-describedby={`${id}-feedback`}
        aria-invalid={state.status === "error" && state.code === "validation"}
        placeholder={
          authenticated ? "답변을 작성해주세요..." : "로그인 후 답변을 작성할 수 있습니다."
        }
      />
      <div id={`${id}-feedback`}>
        <ActionFeedback state={state} />
      </div>
      {!authenticated && (
        <Link href={`/login?redirectTo=${encodeURIComponent(`/questions/${questionId}`)}`}>
          로그인하고 답변하기
        </Link>
      )}
      <div className="answer-submit">
        <span>최대 10,000자</span>
        <button className="primary-button" type="submit" disabled={!authenticated || pending}>
          {pending ? "등록 중..." : "답변 등록"}
          <Send size={16} />
        </button>
      </div>
    </form>
  );
}

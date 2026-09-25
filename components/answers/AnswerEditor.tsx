"use client";

import { useActionState, useId, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateAnswer, deleteAnswer } from "@/app/actions/answers";
import { INITIAL_ACTION_STATE, type ActionState } from "@/types/actions";
import ActionFeedback from "@/components/ui/ActionFeedback";
import ConfirmSubmitButton from "@/components/ui/ConfirmSubmitButton";

export default function AnswerEditor({ answerId, content }: { answerId: string; content: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const id = useId();
  const [state, action, pending] = useActionState(async (previous: ActionState, form: FormData) => {
    const result = await updateAnswer(answerId, previous, form);
    if (result.status === "success") setEditing(false);
    return result;
  }, INITIAL_ACTION_STATE);
  if (editing)
    return (
      <form className="answer-edit-form" action={action} aria-busy={pending}>
        <label htmlFor={id}>답변 수정</label>
        <textarea
          id={id}
          name="content"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          required
          aria-describedby={`${id}-feedback`}
        />
        <div id={`${id}-feedback`}>
          <ActionFeedback state={state} />
        </div>
        <div>
          <button
            className="secondary-button"
            type="button"
            disabled={pending}
            onClick={() => setEditing(false)}
          >
            <X size={15} />
            취소
          </button>
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    );
  return (
    <>
      <p className="answer-content">{content}</p>
      <div className="owner-actions">
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setDraft(content);
            setEditing(true);
          }}
        >
          <Pencil size={15} />
          수정
        </button>
        <ConfirmSubmitButton
          action={deleteAnswer.bind(null, answerId)}
          title="답변을 삭제할까요?"
          description="삭제한 답변은 다시 복구할 수 없습니다."
        />
      </div>
    </>
  );
}

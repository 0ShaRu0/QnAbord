"use client";

import { useActionState, useId, useRef } from "react";
import { Trash2, X } from "lucide-react";
import { INITIAL_ACTION_STATE, type MutationAction } from "@/types/actions";
import ActionFeedback from "./ActionFeedback";
import styles from "./ConfirmSubmitButton.module.css";

export default function ConfirmSubmitButton({
  action,
  title,
  description,
}: {
  action: MutationAction;
  title: string;
  description: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [state, formAction, pending] = useActionState(async () => {
    const result = await action();
    if (result.status === "success") dialogRef.current?.close();
    return result;
  }, INITIAL_ACTION_STATE);
  return (
    <>
      <button
        className="text-button danger"
        type="button"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2 size={15} />
        삭제
      </button>
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <button
          className={styles.close}
          type="button"
          aria-label="닫기"
          disabled={pending}
          onClick={() => dialogRef.current?.close()}
        >
          <X size={20} />
        </button>
        <span className={styles.icon}>
          <Trash2 size={24} />
        </span>
        <h2 id={`${id}-title`}>{title}</h2>
        <p id={`${id}-description`}>{description}</p>
        <ActionFeedback state={state} />
        <div className={styles.actions}>
          <button
            type="button"
            className="secondary-button"
            disabled={pending}
            onClick={() => dialogRef.current?.close()}
          >
            취소
          </button>
          <form action={formAction} aria-busy={pending}>
            <button type="submit" className="danger-button" disabled={pending}>
              {pending ? "삭제 중..." : "삭제하기"}
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}

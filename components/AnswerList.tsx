"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareText, Pencil, UserRound, X } from "lucide-react";
import type { AnswerWithAuthor } from "@/types/database.types";
import { formatRelativeTime } from "@/lib/utils";
import ConfirmSubmitButton from "./ConfirmSubmitButton";

export default function AnswerList({ answers, currentUserId, updateAction, deleteAction }: {
  answers: AnswerWithAuthor[];
  currentUserId?: string;
  updateAction: (answerId: string, formData: FormData) => Promise<void>;
  deleteAction: (answerId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  if (!answers.length) return <div className="no-answers"><MessageSquareText size={34} /><strong>아직 답변이 없습니다.</strong><p>첫 번째 답변을 작성해보세요!</p></div>;
  return (
    <section className="answers-section">
      <h2><CheckCircle2 size={20} />답변 {answers.length}개</h2>
      <div className="answer-list">
        {answers.map((answer, index) => {
          const mine = answer.user_id === currentUserId;
          return (
            <article className="answer-card" key={answer.id}>
              <div className="answer-number">A{String(index + 1).padStart(2, "0")}</div>
              <div className="answer-author"><span className="avatar"><UserRound size={17} /></span><div><strong>{answer.profiles?.username ?? "알 수 없는 사용자"}</strong><span>{formatRelativeTime(answer.created_at)}</span></div></div>
              {editing === answer.id ? (
                <form className="answer-edit-form" action={async (formData) => { await updateAction(answer.id, formData); setEditing(null); }}>
                  <textarea name="content" defaultValue={answer.content} required maxLength={10000} />
                  <div><button className="secondary-button" type="button" onClick={() => setEditing(null)}><X size={15} />취소</button><button className="primary-button" type="submit">저장</button></div>
                </form>
              ) : <p className="answer-content">{answer.content}</p>}
              {mine && editing !== answer.id && <div className="owner-actions"><button className="text-button" type="button" onClick={() => setEditing(answer.id)}><Pencil size={15} />수정</button><ConfirmSubmitButton action={deleteAction.bind(null, answer.id)} title="답변을 삭제할까요?" description="삭제한 답변은 다시 복구할 수 없습니다." /></div>}
            </article>
          );
        })}
      </div>
    </section>
  );
}

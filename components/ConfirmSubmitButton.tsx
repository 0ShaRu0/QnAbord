"use client";

import { useRef } from "react";
import { Trash2, X } from "lucide-react";

export default function ConfirmSubmitButton({ action, title, description }: { action: () => Promise<void>; title: string; description: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button className="text-button danger" type="button" onClick={() => dialogRef.current?.showModal()}><Trash2 size={15} />삭제</button>
      <dialog ref={dialogRef} className="confirm-dialog">
        <button className="dialog-close" type="button" aria-label="닫기" onClick={() => dialogRef.current?.close()}><X size={20} /></button>
        <span className="dialog-icon"><Trash2 size={24} /></span>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="dialog-actions">
          <button type="button" className="secondary-button" onClick={() => dialogRef.current?.close()}>취소</button>
          <form action={action}><button type="submit" className="danger-button">삭제하기</button></form>
        </div>
      </dialog>
    </>
  );
}

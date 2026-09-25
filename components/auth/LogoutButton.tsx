"use client";

import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { INITIAL_ACTION_STATE } from "@/types/actions";
import ActionFeedback from "@/components/ui/ActionFeedback";

export default function LogoutButton() {
  const [state, action, pending] = useActionState(logout, INITIAL_ACTION_STATE);
  return (
    <form action={action}>
      <button className="login-button" type="submit" disabled={pending}>
        <LogOut size={16} />
        {pending ? "로그아웃 중..." : "로그아웃"}
      </button>
      <ActionFeedback state={state} />
    </form>
  );
}

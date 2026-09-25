import type { ActionState } from "@/types/actions";

export default function ActionFeedback({ state, id }: { state: ActionState; id?: string }) {
  if (state.status === "idle") return null;
  return (
    <p
      id={id}
      className={state.status === "error" ? "inline-error" : "success-message"}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

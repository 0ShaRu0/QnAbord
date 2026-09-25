export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      code: "validation" | "unauthenticated" | "not_found" | "unavailable";
      message: string;
      fieldErrors?: Record<string, string>;
    };

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };

export type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;
export type MutationAction = () => Promise<ActionState>;

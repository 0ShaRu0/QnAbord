import "server-only";
import type { ActionState } from "@/types/actions";

type ErrorLike = { code?: unknown; status?: unknown; name?: unknown };

export function reportError(operation: string, error: unknown, resourceId?: string) {
  const details = error && typeof error === "object" ? (error as ErrorLike) : {};
  // Never log credentials, request cookies, query bodies, or database error details
  // that may contain user-supplied values. The operation/code identify the failure.
  console.error(
    JSON.stringify({
      operation,
      code: typeof details.code === "string" ? details.code : undefined,
      status: typeof details.status === "number" ? details.status : undefined,
      name: typeof details.name === "string" ? details.name : "UnknownError",
      resourceId,
    }),
  );
}

export function unavailable(operation: string, error: unknown, resourceId?: string): ActionState {
  reportError(operation, error, resourceId);
  return {
    status: "error",
    code: "unavailable",
    message: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.",
  };
}

export function queryFailure(operation: string, error: unknown): never {
  reportError(operation, error);
  throw new Error(`데이터를 불러오지 못했습니다. (${operation})`);
}

export function validationError(fieldErrors: Record<string, string>): ActionState {
  return {
    status: "error",
    code: "validation",
    message: Object.values(fieldErrors)[0] ?? "입력값을 확인해주세요.",
    fieldErrors,
  };
}

export const NOT_FOUND_STATE: ActionState = {
  status: "error",
  code: "not_found",
  message: "대상이 없거나 수정할 권한이 없습니다.",
};
export const UNAUTHENTICATED_STATE: ActionState = {
  status: "error",
  code: "unauthenticated",
  message: "로그인 후 다시 시도해주세요.",
};

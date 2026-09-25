"use server";

import { authenticatedClient } from "@/lib/auth/server";
import { isUuid, parseAnswer } from "@/lib/validation/questions";
import { NOT_FOUND_STATE, UNAUTHENTICATED_STATE, unavailable, validationError } from "@/lib/errors";
import { revalidateQuestions } from "@/lib/revalidation";
import type { ActionState } from "@/types/actions";

export async function createAnswer(
  questionId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isUuid(questionId)) return NOT_FOUND_STATE;
  const parsed = parseAnswer(formData);
  if (!parsed.ok) return validationError(parsed.fieldErrors);
  try {
    const session = await authenticatedClient();
    if (!session) return UNAUTHENTICATED_STATE;
    const { supabase, user } = session;
    const { error } = await supabase
      .from("answers")
      .insert({ question_id: questionId, user_id: user.id, content: parsed.value.content });
    if (error?.code === "23503") return NOT_FOUND_STATE;
    if (error) return unavailable("answers.create", error, questionId);
  } catch (error) {
    return unavailable("answers.create", error, questionId);
  }
  revalidateQuestions(questionId);
  return { status: "success", message: "답변이 등록되었습니다." };
}

export async function updateAnswer(
  answerId: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isUuid(answerId)) return NOT_FOUND_STATE;
  const parsed = parseAnswer(formData);
  if (!parsed.ok) return validationError(parsed.fieldErrors);
  let questionId: string;
  try {
    const session = await authenticatedClient();
    if (!session) return UNAUTHENTICATED_STATE;
    const { supabase } = session;
    const { data, error } = await supabase
      .from("answers")
      .update({ content: parsed.value.content })
      .eq("id", answerId)
      .select("id, question_id")
      .maybeSingle();
    if (error) return unavailable("answers.update", error, answerId);
    if (!data) return NOT_FOUND_STATE;
    questionId = data.question_id;
  } catch (error) {
    return unavailable("answers.update", error, answerId);
  }
  revalidateQuestions(questionId);
  return { status: "success", message: "답변이 수정되었습니다." };
}

export async function deleteAnswer(answerId: string): Promise<ActionState> {
  if (!isUuid(answerId)) return NOT_FOUND_STATE;
  let questionId: string;
  try {
    const session = await authenticatedClient();
    if (!session) return UNAUTHENTICATED_STATE;
    const { supabase } = session;
    const { data, error } = await supabase
      .from("answers")
      .delete()
      .eq("id", answerId)
      .select("id, question_id")
      .maybeSingle();
    if (error) return unavailable("answers.delete", error, answerId);
    if (!data) return NOT_FOUND_STATE;
    questionId = data.question_id;
  } catch (error) {
    return unavailable("answers.delete", error, answerId);
  }
  revalidateQuestions(questionId);
  return { status: "success", message: "답변이 삭제되었습니다." };
}

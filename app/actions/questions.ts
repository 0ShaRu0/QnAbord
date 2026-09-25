"use server";

import { redirect } from "next/navigation";
import { authenticatedClient } from "@/lib/auth/server";
import { parseQuestion, isUuid } from "@/lib/validation/questions";
import { NOT_FOUND_STATE, UNAUTHENTICATED_STATE, unavailable, validationError } from "@/lib/errors";
import { revalidateQuestions } from "@/lib/revalidation";
import type { ActionState } from "@/types/actions";

export async function createQuestion(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseQuestion(formData);
  if (!parsed.ok) return validationError(parsed.fieldErrors);
  let questionId: string;
  try {
    const session = await authenticatedClient();
    if (!session) return UNAUTHENTICATED_STATE;
    const { supabase } = session;
    const { data, error } = await supabase.rpc("create_question_with_tags", {
      question_title: parsed.value.title,
      question_content: parsed.value.content,
      question_category: parsed.value.category,
      tag_names: parsed.value.tags,
    });
    if (error || !data) return unavailable("questions.create", error);
    questionId = data;
  } catch (error) {
    return unavailable("questions.create", error);
  }
  revalidateQuestions(questionId);
  redirect(`/questions/${questionId}`);
}

export async function updateQuestion(
  id: string,
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!isUuid(id)) return NOT_FOUND_STATE;
  const parsed = parseQuestion(formData);
  if (!parsed.ok) return validationError(parsed.fieldErrors);
  try {
    const session = await authenticatedClient();
    if (!session) return UNAUTHENTICATED_STATE;
    const { supabase } = session;
    const { error } = await supabase.rpc("update_question_with_tags", {
      question_id: id,
      question_title: parsed.value.title,
      question_content: parsed.value.content,
      question_category: parsed.value.category,
      tag_names: parsed.value.tags,
    });
    if (error?.code === "P0002") return NOT_FOUND_STATE;
    if (error) return unavailable("questions.update", error, id);
  } catch (error) {
    return unavailable("questions.update", error, id);
  }
  revalidateQuestions(id);
  redirect(`/questions/${id}`);
}

export async function deleteQuestion(id: string): Promise<ActionState> {
  if (!isUuid(id)) return NOT_FOUND_STATE;
  try {
    const session = await authenticatedClient();
    if (!session) return UNAUTHENTICATED_STATE;
    const { supabase } = session;
    const { data, error } = await supabase
      .from("questions")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) return unavailable("questions.delete", error, id);
    if (!data) return NOT_FOUND_STATE;
  } catch (error) {
    return unavailable("questions.delete", error, id);
  }
  revalidateQuestions(id);
  redirect("/questions");
}

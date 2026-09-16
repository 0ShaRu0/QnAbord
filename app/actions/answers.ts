"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AnswerState = { error?: string; success?: boolean };

export async function createAnswer(questionId: string, _: AnswerState, formData: FormData): Promise<AnswerState> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "답변 내용을 입력해주세요." };
  if (content.length > 10000) return { error: "답변은 10,000자 이하로 입력해주세요." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "로그인 후 답변을 작성할 수 있습니다." };
  const { error } = await supabase.from("answers").insert({ question_id: questionId, user_id: user.id, content });
  if (error) return { error: error.message };
  revalidatePath(`/questions/${questionId}`);
  return { success: true };
}

export async function updateAnswer(answerId: string, questionId: string, formData: FormData) {
  const content = String(formData.get("content") ?? "").trim();
  if (!content || content.length > 10000) return;
  const supabase = await createClient();
  const { error } = await supabase.from("answers").update({ content, updated_at: new Date().toISOString() }).eq("id", answerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/questions/${questionId}`);
}

export async function deleteAnswer(answerId: string, questionId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("answers").delete().eq("id", answerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/questions/${questionId}`);
}

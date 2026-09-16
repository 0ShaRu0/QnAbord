"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EDITABLE_CATEGORIES, normalizeTags } from "@/lib/utils";

export type FormState = { error?: string };

function parseQuestion(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const tags = normalizeTags(String(formData.get("tags") ?? ""));
  if (!title || !content || !category) return { error: "제목, 카테고리, 내용을 모두 입력해주세요." };
  if (title.length > 120) return { error: "제목은 120자 이하로 입력해주세요." };
  if (content.length > 10000) return { error: "내용은 10,000자 이하로 입력해주세요." };
  if (!EDITABLE_CATEGORIES.includes(category as (typeof EDITABLE_CATEGORIES)[number])) return { error: "올바른 카테고리를 선택해주세요." };
  return { title, content, category, tags };
}

export async function createQuestion(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseQuestion(formData);
  if ("error" in parsed) return { error: parsed.error };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent("/questions/write")}`);
  const { data, error } = await supabase.rpc("create_question_with_tags", {
    question_title: parsed.title,
    question_content: parsed.content,
    question_category: parsed.category,
    tag_names: parsed.tags,
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  redirect(`/questions/${data}`);
}

export async function updateQuestion(id: string, _: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseQuestion(formData);
  if ("error" in parsed) return { error: parsed.error };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_question_with_tags", {
    question_id: id,
    question_title: parsed.title,
    question_content: parsed.content,
    question_category: parsed.category,
    tag_names: parsed.tags,
  });
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath(`/questions/${id}`);
  redirect(`/questions/${id}`);
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  redirect("/questions");
}

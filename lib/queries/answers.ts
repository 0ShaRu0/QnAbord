import "server-only";
import { createClient } from "@/lib/supabase/server";
import { queryFailure } from "@/lib/errors";
import { PAGE_SIZE } from "@/lib/validation/filters";
import type { AnswerWithAuthor, PageResult } from "@/types/models";

export async function getAnswers(
  questionId: string,
  page: number,
): Promise<PageResult<AnswerWithAuthor>> {
  const supabase = await createClient();
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("answers")
    .select(
      "id, question_id, user_id, content, created_at, updated_at, profiles(username, avatar_url)",
    )
    .eq("question_id", questionId)
    .order("created_at")
    .order("id")
    .range(offset, offset + PAGE_SIZE);
  if (error) queryFailure("answers.list", error);
  return {
    items: (data ?? []).slice(0, PAGE_SIZE),
    page,
    hasMore: (data?.length ?? 0) > PAGE_SIZE,
  };
}

import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { queryFailure, reportError } from "@/lib/errors";
import { isUuid } from "@/lib/validation/questions";
import { PAGE_SIZE, type QuestionFilters } from "@/lib/validation/filters";
import type {
  PageResult,
  PopularQuestion,
  QuestionDraft,
  QuestionFeedRow,
  QuestionListItem,
} from "@/types/models";

function mapQuestion(row: QuestionFeedRow): QuestionListItem {
  return {
    id: required(row.id),
    user_id: required(row.user_id),
    title: required(row.title),
    content: required(row.content),
    category: required(row.category),
    status: required(row.status),
    views: required(row.views),
    created_at: required(row.created_at),
    updated_at: required(row.updated_at),
    username: required(row.username),
    avatar_url: row.avatar_url,
    answer_count: required(row.answer_count),
    tags: Array.isArray(row.tags)
      ? row.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
  };
}

// Views are conservatively nullable in generated types. Check our read-model
// invariant at the boundary instead of asserting a stronger type everywhere.
function required<T>(value: T | null): T {
  if (value === null)
    queryFailure("questions.invalidFeedRow", new Error("Missing required view field"));
  return value;
}

export async function getQuestions(
  filters: QuestionFilters,
): Promise<PageResult<QuestionListItem>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_questions", {
    search_text: filters.query,
    category_filter: filters.category,
    status_filter: filters.status,
    sort_by: filters.sort,
    page_number: filters.page,
    page_size: PAGE_SIZE,
  });
  if (error) queryFailure("questions.list", error);
  return {
    items: (data ?? []).slice(0, PAGE_SIZE).map(mapQuestion),
    hasMore: (data?.length ?? 0) > PAGE_SIZE,
    page: filters.page,
  };
}

export async function getPopularQuestions(): Promise<PopularQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_feed")
    .select("id, title, views, answer_count")
    .order("views", { ascending: false })
    .order("id")
    .limit(5);
  if (error) queryFailure("questions.popular", error);
  return (data ?? []).map((row) => ({
    id: required(row.id),
    title: required(row.title),
    views: required(row.views),
    answer_count: required(row.answer_count),
  }));
}

// React cache deduplicates only within a server request, not across users.
export const getQuestion = cache(async (id: string): Promise<QuestionListItem | null> => {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("question_feed")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) queryFailure("questions.detail", error);
  return data ? mapQuestion(data) : null;
});

export async function incrementViews(id: string) {
  if (!isUuid(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_question_views", { question_id: id });
  if (error) {
    reportError("questions.incrementViews", error, id);
    return false;
  }
  return true;
}

export async function getEditableQuestion(
  id: string,
  userId: string,
): Promise<QuestionDraft | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("questions")
    .select("id, title, content, category, question_tags(tags(name))")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) queryFailure("questions.edit", error);
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.question_tags.flatMap((tag) => (tag.tags ? [tag.tags.name] : [])),
  };
}

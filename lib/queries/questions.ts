import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { QuestionListItem } from "@/types/database.types";

type FeedRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  status: "waiting" | "answered";
  views: number;
  created_at: string;
  updated_at: string;
  username: string;
  avatar_url: string | null;
  answer_count: number;
  tags: unknown;
};

function mapQuestion(row: FeedRow): QuestionListItem {
  return { ...row, tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [] };
}

export type QuestionFilters = { query?: string; category?: string; sort?: string; status?: string };

export async function getQuestions(filters: QuestionFilters = {}) {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  let request = supabase.from("question_feed").select("*");

  if (filters.query) {
    const safeQuery = filters.query.replaceAll(/[%,()]/g, " ").trim();
    if (safeQuery) request = request.or(`title.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`);
  }
  if (filters.category && filters.category !== "전체") request = request.eq("category", filters.category);
  if (filters.status === "answered" || filters.status === "waiting") request = request.eq("status", filters.status);

  const orderColumn = filters.sort === "views" ? "views" : filters.sort === "answers" ? "answer_count" : "created_at";
  const { data, error } = await request.order(orderColumn, { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return (data as FeedRow[]).map(mapQuestion);
}

export async function getPopularQuestions() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("question_feed").select("*").order("views", { ascending: false }).limit(5);
  if (error) throw new Error(error.message);
  return (data as FeedRow[]).map(mapQuestion);
}

export async function getQuestion(id: string) {
  if (!hasSupabaseEnv()) notFound();
  const supabase = await createClient();
  const [{ data: question, error }, { data: answers, error: answerError }] = await Promise.all([
    supabase.from("question_feed").select("*").eq("id", id).maybeSingle(),
    supabase.from("answers").select("*, profiles(username, avatar_url)").eq("question_id", id).order("created_at", { ascending: true }),
  ]);
  if (error || answerError) throw new Error(error?.message ?? answerError?.message);
  if (!question) notFound();
  return { ...mapQuestion(question as FeedRow), answers: answers ?? [] };
}

export async function incrementViews(id: string) {
  if (!hasSupabaseEnv()) return;
  const supabase = await createClient();
  await supabase.rpc("increment_question_views", { question_id: id });
}

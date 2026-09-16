import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function getAnswer(id: string) {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("answers").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

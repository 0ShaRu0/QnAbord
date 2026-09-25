import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.types";
import { getSupabaseEnv } from "../lib/supabase/env";

const { url, anonKey } = getSupabaseEnv();
const supabase = createClient<Database>(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const checks = [
  ["public.question_feed", await supabase.from("question_feed").select("id").limit(1)],
  ["public.search_questions", await supabase.rpc("search_questions", { page_size: 1 })],
] as const;
for (const [name, result] of checks) {
  if (result.error) {
    console.error(`${name}: ${result.error.code} ${result.error.message}`);
    process.exitCode = 1;
  } else {
    console.log(`${name}: public API access OK`);
  }
}
if (process.exitCode)
  console.error(
    "Check the deployment's Supabase project, migration history, grants, and schema cache. See docs/deployment.md.",
  );

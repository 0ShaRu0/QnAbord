export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  const parsed = new URL(url);
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if (
    (!local && parsed.protocol !== "https:") ||
    !["http:", "https:"].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    parsed.pathname !== "/" ||
    parsed.hostname === "your-project.supabase.co" ||
    anonKey === "your-anon-key" ||
    /\s/.test(anonKey)
  ) {
    throw new Error("Supabase 환경변수 형식이 올바르지 않습니다.");
  }
  return { url: parsed.origin, anonKey };
}

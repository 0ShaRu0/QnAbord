"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getSafeRedirect } from "@/lib/utils";

export type AuthState = { error?: string; message?: string };

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) return { error: "Supabase 환경변수를 먼저 설정해주세요." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = getSafeRedirect(formData.get("redirectTo"));
  if (!email || !password) return { error: "이메일과 비밀번호를 입력해주세요." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "이메일 또는 비밀번호를 확인해주세요." };
  redirect(redirectTo);
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!hasSupabaseEnv()) return { error: "Supabase 환경변수를 먼저 설정해주세요." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  if (!email || !password || !username) return { error: "모든 항목을 입력해주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (username.length > 20) return { error: "사용자 이름은 20자 이하로 입력해주세요." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
  if (error) return { error: error.message };
  if (!data.session) return { message: "인증 메일을 보냈습니다. 이메일을 확인해주세요." };
  redirect("/");
}

export async function logout() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { stringField, textLength } from "@/lib/validation/questions";
import { unavailable, validationError } from "@/lib/errors";
import type { ActionState } from "@/types/actions";

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = stringField(formData, "email")?.trim();
  const password = stringField(formData, "password");
  if (!email || !password) return validationError({ email: "이메일과 비밀번호를 입력해주세요." });
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.status && error.status >= 500) return unavailable("auth.login", error);
      return validationError({ password: "이메일·비밀번호와 이메일 인증 여부를 확인해주세요." });
    }
  } catch (error) {
    return unavailable("auth.login", error);
  }
  revalidatePath("/", "layout");
  redirect(getSafeRedirect(formData.get("redirectTo")));
}

export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = stringField(formData, "email")?.trim();
  const password = stringField(formData, "password");
  const username = stringField(formData, "username")?.trim();
  if (!email || !password || !username)
    return validationError({ email: "모든 항목을 입력해주세요." });
  if (password.length < 8)
    return validationError({ password: "비밀번호는 8자 이상이어야 합니다." });
  if (textLength(username) > 20)
    return validationError({ username: "사용자 이름은 20자 이하로 입력해주세요." });
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) return unavailable("auth.signup", error);
    if (!data.session)
      return {
        status: "success",
        message: "이메일 인증 안내를 확인해주세요. 인증 후 로그인할 수 있습니다.",
      };
  } catch (error) {
    return unavailable("auth.signup", error);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout(): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) return unavailable("auth.logout", error);
  } catch (error) {
    return unavailable("auth.logout", error);
  }
  revalidatePath("/", "layout");
  redirect("/");
}

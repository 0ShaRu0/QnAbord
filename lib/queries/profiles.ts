import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { queryFailure, reportError } from "@/lib/errors";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403)
      return null;
    queryFailure("auth.currentUser", error);
  }
  return data.user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return { user: null, profile: null };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) reportError("profiles.current", error);
  return { user, profile: data };
});

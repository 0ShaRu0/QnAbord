import "server-only";
import { createClient } from "@/lib/supabase/server";
import { queryFailure } from "@/lib/errors";

export async function authenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403)
      return null;
    queryFailure("auth.action", error);
  }
  return user ? { supabase, user } : null;
}

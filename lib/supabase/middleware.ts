import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { hasSupabaseEnv, getSupabaseEnv } from "./env";
import { reportError } from "@/lib/errors";

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  let env: ReturnType<typeof getSupabaseEnv>;
  try {
    env = getSupabaseEnv();
  } catch (error) {
    reportError("auth.proxy.configuration", error);
    // Let the page/error boundary render the configuration failure.
    return response;
  }
  const { url, anonKey } = env;
  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    const { error } = await supabase.auth.getClaims();
    if (error && error.name !== "AuthSessionMissingError") reportError("auth.proxy.refresh", error);
  } catch (error) {
    reportError("auth.proxy.refresh", error);
  }
  return response;
}

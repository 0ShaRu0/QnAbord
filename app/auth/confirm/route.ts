import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { reportError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  if (tokenHash && type === "email") {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
      if (!error) {
        const response = NextResponse.redirect(
          new URL(getSafeRedirect(searchParams.get("next")), origin),
        );
        response.headers.set("Cache-Control", "no-store");
        response.headers.set("Referrer-Policy", "no-referrer");
        return response;
      }
      reportError("auth.confirm", error);
    } catch (error) {
      reportError("auth.confirm", error);
    }
  }
  const response = NextResponse.redirect(new URL("/login?confirmation=failed", origin));
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

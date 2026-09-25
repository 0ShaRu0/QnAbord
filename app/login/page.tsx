import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { login } from "@/app/actions/auth";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { firstParam, type RawSearchParams } from "@/lib/validation/filters";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  return (
    <main className="auth-page">
      <AuthForm
        mode="login"
        action={login}
        redirectTo={getSafeRedirect(firstParam(params.redirectTo))}
        confirmationFailed={firstParam(params.confirmation) === "failed"}
      />
    </main>
  );
}

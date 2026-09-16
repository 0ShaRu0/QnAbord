import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { login } from "@/app/actions/auth";
import { getSafeRedirect } from "@/lib/utils";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const { redirectTo } = await searchParams;
  return <main className="auth-page"><AuthForm mode="login" action={login} redirectTo={getSafeRedirect(redirectTo ?? null)} /></main>;
}

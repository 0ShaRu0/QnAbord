import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";
import { signup } from "@/app/actions/auth";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <main className="auth-page">
      <AuthForm mode="signup" action={signup} />
    </main>
  );
}

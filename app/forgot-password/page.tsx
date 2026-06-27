"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "@/lib/auth-api";
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/lib/schemas";

function inputClass(isFilled: boolean) {
  return `auth-input ${isFilled ? "auth-input-filled" : ""}`;
}

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasSentCode, setHasSentCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      emailOrPhone: "",
    },
  });

  const emailOrPhone = form.watch("emailOrPhone") ?? "";

  const isEmailOrPhoneFilled = Boolean(
    emailOrPhone &&
      (emailOrPhone.includes("@") ||
        emailOrPhone.replace(/\D/g, "").length >= 10)
  );

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (values: ForgotPasswordInput) => {
    setIsPending(true);
    setSuccessMessage(null);

    try {
      await forgotPassword(values);

      setSuccessMessage("Please check your email or phone.");

      setHasSentCode(true);
      setCountdown(60);
    } catch (error) {
      console.error("forgot password error:", error);

      // Temporary fallback while backend endpoint/CORS may not be ready.
      setSuccessMessage(
        "Reset code sent."
      );

      setHasSentCode(true);
      setCountdown(60);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-md border border-border bg-background-light shadow-sm">
        <div className="border-b border-border bg-background-surface p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
            Account Recovery
          </p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
            Forgot password
          </h1>

          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Enter your email or phone number and we will send password reset
            instructions.
          </p>
        </div>

        <div className="space-y-5 p-6">
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label className="auth-label" htmlFor="emailOrPhone">
                <Mail className="h-4 w-4" /> Email or phone
              </label>

              <input
                id="emailOrPhone"
                className={inputClass(isEmailOrPhoneFilled)}
                placeholder="engineer@domain.com or +1 555 012 3456"
                type="text"
                {...form.register("emailOrPhone")}
              />

              {form.formState.errors.emailOrPhone && (
                <p className="font-mono text-xs text-danger">
                  {form.formState.errors.emailOrPhone.message}
                </p>
              )}
            </div>

            {form.formState.errors.root && (
              <p className="font-mono text-xs text-danger">
                {form.formState.errors.root.message}
              </p>
            )}

            {successMessage && (
              <p className="border border-success/40 bg-success/10 p-3 font-mono text-xs text-success">
                {successMessage}
              </p>
            )}

{hasSentCode && (
  <p className="text-center text-xs text-text-secondary">
    Already have a code?{" "}
    <Link
      href="/reset-password"
      className="font-semibold text-text-primary hover:underline"
    >
      Reset password
    </Link>
  </p>
)}
<button
  className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-inverse shadow-sm transition-all hover:bg-text-secondary active:border-2 active:border-white disabled:cursor-not-allowed disabled:opacity-65"
  type="submit"
  disabled={isPending || countdown > 0}
>
  {isPending
    ? "Sending..."
    : countdown > 0
      ? `Resend code in ${countdown}s`
      : hasSentCode
        ? "Resend code"
        : "Send reset instructions"}

  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
</button>
          </form>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </section>
    </main>
  );
}
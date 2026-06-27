"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginUser } from "@/lib/auth-api";
import { LoginInput, loginSchema } from "@/lib/schemas";
import { OAuthButtons } from "./oauth-buttons";
import { OtpModal } from "./otp-modal";

type LoginResult = Awaited<ReturnType<typeof loginUser>>;


function inputClass(isFilled: boolean) {
  return `auth-input ${isFilled ? "auth-input-filled" : ""}`;
}

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<LoginResult | null>(null);
  const [otpOpen, setOtpOpen] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
    },
  });

  const emailOrPhone = form.watch("emailOrPhone");
  const password = form.watch("password");

  const isEmailOrPhoneFilled = Boolean(
    emailOrPhone &&
      (emailOrPhone.includes("@") || 
      emailOrPhone.replace(/\D/g, "").length >= 10)
  );
  const isPasswordFilled = Boolean(password && password.length >= 8);

const onSubmit = async (values: LoginInput) => {
  setIsPending(true);
  setResult(null);

  try {
    const data = await loginUser(values);
    setResult(data);
  } catch (error) {
    console.error("login error:", error);
  } finally {
    setIsPending(false);

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  }
};


  if (otpOpen) {
    return <OtpModal open={otpOpen} onClose={() => setOtpOpen(false)} />;
  }

  return (
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label className="auth-label" htmlFor="password">
              <KeyRound className="h-4 w-4" /> Password
            </label>

            <Link href="/forgot-password"
              className="text-xs font-mono uppercase tracking-[0.12em] text-text-tertiary hover:text-text-primary hover:underline"
            >
              forget password?
            </Link>
          </div>

          <input
            id="password"
            className={inputClass(isPasswordFilled)}
            placeholder="••••••••"
            type="password"
            {...form.register("password")}
          />

          {form.formState.errors.password && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-inverse shadow-sm transition-all hover:bg-text-secondary active:border-2 active:border-white disabled:cursor-not-allowed disabled:opacity-65"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "logging..." : "login"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
        <button
  type="button"
  onClick={() => setOtpOpen(true)}
  className="flex w-full items-center justify-center gap-2 border border-border bg-background-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary transition-colors hover:bg-background-elevated hover:text-text-primary"
>
  <KeyRound className="h-4 w-4" />
  Login with one-time code
</button>
      </form>

      {/* <OtpModal open={otpOpen} onClose={() => setOtpOpen(false)} /> */}

  {result && (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="border border-success/40 bg-success/10 p-3 font-mono text-xs text-success"
  >
    Login successful. Redirecting...
  </motion.div>
)}

      <div className="flex items-center">
        <div className="h-px flex-1 bg-border" />

        <span className="mx-4 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
          OR OAUTH
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>

      <OAuthButtons />

      <footer className="-mx-6 -mb-6 border-t border-border bg-background-surface p-4 text-center text-xs text-text-secondary">
        Need access?{" "}
        <Link
          href="/signup"
          className="font-bold text-text-primary hover:underline"
        >
          create account
        </Link>
      </footer>
    </div>
  );
}
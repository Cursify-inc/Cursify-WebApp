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

type LoginResult = Awaited<ReturnType<typeof loginUser>>;

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<LoginResult | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values: LoginInput) => {
    setIsPending(true);
    setResult(null);

    try {
      const data = await loginUser(values);
      setResult(data);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label className="auth-label" htmlFor="email">
            <Mail className="h-4 w-4" /> Email Address
          </label>
          <input
            id="email"
            className="auth-input"
            placeholder="engineer@domain.com"
            type="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <label className="auth-label" htmlFor="password">
              <KeyRound className="h-4 w-4" /> Security Token
            </label>
            <button
              className="text-xs font-semibold uppercase tracking-[0.12em] text-surface-tint hover:text-primary hover:underline"
              type="button"
            >
              Reset Token?
            </button>
          </div>
          <input
            id="password"
            className="auth-input"
            placeholder="••••••••••••"
            type="password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <button className="auth-button-primary group" type="submit" disabled={isPending}>
          {isPending ? "Initializing..." : "Initialize Session"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-success/40 bg-success/10 p-3 font-mono text-xs text-success"
        >
          {result.status} · {result.email}
        </motion.div>
      )}

      <div className="flex items-center py-1">
        <div className="h-px flex-1 bg-outline-variant" />
        <span className="mx-4 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
          OR OAUTH
        </span>
        <div className="h-px flex-1 bg-outline-variant" />
      </div>

      <OAuthButtons />

      <footer className="-mx-6 -mb-6 border-t border-outline-variant bg-surface-container-low p-4 text-center text-xs text-on-surface-variant">
        New to Cursify?{" "}
        <Link href="/signup" className="font-bold text-primary hover:underline">
          Initialize Account
        </Link>
      </footer>
    </div>
  );
}
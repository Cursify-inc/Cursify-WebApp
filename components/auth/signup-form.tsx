"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signupUser } from "@/lib/auth-api";
import { SignupInput, signupSchema } from "@/lib/schemas";
import { OAuthButtons } from "./oauth-buttons";

type SignupResult = Awaited<ReturnType<typeof signupUser>>;

function getPasswordStrength(password: string) {
  if (!password) {
    return null;
  }

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasMinLength && hasLetter && hasNumber && hasSymbol) {
    return {
      label: "Strong password",
      width: "100%",
      className: "bg-success",
      textClassName: "text-success",
    };
  }

  if (password.length >= 6 && (hasLetter || hasNumber)) {
    return {
      label: "Medium password",
      width: "66%",
      className: "bg-yellow-500",
      textClassName: "text-yellow-500",
    };
  }

  return {
    label: "Weak password",
    width: "33%",
    className: "bg-danger",
    textClassName: "text-danger",
  };
}

export function SignupForm() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<SignupResult | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const password = form.watch("password");
  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (values: SignupInput) => {
    setIsPending(true);
    setResult(null);

    try {
      const data = await signupUser(values);
      setResult(data);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-5 p-6">
      <form className="space-y-3.5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label className="auth-label" htmlFor="name">
            <UserRound className="h-4 w-4" /> Operator Name
          </label>

          <input
            id="name"
            className="auth-input"
            placeholder="Ada Lovelace"
            {...form.register("name")}
          />

          {form.formState.errors.name && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

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

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="auth-label" htmlFor="password">
              <KeyRound className="h-4 w-4" /> Password
            </label>

            <input
              id="password"
              className="auth-input"
              placeholder="••••••••"
              type="password"
              {...form.register("password")}
            />

            {passwordStrength && (
              <div className="space-y-1.5">
                <div className="h-1.5 w-full overflow-hidden bg-outline-variant">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.className}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>

                <p
                  className={`font-mono text-[10px] uppercase tracking-[0.14em] ${passwordStrength.textClassName}`}
                >
                  {passwordStrength.label}
                </p>
              </div>
            )}

            {form.formState.errors.password && (
              <p className="font-mono text-xs text-danger">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="auth-label" htmlFor="confirmPassword">
              <KeyRound className="h-4 w-4" /> Confirm
            </label>

            <input
              id="confirmPassword"
              className="auth-input"
              placeholder="••••••••"
              type="password"
              {...form.register("confirmPassword")}
            />

            {form.formState.errors.confirmPassword && (
              <p className="font-mono text-xs text-danger">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <label className="flex items-start gap-3 border border-outline-variant bg-surface-container-low p-3 text-xs text-on-surface-variant">
          <input
            className="mt-0.5 h-4 w-4 rounded-none accent-primary-container"
            type="checkbox"
            {...form.register("terms")}
          />

          <span>
            I accept the Cursify workspace protocol and deployment rules.
          </span>
        </label>

        {form.formState.errors.terms && (
          <p className="font-mono text-xs text-danger">
            {form.formState.errors.terms.message}
          </p>
        )}

        <button
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-inverse shadow-sm transition-all hover:bg-text-secondary active:border-2 active:border-white disabled:cursor-not-allowed disabled:opacity-65"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Provisioning..." : "Initialize Account"}
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

      <div className="flex items-center">
        <div className="h-px flex-1 bg-outline-variant" />

        <span className="mx-4 font-mono text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
          OR OAUTH
        </span>

        <div className="h-px flex-1 bg-outline-variant" />
      </div>

      <OAuthButtons />

      <footer className="-mx-6 -mb-6 border-t border-outline-variant bg-surface-container-low p-4 text-center text-xs text-on-surface-variant">
        Already provisioned?{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          Initialize Session
        </Link>
      </footer>
    </div>
  );
}
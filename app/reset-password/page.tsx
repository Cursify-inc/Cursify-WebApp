"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { resetPassword } from "@/lib/auth-api";
import {
  ResetPasswordInput,
  resetPasswordSchema,
} from "@/lib/schemas";

function inputClass(isFilled: boolean) {
  return `auth-input ${isFilled ? "auth-input-filled" : ""}`;
}

export default function ResetPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorShake, setErrorShake] = useState(false);

  const [codeDigits, setCodeDigits] = useState(["", "", "", "", ""]);

  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password") ?? "";
  const confirmPassword = form.watch("confirmPassword") ?? "";

  const isPasswordFilled = password.length >= 8;
  const isConfirmValid =
    Boolean(confirmPassword) && confirmPassword === password;

  // sync OTP → form
  useEffect(() => {
    const token = codeDigits.join("");

    if (token !== form.getValues("token")) {
      form.setValue("token", token, { shouldValidate: true });
    }

    // auto move
    const isComplete = codeDigits.every((d) => d !== "");
    if (isComplete) {
      passwordRef.current?.focus();
    }
  }, [codeDigits]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);

    const next = [...codeDigits];
    next[i] = digit;
    setCodeDigits(next);

    if (digit && i < 4) {
      refs.current[i + 1]?.focus();
    }

    if (digit && i === 4) {
      passwordRef.current?.focus();
    }
  };

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codeDigits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const triggerError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 400);
  };

  const onSubmit = async (values: ResetPasswordInput) => {
    setIsPending(true);
    setSuccessMessage(null);

    try {
      await resetPassword(values);

      setSuccessMessage("Password reset successful.");

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);
    } catch (error) {
      triggerError();

      form.setError("root", {
        message:
          error instanceof Error ? error.message : "Reset failed",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">

      <motion.section
        animate={errorShake ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md border border-border bg-background-light p-6"
      >

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase text-text-tertiary font-mono">
            Account Recovery
          </p>
          <h1 className="text-xl font-semibold">Reset password</h1>
        </div>

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>

          {/* OTP */}
          <div className="space-y-2">
            <label className="auth-label flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Verification Code
            </label>

            <div className="grid grid-cols-5 gap-2">
              {codeDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  className="auth-input h-12 text-center text-lg font-semibold"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                />
              ))}
            </div>

            {form.formState.errors.token && (
              <p className="text-xs text-danger font-mono">
                {form.formState.errors.token.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="auth-label">New password</label>
            <input
              ref={passwordRef}
              className={inputClass(isPasswordFilled)}
              type="password"
              placeholder="••••••••"
              {...form.register("password")}
            />

            {form.formState.errors.password && (
              <p className="text-xs text-danger font-mono">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* CONFIRM */}
          <div>
            <label className="auth-label">Confirm password</label>
            <input
              className={inputClass(isConfirmValid)}
              type="password"
              placeholder="••••••••"
              {...form.register("confirmPassword")}
            />

            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-danger font-mono">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* ROOT ERROR */}
          {form.formState.errors.root && (
            <p className="text-xs text-danger font-mono">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <p className="text-xs text-success font-mono">
              {successMessage}
            </p>
          )}

          {/* SUBMIT */}
          <button
            disabled={isPending}
            className="group flex w-full items-center justify-center gap-2 border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase text-white disabled:opacity-60"
          >
            {isPending ? "Resetting..." : "Reset password"}
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>

        {/* BACK */}
        <Link
          href="/login"
          className="mt-4 flex items-center justify-center gap-2 text-xs text-text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

      </motion.section>
    </main>
  );
}
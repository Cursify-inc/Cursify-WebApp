"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, KeyRound, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  sendSignupVerification,
  signupUser,
  verifySignupCode,
} from "@/lib/auth-api";
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
      className: "bg-warning",
      textClassName: "text-warning",
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
  const [step, setStep] = useState<"details" | "verify">("details");
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<SignupResult | null>(null);
  const [signupValues, setSignupValues] = useState<SignupInput | null>(null);
  const [expectedCode, setExpectedCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
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
    setVerifyError(null);

    try {
      const data = await sendSignupVerification(values);
      setSignupValues(values);
      setExpectedCode(data.code);
      setVerificationCode("");
      setStep("verify");
    } finally {
      setIsPending(false);
    }
  };

  const onVerify = async () => {
    if (!signupValues) return;

    setIsPending(true);
    setVerifyError(null);
    setResult(null);

    try {
      await verifySignupCode(verificationCode, expectedCode);
      const data = await signupUser(signupValues);
      setResult(data);
    } catch (error) {
      setVerifyError(
        error instanceof Error ? error.message : "Verification failed"
      );
    } finally {
      setIsPending(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
            Verification Required
          </p>

          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            Enter your verification code
          </h2>

          <p className="text-sm leading-6 text-text-secondary">
            We sent a verification code to{" "}
            <span className="font-semibold text-text-primary">
              {signupValues?.email}
            </span>
            {signupValues?.phone ? (
              <>
                {" "}
                and{" "}
                <span className="font-semibold text-text-primary">
                  {signupValues.phone}
                </span>
              </>
            ) : null}
            .
          </p>
        </div>

        <div className="border border-info/40 bg-info-light p-3 font-mono text-xs text-info">
          Mock verification code: <strong>{expectedCode}</strong>
        </div>

        <div className="space-y-1.5">
          <label className="auth-label" htmlFor="verificationCode">
            <KeyRound className="h-4 w-4" /> Verification Code
          </label>

          <input
            id="verificationCode"
            className="auth-input"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
        </div>

        {verifyError && (
          <p className="font-mono text-xs text-danger">{verifyError}</p>
        )}

        <button
          className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-inverse shadow-sm transition-all hover:bg-text-secondary active:border-2 active:border-white disabled:cursor-not-allowed disabled:opacity-65"
          type="button"
          disabled={isPending}
          onClick={onVerify}
        >
          {isPending ? "Verifying..." : "Verify Account"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          className="flex w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary transition-colors hover:text-text-primary"
          type="button"
          onClick={() => {
            setStep("details");
            setVerifyError(null);
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Edit signup details
        </button>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-success/40 bg-success/10 p-3 font-mono text-xs text-success"
          >
            {result.status} · {result.email}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      <form className="space-y-3.5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label className="auth-label" htmlFor="name">
            <UserRound className="h-4 w-4" /> your name
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

        <div className="space-y-1.5">
          <label className="auth-label" htmlFor="phone">
            <Phone className="h-4 w-4" /> Phone Number
          </label>

          <input
            id="phone"
            className="auth-input"
            placeholder="+1 555 012 3456"
            type="tel"
            {...form.register("phone")}
          />

          {form.formState.errors.phone && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.phone.message}
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
                <div className="h-1.5 w-full overflow-hidden bg-background-elevated">
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

        <label className="flex items-start gap-3 border border-border bg-background-surface p-3 text-xs text-text-secondary">
          <input
            className="mt-0.5 h-4 w-4 rounded-none accent-text-primary"
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
          {isPending ? "Provisioning..." : "Create Account"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      <div className="flex items-center">
        <div className="h-px flex-1 bg-border" />

        <span className="mx-4 font-mono text-[10px] uppercase tracking-[0.16em] text-text-tertiary">
          OR OAUTH
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>

      <OAuthButtons />

      <footer className="-mx-6 -mb-6 border-t border-border bg-background-surface p-4 text-center text-xs text-text-secondary">
        Already provisioned?{" "}
        <Link
          href="/login"
          className="font-bold text-text-primary hover:underline"
        >
          login
        </Link>
      </footer>
    </div>
  );
}
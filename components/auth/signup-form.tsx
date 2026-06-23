"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  Minus,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
  // sendSignupVerification,
  signupUser,
  // verifySignupCode,
} from "@/lib/auth-api";
import { SignupInput, signupSchema } from "@/lib/schemas";
import { OAuthButtons } from "./oauth-buttons";

type SignupResult = Awaited<ReturnType<typeof signupUser>>;
type AddableField = "phone" | "linkedin" | "github";

function getPasswordStrength(password: string) {
  if (!password) return null;

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

function FieldCheck({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.4, rotate: -35 }}
      animate={{
        opacity: 1,
        scale: [0.4, 1.25, 1],
        rotate: 0,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-success opacity-90"
      aria-hidden="true"
    >
      <CheckCircle2 className="h-4 w-4" />
    </motion.span>
  );
}

function AnimatedToggleIcon({ open }: { open: boolean }) {
  return (
    <motion.span
      key={open ? "minus" : "plus"}
      initial={{ opacity: 0, scale: 0.4, rotate: open ? -90 : 90 }}
      animate={{
        opacity: 1,
        scale: [0.4, 1.2, 1],
        rotate: 0,
      }}
      transition={{
        duration: 0.28,
        ease: "easeOut",
      }}
      className="flex items-center justify-center"
      aria-hidden="true"
    >
      {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
    </motion.span>
  );
}

function AnimatedPlusIcon() {
  return (
    <motion.span
      whileHover={{ rotate: 90, scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      className="text-text-tertiary"
      aria-hidden="true"
    >
      <Plus className="h-4 w-4" />
    </motion.span>
  );
}

function AnimatedMinusIcon() {
  return (
    <motion.span
      whileHover={{ rotate: 90, scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      aria-hidden="true"
    >
      <Minus className="h-3.5 w-3.5" />
    </motion.span>
  );
}

function hasValidEmail(value: string | undefined) {
  return Boolean(value && value.includes("@") && value.includes("."));
}

function hasValidPhone(value: string | undefined) {
  return Boolean(value && value.replace(/\D/g, "").length >= 10);
}

function inputClass(isFilled: boolean) {
  return `auth-input pr-10 ${isFilled ? "auth-input-filled" : ""}`;
}

export function SignupForm() {
  const [step, setStep] = useState<"details" | "verify">("details");
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [addableFields, setAddableFields] = useState<
    Record<AddableField, boolean>
  >({
    phone: false,
    linkedin: false,
    github: false,
  });

  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<SignupResult | null>(null);
  const [signupValues, setSignupValues] = useState<SignupInput | null>(null);
  const [expectedCode, setExpectedCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const firstName = form.watch("firstName");
  const lastName = form.watch("lastName");
  const username = form.watch("username");
  const email = form.watch("email");
  const phone = form.watch("phone");
  const linkedin = form.watch("linkedin");
  const github = form.watch("github");
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const terms = form.watch("terms");

  const passwordStrength = getPasswordStrength(password);
const isFirstNameValid = firstName.trim().length >= 2;
const isLastNameValid = lastName.trim().length >= 2;  const isUsernameValid = username.length >= 5;
  const isEmailValid = hasValidEmail(email);
  const isPhoneValid = hasValidPhone(phone);
  const isLinkedInValid =
    Boolean(linkedin) &&
    linkedin.startsWith("https://") &&
    linkedin.includes("linkedin.com");
  const isGitHubValid =
    Boolean(github) &&
    github.startsWith("https://") &&
    github.includes("github.com");
  const isConfirmValid =
    Boolean(confirmPassword) && confirmPassword === password;

  const hasAddedFields =
    addableFields.phone || addableFields.linkedin || addableFields.github;

  const addField = (field: AddableField) => {
    setAddableFields((current) => ({
      ...current,
      [field]: true,
    }));

    setShowFieldPicker(false);
  };

  const removeField = (field: AddableField) => {
    setAddableFields((current) => ({
      ...current,
      [field]: false,
    }));

    form.setValue(field, "");
  };

const onSubmit = async (values: SignupInput) => {
  console.log("submit values:", values);

  setIsPending(true);
  setResult(null);
  setVerifyError(null);

  // First move the UI to verification step
  setSignupValues(values);
  setExpectedCode("1234");
  setVerificationCode("");
  setStep("verify");

  try {
    const data = await signupUser(values);
    console.log("signup response:", data);
  } catch (error) {
    console.error("signup error:", error);
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
    if (verificationCode !== expectedCode) {
      throw new Error("Invalid verification code");
    }

    window.location.href = "/dashboard";
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
              {signupValues?.email || signupValues?.phone}
            </span>
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
            {result.message} · {result.email || result.phone_number}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6">
      <form className="space-y-3.5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-3 md:grid-cols-2">
  <div className="space-y-1.5">
    <label className="auth-label" htmlFor="firstName">
      <UserRound className="h-4 w-4" /> First name
    </label>

    <div className="relative">
      <input
        id="firstName"
        className={inputClass(isFirstNameValid)}
        placeholder="Ada"
        {...form.register("firstName")}
      />

      <FieldCheck active={isFirstNameValid} />
    </div>

    {form.formState.errors.firstName && (
      <p className="font-mono text-xs text-danger">
        {form.formState.errors.firstName.message}
      </p>
    )}
  </div>

  <div className="space-y-1.5">
    <label className="auth-label" htmlFor="lastName">
      <UserRound className="h-4 w-4" /> Last name
    </label>

    <div className="relative">
      <input
        id="lastName"
        className={inputClass(isLastNameValid)}
        placeholder="Lovelace"
        {...form.register("lastName")}
      />

      <FieldCheck active={isLastNameValid} />
    </div>

    {form.formState.errors.lastName && (
      <p className="font-mono text-xs text-danger">
        {form.formState.errors.lastName.message}
      </p>
    )}
  </div>
</div>
        <div className="space-y-1.5">
          <label className="auth-label" htmlFor="username">
            <UserRound className="h-4 w-4" /> username
          </label>

          <div className="relative">
            <input
              id="username"
              className={inputClass(isUsernameValid)}
              placeholder="Ada_2026"
              {...form.register("username")}
            />

            <FieldCheck active={isUsernameValid} />
          </div>

          {form.formState.errors.username && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label className="auth-label" htmlFor="email">
              <Mail className="h-4 w-4" /> Email Address
            </label>

            <button
              className="flex h-7 w-7 items-center justify-center border border-border bg-background-surface text-text-secondary transition-colors hover:bg-background-elevated hover:text-text-primary"
              type="button"
              aria-label="Add extra signup field"
              onClick={() => setShowFieldPicker((current) => !current)}
            >
              <AnimatedToggleIcon open={showFieldPicker} />
            </button>
          </div>

          <div className="relative">
            <input
              id="email"
              className={inputClass(isEmailValid)}
              placeholder="engineer@domain.com"
              type="email"
              {...form.register("email")}
            />

            <FieldCheck active={isEmailValid} />
          </div>

          {form.formState.errors.email && (
            <p className="font-mono text-xs text-danger">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {showFieldPicker && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-2 border border-border bg-background-surface p-3"
            >
              {!addableFields.phone && (
                <button
                  className="flex items-center justify-between border border-border bg-background-surface p-3 text-left text-xs font-semibold text-text-secondary transition-colors hover:bg-background-elevated hover:text-text-primary"
                  type="button"
                  onClick={() => addField("phone")}
                >
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </span>

                  <AnimatedPlusIcon />
                </button>
              )}

              {!addableFields.linkedin && (
                <button
                  className="flex items-center justify-between border border-border bg-background-surface p-3 text-left text-xs font-semibold text-text-secondary transition-colors hover:bg-background-elevated hover:text-text-primary"
                  type="button"
                  onClick={() => addField("linkedin")}
                >
                  <span className="flex items-center gap-2">
                    <FaLinkedin className="h-4 w-4" />
                    LinkedIn
                  </span>

                  <AnimatedPlusIcon />
                </button>
              )}

              {!addableFields.github && (
                <button
                  className="flex items-center justify-between border border-border bg-background-surface p-3 text-left text-xs font-semibold text-text-secondary transition-colors hover:bg-background-elevated hover:text-text-primary"
                  type="button"
                  onClick={() => addField("github")}
                >
                  <span className="flex items-center gap-2">
                    <FaGithub className="h-4 w-4" />
                    GitHub
                  </span>

                  <AnimatedPlusIcon />
                </button>
              )}

              {addableFields.phone &&
                addableFields.linkedin &&
                addableFields.github && (
                  <p className="p-2 text-xs text-text-tertiary">
                    All extra fields have been added.
                  </p>
                )}
            </motion.div>
          )}

          {hasAddedFields && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 border border-border bg-background-surface p-3"
            >
              {addableFields.phone && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="auth-label" htmlFor="phone">
                      <Phone className="h-4 w-4" /> Phone Number
                    </label>

                    <button
                      className="flex h-6 w-6 items-center justify-center border border-border bg-background-surface text-text-tertiary transition-colors hover:border-danger hover:text-danger"
                      type="button"
                      aria-label="Remove phone number field"
                      onClick={() => removeField("phone")}
                    >
                      <AnimatedMinusIcon />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="phone"
                      className={inputClass(isPhoneValid)}
                      placeholder="+1 555 012 3456"
                      type="tel"
                      {...form.register("phone")}
                    />

                    <FieldCheck active={isPhoneValid} />
                  </div>

                  {form.formState.errors.phone && (
                    <p className="font-mono text-xs text-danger">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              )}

              {addableFields.linkedin && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="auth-label" htmlFor="linkedin">
                      <FaLinkedin className="h-4 w-4" /> LinkedIn
                    </label>

                    <button
                      className="flex h-6 w-6 items-center justify-center border border-border bg-background-surface text-text-tertiary transition-colors hover:border-danger hover:text-danger"
                      type="button"
                      aria-label="Remove LinkedIn field"
                      onClick={() => removeField("linkedin")}
                    >
                      <AnimatedMinusIcon />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="linkedin"
                      className={inputClass(isLinkedInValid)}
                      placeholder="https://linkedin.com/in/username"
                      type="url"
                      {...form.register("linkedin")}
                    />

                    <FieldCheck active={isLinkedInValid} />
                  </div>

                  {form.formState.errors.linkedin && (
                    <p className="font-mono text-xs text-danger">
                      {form.formState.errors.linkedin.message}
                    </p>
                  )}
                </div>
              )}

              {addableFields.github && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="auth-label" htmlFor="github">
                      <FaGithub className="h-4 w-4" /> GitHub
                    </label>

                    <button
                      className="flex h-6 w-6 items-center justify-center border border-border bg-background-surface text-text-tertiary transition-colors hover:border-danger hover:text-danger"
                      type="button"
                      aria-label="Remove GitHub field"
                      onClick={() => removeField("github")}
                    >
                      <AnimatedMinusIcon />
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="github"
                      className={inputClass(isGitHubValid)}
                      placeholder="https://github.com/username"
                      type="url"
                      {...form.register("github")}
                    />

                    <FieldCheck active={isGitHubValid} />
                  </div>

                  {form.formState.errors.github && (
                    <p className="font-mono text-xs text-danger">
                      {form.formState.errors.github.message}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="auth-label" htmlFor="password">
              <KeyRound className="h-4 w-4" /> Password
            </label>

            <div className="relative">
              <input
                id="password"
                className={inputClass(Boolean(passwordStrength))}
                placeholder="••••••••"
                type="password"
                {...form.register("password")}
              />

              <FieldCheck active={Boolean(passwordStrength)} />
            </div>

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

            <div className="relative">
              <input
                id="confirmPassword"
                className={inputClass(isConfirmValid)}
                placeholder="••••••••"
                type="password"
                {...form.register("confirmPassword")}
              />

              <FieldCheck active={isConfirmValid} />
            </div>

            {form.formState.errors.confirmPassword && (
              <p className="font-mono text-xs text-danger">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 border border-border bg-background-surface p-3 text-xs text-text-secondary">
          <span
            className={`relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-border bg-background-surface ${
              terms ? "auth-input-filled" : ""
            }`}
          >
            <input
              className="peer sr-only"
              type="checkbox"
              {...form.register("terms")}
            />

            {terms && (
              <motion.span
                initial={{ opacity: 0, scale: 0.4, rotate: -35 }}
                animate={{
                  opacity: 1,
                  scale: [0.4, 1.25, 1],
                  rotate: 0,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="text-success"
                aria-hidden="true"
              >
                <CheckCircle2 className="h-4 w-4" />
              </motion.span>
            )}
          </span>

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

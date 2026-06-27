"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOtpLogin } from "./use-otp-login";

type OtpModalProps = {
  open: boolean;
  onClose: () => void;
};

function inputClass(isFilled: boolean) {
  return `auth-input ${isFilled ? "auth-input-filled" : ""}`;
}

function normalizeOtpCharacter(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").slice(-1).toUpperCase();
}

export function OtpModal({ open, onClose }: OtpModalProps) {
  const {
    step,
    identifier,
    setIdentifier,
    codeDigits,
    setCodeDigits,
    isPending,
    error,
    setError,
    successMessage,
    countdown,
    isIdentifierValid,
    isCodeComplete,
    mockCode,
    sendOtp,
    resendOtp,
    verifyOtp,
    resetOtpState,
  } = useOtpLogin();

  const [shake, setShake] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const identifierRef = useRef<HTMLInputElement | null>(null);

  const closeOtp = () => {
    resetOtpState();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      if (step === "request") {
        identifierRef.current?.focus();
      } else {
        inputRefs.current[0]?.focus();
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [open, step]);

  useEffect(() => {
    if (!error) return;

    setShake(true);

    const timer = window.setTimeout(() => {
      setShake(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!open || step !== "verify") return;
    if (!isCodeComplete || isPending) return;

    verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodeComplete]);

  const handleCodeChange = (index: number, value: string) => {
    const character = normalizeOtpCharacter(value);

    const nextDigits = [...codeDigits];
    nextDigits[index] = character;

    setCodeDigits(nextDigits);
    setError(null);

    if (character && index < codeDigits.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < codeDigits.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase()
      .slice(0, codeDigits.length);

    if (!pastedCode) return;

    const nextDigits = Array.from({ length: codeDigits.length }, (_, index) => {
      return pastedCode[index] ?? "";
    });

    setCodeDigits(nextDigits);
    setError(null);

    const nextIndex =
      pastedCode.length >= codeDigits.length
        ? codeDigits.length - 1
        : pastedCode.length;

    inputRefs.current[nextIndex]?.focus();
  };

  const goBackToRequest = () => {
    setCodeDigits(["", "", "", "", ""]);
    setError(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 12 }}
        animate={
          shake
            ? {
                opacity: 1,
                y: 0,
                x: [-8, 8, -6, 6, 0],
              }
            : {
                opacity: 1,
                y: 0,
                x: 0,
              }
        }
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="space-y-5 p-6"
      >
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
            One-time access
          </p>

          <h2 className="text-xl font-semibold tracking-tight text-text-primary">
            Login with one-time code
          </h2>

          <p className="text-sm leading-6 text-text-secondary">
            {step === "request"
              ? "Enter your email or phone to receive a temporary login code."
              : `Enter the code sent to ${identifier}.`}
          </p>
        </div>

        {step === "request" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="auth-label" htmlFor="otpIdentifier">
                <Mail className="h-4 w-4" /> Email or phone
              </label>

              <input
                ref={identifierRef}
                id="otpIdentifier"
                className={inputClass(isIdentifierValid)}
                placeholder="engineer@domain.com or +1 555 012 3456"
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendOtp();
                  }
                }}
              />
            </div>

            {successMessage && (
              <p className="border border-success/40 bg-success/10 p-3 font-mono text-xs text-success">
                {successMessage}
              </p>
            )}

            {error && <p className="font-mono text-xs text-danger">{error}</p>}

            <button
              type="button"
              disabled={isPending || !isIdentifierValid}
              onClick={sendOtp}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-inverse shadow-sm transition-all hover:bg-text-secondary active:border-2 active:border-white disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isPending ? "Sending..." : "Send code"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={closeOtp}
              className="flex w-full items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to password login
            </button>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="auth-label" htmlFor="otp-0">
                <KeyRound className="h-4 w-4" /> Verification code
              </label>

              <div className="grid grid-cols-5 gap-2">
                {codeDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    className="auth-input h-12 p-0 text-center text-base font-semibold uppercase tracking-normal"
                    inputMode="text"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleCodeChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleCodeKeyDown(index, event)}
                    onPaste={handleCodePaste}
                  />
                ))}
              </div>

              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
                Dev code: {mockCode}
              </p>
            </div>

            {successMessage && (
              <p className="border border-success/40 bg-success/10 p-3 font-mono text-xs text-success">
                {successMessage}
              </p>
            )}

            {error && <p className="font-mono text-xs text-danger">{error}</p>}

            <button
              type="button"
              disabled={isPending || !isCodeComplete}
              onClick={verifyOtp}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-text-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-inverse shadow-sm transition-all hover:bg-text-secondary active:border-2 active:border-white disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isPending ? "Verifying..." : "Continue"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBackToRequest}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary transition-colors hover:text-text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                disabled={isPending || countdown > 0}
                onClick={resendOtp}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";

const MOCK_OTP_CODE = "A1B2C";
const OTP_LENGTH = 5;
const RESEND_SECONDS = 60;

type OtpStep = "request" | "verify";

type SendOtpInput = {
  identifier: string;
};

type VerifyOtpInput = {
  identifier: string;
  code: string;
};

async function mockSendOtp(values: SendOtpInput) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  console.log("MOCK OTP SENT TO:", values.identifier);
  console.log("MOCK OTP CODE:", MOCK_OTP_CODE);

  return {
    message: "Code sent.",
  };
}

async function mockVerifyOtp(values: VerifyOtpInput) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (values.code.toUpperCase() !== MOCK_OTP_CODE) {
    throw new Error("Invalid one-time code.");
  }

  console.log("MOCK OTP LOGIN:", values);

  return {
    token: "mock_access_token",
    refresh_token: "mock_refresh_token",
  };
}

function isValidIdentifier(value: string) {
  const cleanValue = value.trim();
  const isEmail = cleanValue.includes("@") && cleanValue.includes(".");
  const isPhone = cleanValue.replace(/\D/g, "").length >= 10;

  return isEmail || isPhone;
}

export function useOtpLogin() {
  const [step, setStep] = useState<OtpStep>("request");
  const [identifier, setIdentifier] = useState("");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", ""]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const code = useMemo(() => codeDigits.join("").toUpperCase(), [codeDigits]);

  const isIdentifierValid = isValidIdentifier(identifier);
  const isCodeComplete =
    codeDigits.length === OTP_LENGTH && codeDigits.every((digit) => digit !== "");

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  const resetOtpState = () => {
    setStep("request");
    setIdentifier("");
    setCodeDigits(["", "", "", "", ""]);
    setIsPending(false);
    setError(null);
    setSuccessMessage(null);
    setCountdown(0);
  };

  const sendOtp = async () => {
    if (!isIdentifierValid) {
      setError("Enter a valid email or phone number.");
      return;
    }

    setIsPending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await mockSendOtp({ identifier });

      setStep("verify");
      setCodeDigits(["", "", "", "", ""]);
      setCountdown(RESEND_SECONDS);
      setSuccessMessage("Code sent. Check your email or phone.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send code.");
    } finally {
      setIsPending(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0 || isPending) return;
    await sendOtp();
  };

  const verifyOtp = async () => {
    if (!isCodeComplete) {
      setError("Enter the full one-time code.");
      return;
    }

    setIsPending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await mockVerifyOtp({
        identifier,
        code,
      });

      localStorage.setItem("access_token", response.token);
      localStorage.setItem("refresh_token", response.refresh_token);

      window.location.href = "/dashboard";
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setIsPending(false);
    }
  };

  return {
    step,
    identifier,
    setIdentifier,
    codeDigits,
    setCodeDigits,
    code,
    isPending,
    error,
    setError,
    successMessage,
    countdown,
    isIdentifierValid,
    isCodeComplete,
    otpLength: OTP_LENGTH,
    mockCode: MOCK_OTP_CODE,
    sendOtp,
    resendOtp,
    verifyOtp,
    resetOtpState,
  };
}
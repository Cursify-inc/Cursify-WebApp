"use client";

import type { LoginInput, SignupInput } from "./schemas";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://staging-api.cursify.com/v1";

type ApiErrorResponse = {
  error?: string;
  errors?: Record<string, string>; // For validation errors
  code?: string;
  details?: string;
};

type SignupResponse = {
  message: string;
  user_id: string;
  email?: string;
  phone_number?: string;
  requires_verification?: boolean;
  requires_choice?: boolean;
  verification_expiry?: string;
};

type LoginResponse = {
  token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    phone_number?: string;
    email_verified_at?: string;
    is_active: boolean;
    provider?: string;
  };
};

type VerifyResponse = LoginResponse;

type MessageResponse = {
  message: string;
};

async function requestApi<TResponse>(
  path: string,
  options: RequestInit
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include", // Include cookies for refresh token
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiErrorResponse | null;

    // Handle validation errors (field-specific)
    if (errorData?.errors) {
      const firstError = Object.values(errorData.errors)[0];
      throw new Error(firstError || "Validation failed");
    }

    throw new Error(
      errorData?.error ||
        errorData?.details ||
        `Request failed with status ${response.status}`
    );
  }

  return data as TResponse;
}

function splitFullName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    first_name: parts[0] || "User",
    last_name: parts.slice(1).join(" ") || "Cursify",
  };
}

function storeAuthToken(token: string, refreshToken?: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  }
}

export async function signupUser(values: SignupInput) {
  await pause(900);

  const { first_name, last_name } = splitFullName(values.name);
  const cleanPhone = values.phone ? values.phone.replace(/\D/g, "") : undefined;

  return requestApi<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      first_name,
      last_name,
      username: values.username,
      password: values.password,
      email: values.email || undefined,
      phone_number: cleanPhone,
      verification_method: values.email ? "email" : "phone",
    }),
  });
}

export async function loginUser(values: LoginInput) {
  await pause(700);

  const response = await requestApi<LoginResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify({
      email_or_phone: values.emailOrPhone,
      password: values.password,
    }),
  });

  storeAuthToken(response.token, response.refresh_token);
  return response;
}

export async function verifyEmail(email: string, code: string) {
  await pause(500);

  const response = await requestApi<VerifyResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });

  storeAuthToken(response.token, response.refresh_token);
  return response;
}

export async function verifyPhone(phoneNumber: string, code: string) {
  await pause(500);

  const cleanPhone = phoneNumber.replace(/\D/g, "");

  const response = await requestApi<VerifyResponse>("/auth/verify-phone", {
    method: "POST",
    body: JSON.stringify({
      phone_number: cleanPhone,
      code,
    }),
  });

  storeAuthToken(response.token, response.refresh_token);
  return response;
}

export async function resendEmailVerification(email: string) {
  await pause(700);

  return requestApi<MessageResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resendPhoneVerification(phoneNumber: string) {
  await pause(700);

  // Clean phone number
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  return requestApi<MessageResponse>("/auth/resend-phone-verification", {
    method: "POST",
    body: JSON.stringify({ phone_number: cleanPhone }),
  });
}

export async function refreshToken() {
  return requestApi<LoginResponse>("/auth/refresh", {
    method: "POST",
  });
}

export async function getCurrentUser(token: string) {
  return requestApi<LoginResponse["user"]>("/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// Legacy function for backwards compatibility
export async function sendSignupVerification(values: SignupInput) {
  await pause(700);

  if (values.email) {
    return resendEmailVerification(values.email);
  } else if (values.phone) {
    return resendPhoneVerification(values.phone);
  }

  throw new Error("No email or phone provided");
}

// Legacy function - now calls the real API
export async function verifySignupCode(
  code: string,
  email?: string,
  phone?: string
) {
  if (email) {
    return verifyEmail(email, code);
  } else if (phone) {
    return verifyPhone(phone, code);
  }

  throw new Error("No email or phone provided for verification");
}

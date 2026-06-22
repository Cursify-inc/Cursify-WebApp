import type { LoginInput, SignupInput } from "./schemas";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/v1";

type ApiErrorResponse = {
  error?: string;
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




async function requestApi<TResponse>(

  path: string,

  options: RequestInit

): Promise<TResponse> {

  const response = await fetch(`${API_BASE_URL}${path}`, {

    ...options,

    headers: {

      "Content-Type": "application/json",

      ...(options.headers || {}),

    },

  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {

    const errorData = data as ApiErrorResponse | null;

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

export async function signupUser(values: SignupInput) {
  await pause(900);

  const { first_name, last_name } = splitFullName(values.name);

  return requestApi<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      first_name,
      last_name,
      username: values.username,
      password: values.password,
      email: values.email || undefined,
      phone_number: values.phone || undefined,
      verification_method: values.email ? "email" : "phone",
    }),
  });
}

export async function loginUser(values: LoginInput) {
  await pause(700);
  return {
    status: "Welcome back",
    email: values.email,
  };
}



export async function sendSignupVerification(values: SignupInput) {
  await pause(700);

  return {
    status: "Verification code sent",
    email: values.email,
    phone: values.phone,
    code: "8492",
  };
}

export async function verifySignupCode(code: string, expectedCode: string) {
  await pause(500);

  if (code !== expectedCode) {
    throw new Error("Invalid verification code");
  }

  return {
    status: "Account verified",
  };
}

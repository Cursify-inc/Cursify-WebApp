import type { LoginInput, SignupInput } from "./schemas";

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginUser(values: LoginInput) {
  await pause(700);
  return {
    status: "Initialized session",
    email: values.email,
  };
}

export async function signupUser(values: SignupInput) {
  await pause(900);
  return {
    status: "Created account",
    email: values.email,
    name: values.name,
    phone: values.phone
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

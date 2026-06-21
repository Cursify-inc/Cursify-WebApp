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
    status: "Initialized account",
    email: values.email,
    name: values.name,
    phone: values.phone
  };
}

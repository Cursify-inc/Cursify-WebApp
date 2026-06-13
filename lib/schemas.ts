import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid engineer email."),
  password: z.string().min(8, "Security token must be at least 8 chars.")
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 chars."),
    email: z.string().email("Enter a valid engineer email."),
    password: z.string().min(8, "Security token must be at least 8 chars."),
    confirmPassword: z.string().min(8, "Confirm the token."),
    terms: z.boolean().refine(Boolean, "Accept the protocol terms.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Security tokens do not match.",
    path: ["confirmPassword"]
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

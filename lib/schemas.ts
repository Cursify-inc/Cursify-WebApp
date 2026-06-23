import { z } from "zod";

export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, "Enter your email or phone number.")
    .refine((value) => {
      const isEmail = value.includes("@") && value.includes(".");
      const isPhone = value.replace(/\D/g, "").length >= 10;

      return isEmail || isPhone;
    }, "Enter a valid email or phone number."),

  password: z.string().min(8, "Security token must be at least 8 chars."),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 chars."),
    username: z.string().min(5, "Name must be at least 5 chars."),

    email: z
      .string()
      .email("Enter a valid engineer email.")
      .optional()
      .or(z.literal("")),

    phone: z.string().optional().or(z.literal("")),

    linkedin: z
      .string()
      .url("Enter a valid LinkedIn URL.")
      .optional()
      .or(z.literal("")),

    github: z
      .string()
      .url("Enter a valid GitHub URL.")
      .optional()
      .or(z.literal("")),

    password: z.string().min(8, "Security token must be at least 8 chars."),

    confirmPassword: z.string().min(8, "Confirm the token."),

    terms: z.boolean().refine(Boolean, "Accept the protocol terms."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Security tokens do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: "Enter either an email address or phone number.",
    path: ["email"],
  })
  .refine((data) => !data.phone || data.phone.replace(/\D/g, "").length >= 10, {
    message: "Phone number must include at least 10 digits.",
    path: ["phone"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

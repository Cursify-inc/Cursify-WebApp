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
firstName: z
  .string()
  .min(2, "First name must be at least 2 chars.")
  .max(100, "First name must be at most 100 chars."),
lastName: z
  .string()
  .min(2, "Last name must be at least 2 chars.")
  .max(100, "Last name must be at most 100 chars."),    username: z.string().min(5, "Name must be at least 5 chars."),
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



const passwordSchema = z

  .string()

  .min(8, "Password must be at least 8 characters.")

  .regex(/[A-Za-z]/, "Must include at least one letter.")

  .regex(/\d/, "Must include at least one number.")

  .regex(/[^A-Za-z0-9]/, "Must include at least one symbol.");

  export const forgotPasswordSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, "Enter your email or phone number.")
    .refine((value) => {
      const isEmail = value.includes("@") && value.includes(".");
      const isPhone = value.replace(/\D/g, "").length >= 10;

      return isEmail || isPhone;
    }, "Enter a valid email or phone number."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),

    password: passwordSchema,

    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

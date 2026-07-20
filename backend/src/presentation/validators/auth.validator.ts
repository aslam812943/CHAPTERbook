import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email"),
  }),
});

export const verifyResetCodeSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email"),
    code: z.string().trim().length(6, "Code must be 6 digits"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    resetToken: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    addressLine: z.string().trim().min(1),
    city: z.string().trim().min(1),
    postalCode: z.string().trim().optional(),
    country: z.string().trim().min(1),
  }),
});

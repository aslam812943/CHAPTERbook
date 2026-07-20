import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  ADMIN_NAME: z.string().default("Site Admin"),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(6),
  WHATSAPP_NUMBER: z.string().min(1, "WHATSAPP_NUMBER is required"),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  GOOGLE_BOOKS_API_KEY: z.string().optional().default(""),
  // Gmail SMTP for password-reset emails - optional at parse time so a
  // missing config doesn't take down the whole server; the mailer itself
  // throws a clear error if someone actually tries to send without it set.
  GMAIL_USER: z.string().optional().default(""),
  GMAIL_APP_PASSWORD: z.string().optional().default(""),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;

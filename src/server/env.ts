import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  BASE_URL: z.string().optional(),
  BASE_URL_OTHER_PORT: z.string().optional(),
  ADMIN_PASSWORD: z.string(),
  JWT_SECRET: z.string(), // Secret for signing JWT tokens
  // Google OAuth for Calendar API (optional for MVP)
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  SERVER_GOOGLE_CREDENTIALS: z.string().optional(),
});

export const env = envSchema.parse(process.env);

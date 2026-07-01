import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["DEV", "TEST", "PROD"]).default("DEV"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string("Database url must needed"),
  API_VERSION: z.string("api version required"),
  RESEND_KEY: z.string("resend api key is required"),
  SYSTEM_DOMAIN: z.string("system mail is required"),
  ACCESS_TOKEN_SECRET: z.string("Access token secret is required"),
  ACCESS_TOKEN_EXPIRY: z.string("access token expire is required"),
});

const validEnv = envSchema.parse(process.env);

export { validEnv };

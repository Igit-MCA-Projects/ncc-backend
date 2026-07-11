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
  CLOUDINARY_CLOUD_NAME: z.string(
    "Cloudinary cloud name is required for store the assets",
  ),
  CLOUDINARY_API_KEY: z.string(
    "cloudinary api key is reqired for strore assets",
  ),
  CLOUDINARY_API_SECRET: z.string(
    "cloudinary api secret is required for the store assets",
  ),
  STUDENT_FRONTEND:z.string("student frontend url needed"),
  ADMIN_FRONTEND:z.string("Admin frontend url needed"),
});

const validEnv = envSchema.parse(process.env);

export { validEnv };

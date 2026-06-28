import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["DEV", "TEST", "PROD"]).default("DEV"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

const validEnv = envSchema.parse(process.env);

export { validEnv };

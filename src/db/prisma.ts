import { validEnv } from "../validator/envValidator.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg(validEnv.DATABASE_URL),
});

export { db };

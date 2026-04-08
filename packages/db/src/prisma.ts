import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __simrsPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__simrsPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"]
  });

if (process.env.NODE_ENV !== "production") globalThis.__simrsPrisma = prisma;


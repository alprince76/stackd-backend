import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/** Append Neon/serverless-friendly params without overriding existing ones. */
function neonFriendlyUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "1");
    }
    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "30");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "30");
    }
    // postgresql: scheme is fine for URL parser in Node when using URL with custom protocol
    return url.toString().replace(/^https?:/, "postgresql:");
  } catch {
    // Fallback for odd URLs: append query fragment carefully
    const extras: string[] = [];
    if (!raw.includes("connection_limit=")) extras.push("connection_limit=1");
    if (!raw.includes("connect_timeout=")) extras.push("connect_timeout=30");
    if (!raw.includes("pool_timeout=")) extras.push("pool_timeout=30");
    if (extras.length === 0) return raw;
    return raw.includes("?") ? `${raw}&${extras.join("&")}` : `${raw}?${extras.join("&")}`;
  }
}

function createPrismaClient() {
  const url = neonFriendlyUrl(process.env.DATABASE_URL);
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(url ? { datasources: { db: { url } } } : {}),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function isTransientDbError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string; name?: string };
  if (e.code === "P1001" || e.code === "P1017" || e.code === "P1008") return true;
  const msg = `${e.message ?? ""} ${e.name ?? ""}`.toLowerCase();
  return (
    msg.includes("kind: closed") ||
    (msg.includes("connection") && msg.includes("closed")) ||
    msg.includes("can't reach database") ||
    msg.includes("server has closed the connection") ||
    msg.includes("connection reset")
  );
}

/**
 * Run a DB operation; on Neon idle disconnect, disconnect + retry once.
 */
export async function withDb<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isTransientDbError(err)) throw err;
    try {
      await prisma.$disconnect();
    } catch {
      /* ignore */
    }
    await new Promise(r => setTimeout(r, 100));
    return await fn();
  }
}

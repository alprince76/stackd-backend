import { prisma } from "@/lib/db";

function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  return local.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
}

export async function uniqueUsername(email: string): Promise<string> {
  const base = usernameFromEmail(email);
  let candidate = base;
  let n = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${base}${n++}`;
  }
  return candidate;
}

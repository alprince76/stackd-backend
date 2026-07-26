import { prisma } from "./db";
import type { NotifType } from "@prisma/client";

/**
 * Fire-and-forget notification creator.
 * Errors are caught silently so a notif failure never breaks the main action.
 */
export async function createNotif(
  userId: string,
  type: NotifType,
  title: string,
  body: string,
  link?: string,
) {
  try {
    await prisma.notification.create({ data: { userId, type, title, body, link } });
  } catch {
    // Non-critical — don't surface notif errors to callers
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma, withDb } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ notifications: [] });

    const notifications = await withDb(() =>
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    );

    return NextResponse.json({ notifications });
  } catch {
    // Soft-fail: bell polling must not 500 the UI on Neon idle disconnects
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.markAll) {
      await withDb(() =>
        prisma.notification.updateMany({
          where: { userId: session.user.id, read: false },
          data: { read: true },
        }),
      );
      return NextResponse.json({ ok: true });
    }

    if (body.id) {
      await withDb(() =>
        prisma.notification.updateMany({
          where: { id: body.id, userId: session.user.id },
          data: { read: true },
        }),
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Missing id or markAll" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Temporary database issue" }, { status: 503 });
  }
}

import { getPendingProducts, getScheduledProducts } from "@/lib/queries/products";
import { prisma } from "@/lib/db";
import { AdminQueueClient } from "./queue-client";

export default async function AdminQueuePage() {
  const [pending, scheduled, recentApproved] = await Promise.all([
    getPendingProducts(),
    getScheduledProducts(),
    prisma.product.findMany({
      where: { status: "approved", publishedAt: { not: null } },
      select: {
        id: true,
        name: true,
        tagline: true,
        thumbnailUrl: true,
        categoryId: true,
        pinnedPosition: true,
        status: true,
        maker: { select: { username: true, name: true } },
      },
      orderBy: [{ pinnedPosition: "asc" }, { publishedAt: "desc" }],
      take: 30,
    }),
  ]);

  const mapItem = (p: (typeof pending)[0]) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    thumbnailUrl: p.thumbnailUrl,
    maker: p.maker,
    categoryId: p.categoryId,
    pinnedPosition: p.pinnedPosition ?? null,
    status: p.status,
  });

  return (
    <AdminQueueClient
      pending={pending.map(mapItem)}
      scheduled={scheduled.map(mapItem)}
      approved={recentApproved.map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        thumbnailUrl: p.thumbnailUrl,
        maker: p.maker,
        categoryId: p.categoryId,
        pinnedPosition: p.pinnedPosition ?? null,
        status: p.status,
      }))}
    />
  );
}

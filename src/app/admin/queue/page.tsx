import { prisma } from "@/lib/db";
import { AdminQueueClient } from "./queue-client";

type MappedProduct = {
  id: string;
  name: string;
  tagline: string;
  thumbnailUrl: string | null;
  maker: { username: string; name: string };
  categoryId: string;
  pinnedPosition: number | null;
  status: string;
  upvotes: number;
  comments: number;
};

export default async function AdminQueuePage() {
  const [pending, recentApproved] = await Promise.all([
    // Pending products
    prisma.product.findMany({
      where: { status: "pending" },
      include: {
        maker: { select: { username: true, name: true } },
        _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Approved products for pin management
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
        _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
      },
      orderBy: [{ pinnedPosition: "asc" }, { publishedAt: "desc" }],
      take: 30,
    }),
  ]);

  const mapItem = (p: (typeof pending)[0]): MappedProduct => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    thumbnailUrl: p.thumbnailUrl,
    maker: p.maker,
    categoryId: p.categoryId,
    pinnedPosition: p.pinnedPosition ?? null,
    status: p.status,
    upvotes: p._count.votes,
    comments: p._count.comments,
  });

  // underReview section is empty until DB migration deploys to Vercel
  const underReview: MappedProduct[] = [];

  return (
    <AdminQueueClient
      pending={pending.map(mapItem)}
      underReview={underReview}
      approved={recentApproved.map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        thumbnailUrl: p.thumbnailUrl,
        maker: p.maker,
        categoryId: p.categoryId,
        pinnedPosition: p.pinnedPosition ?? null,
        status: p.status,
        upvotes: p._count.votes,
        comments: p._count.comments,
      }))}
    />
  );
}

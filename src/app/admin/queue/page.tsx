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

const queueInclude = {
  maker: { select: { username: true, name: true } },
  _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
} as const;

export default async function AdminQueuePage() {
  const [pending, underReviewRows, recentApproved] = await Promise.all([
    prisma.product.findMany({
      where: { status: "pending" },
      include: queueInclude,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "underReview" },
      include: queueInclude,
      orderBy: { updatedAt: "desc" },
    }),
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

  const mapItem = (p: {
    id: string;
    name: string;
    tagline: string;
    thumbnailUrl: string | null;
    categoryId: string;
    pinnedPosition: number | null;
    status: string;
    maker: { username: string; name: string };
    _count: { votes: number; comments: number };
  }): MappedProduct => ({
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

  return (
    <AdminQueueClient
      pending={pending.map(mapItem)}
      underReview={underReviewRows.map(mapItem)}
      approved={recentApproved.map(mapItem)}
    />
  );
}

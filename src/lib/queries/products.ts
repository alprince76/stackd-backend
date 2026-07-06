import { prisma } from "@/lib/db";
import type { ProductStatus } from "@prisma/client";
import type { ProductWithMeta } from "@/lib/types";

export async function mapProduct(
  product: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    thumbnailUrl: string | null;
    screenshotUrls: string[];
    categoryId: string;
    tags: string[];
    launchDate: Date;
    website: string;
    status: ProductStatus;
    scheduledAt: Date | null;
    publishedAt: Date | null;
    maker: { username: string; name: string; avatarUrl: string | null };
    _count: { votes: number; comments: number };
  },
  userId?: string,
  hasUpvoted = false,
): Promise<ProductWithMeta> {
  let voted = hasUpvoted;
  if (userId && !hasUpvoted) {
    const vote = await prisma.vote.findUnique({
      where: { userId_productId: { userId, productId: product.id } },
    });
    voted = !!vote;
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    thumbnailUrl: product.thumbnailUrl,
    screenshotUrls: product.screenshotUrls,
    category: product.categoryId,
    tags: product.tags,
    launchDate: product.launchDate.toISOString().slice(0, 10),
    website: product.website,
    upvotes: product._count.votes,
    comments: product._count.comments,
    hasUpvoted: voted,
    maker: product.maker,
    status: product.status,
    scheduledAt: product.scheduledAt?.toISOString() ?? null,
    publishedAt: product.publishedAt?.toISOString() ?? null,
  };
}

const productInclude = {
  maker: { select: { username: true, name: true, avatarUrl: true } },
  _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
} as const;

export async function getVisibleProducts(tab = "today", userId?: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  let launchFilter: { gte?: Date; lte?: Date; equals?: Date } = {};
  if (tab === "today") launchFilter = { equals: today };
  else if (tab === "yesterday") launchFilter = { equals: yesterday };
  else if (tab === "week") launchFilter = { gte: weekAgo };
  else if (tab === "month") launchFilter = { gte: monthAgo };

  const products = await prisma.product.findMany({
    where: {
      status: "approved",
      publishedAt: { not: null },
      ...(Object.keys(launchFilter).length ? { launchDate: launchFilter } : {}),
    },
    include: productInclude,
    orderBy: { launchDate: "desc" },
  });

  const withVotes = await Promise.all(
    products.map(async p => {
      const mapped = await mapProduct(p, userId);
      return mapped;
    }),
  );

  return withVotes.sort((a, b) => b.upvotes - a.upvotes);
}

export async function getProductBySlug(slug: string, userId?: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (!product) return null;
  return mapProduct(product, userId);
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getProductsByCategory(slug: string, userId?: string) {
  const products = await prisma.product.findMany({
    where: {
      categoryId: slug,
      status: "approved",
      publishedAt: { not: null },
    },
    include: productInclude,
    orderBy: { launchDate: "desc" },
  });
  const mapped = await Promise.all(products.map(p => mapProduct(p, userId)));
  return mapped.sort((a, b) => b.upvotes - a.upvotes);
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    include: {
      roles: true,
      products: {
        where: { status: { in: ["approved", "pending"] } },
        include: productInclude,
      },
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });
}

export async function searchProducts(q: string, userId?: string) {
  const products = await prisma.product.findMany({
    where: {
      status: "approved",
      publishedAt: { not: null },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    include: productInclude,
    take: 50,
  });
  return Promise.all(products.map(p => mapProduct(p, userId)));
}

export async function getComments(productId: string) {
  return prisma.comment.findMany({
    where: { productId, deletedAt: null },
    include: {
      author: { select: { username: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingProducts() {
  return prisma.product.findMany({
    where: { status: "pending" },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getScheduledProducts() {
  return prisma.product.findMany({
    where: { status: "scheduled" },
    include: productInclude,
    orderBy: { scheduledAt: "asc" },
  });
}

export async function getPublishedNewsletters() {
  return prisma.newsletter.findMany({
    where: { status: "published" },
    orderBy: { publishDate: "desc" },
  });
}

export async function getAllNewsletters() {
  return prisma.newsletter.findMany({ orderBy: { publishDate: "desc" } });
}

export async function getDashboardStats() {
  const [products, users, votes, comments, pending] = await Promise.all([
    prisma.product.count({ where: { status: "approved", publishedAt: { not: null } } }),
    prisma.user.count({ where: { username: { not: { startsWith: "voter" } } } }),
    prisma.vote.count(),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { status: "pending" } }),
  ]);
  return { products, users, votes, comments, pending };
}

import { prisma } from "@/lib/db";
import type { ProductStatus } from "@prisma/client";
import type { ProductWithMeta } from "@/lib/types";

function hnScore(upvotes: number, publishedAt: string | null): number {
  if (!publishedAt) return 0;
  const hours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
  return upvotes / Math.pow(hours + 2, 1.5);
}

const productInclude = {
  maker: {
    select: {
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      twitter: true,
      linkedin: true,
      website: true,
      city: true,
    },
  },
  _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
  teamMembers: {
    include: {
      user: {
        select: {
          username: true,
          name: true,
          avatarUrl: true,
          bio: true,
          twitter: true,
          linkedin: true,
          website: true,
          city: true,
        },
      },
    },
  },
} as const;

export async function mapProduct(
  product: {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    thumbnailUrl: string | null;
    screenshotUrls: string[];
    videoUrl?: string | null;
    categoryId: string;
    tags: string[];
    launchDate: Date;
    website: string;
    status: ProductStatus;
    pinnedPosition?: number | null;
    scheduledAt: Date | null;
    publishedAt: Date | null;
    maker: {
      username: string;
      name: string;
      avatarUrl: string | null;
      bio: string;
      twitter: string | null;
      linkedin: string | null;
      website: string | null;
      city: string | null;
    };
    _count: { votes: number; comments: number };
    teamMembers?: Array<{
      userId: string;
      role: "maker" | "hunter";
      user: {
        username: string;
        name: string;
        avatarUrl: string | null;
        bio: string;
        twitter: string | null;
        linkedin: string | null;
        website: string | null;
        city: string | null;
      };
    }>;
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
    videoUrl: product.videoUrl ?? null,
    category: product.categoryId,
    tags: product.tags,
    launchDate: product.launchDate.toISOString().slice(0, 10),
    website: product.website,
    upvotes: product._count.votes,
    comments: product._count.comments,
    hasUpvoted: voted,
    pinnedPosition: product.pinnedPosition ?? null,
    maker: product.maker,
    teamMembers: (product.teamMembers ?? []).map(tm => ({
      userId: tm.userId,
      role: tm.role,
      user: tm.user,
    })),
    status: product.status,
    scheduledAt: product.scheduledAt?.toISOString() ?? null,
    publishedAt: product.publishedAt?.toISOString() ?? null,
  };
}

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
    products.map(async p => mapProduct(p, userId)),
  );

  // Pinned products always come first (sorted by pinnedPosition asc),
  // then the rest sorted by HN score descending.
  const pinned = withVotes
    .filter(p => p.pinnedPosition !== null)
    .sort((a, b) => (a.pinnedPosition ?? 0) - (b.pinnedPosition ?? 0));
  const unpinned = withVotes
    .filter(p => p.pinnedPosition === null)
    .sort((a, b) => hnScore(b.upvotes, b.publishedAt) - hnScore(a.upvotes, a.publishedAt));

  return [...pinned, ...unpinned];
}

export async function getProductBySlug(slug: string, userId?: string) {
  const product = await prisma.product.findUnique({
    where: { slug, status: "approved", publishedAt: { not: null } },
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
  return mapped.sort(
    (a, b) => hnScore(b.upvotes, b.publishedAt) - hnScore(a.upvotes, a.publishedAt),
  );
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
    where: { productId, deletedAt: null, parentId: null },
    include: {
      author: { select: { username: true, name: true, avatarUrl: true } },
      replies: {
        where: { deletedAt: null },
        include: { author: { select: { username: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
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
    prisma.product.count({ where: { status: { in: ["pending", "scheduled"] } } }),
  ]);
  return { products, users, votes, comments, pending };
}

export async function getDashboardExtended() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Week boundaries
  const thisWeekStart = new Date(todayStart);
  thisWeekStart.setDate(thisWeekStart.getDate() - 6);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);

  // 15 days for signups chart
  const fifteenDaysAgo = new Date(todayStart);
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 14);

  const [
    productsThisWeek,
    productsLastWeek,
    usersThisWeek,
    usersLastWeek,
    votesThisWeek,
    votesLastWeek,
    commentsThisWeek,
    commentsLastWeek,
    topProducts,
    recentVotes,
    recentSignups,
  ] = await Promise.all([
    prisma.product.count({ where: { status: "approved", publishedAt: { gte: thisWeekStart } } }),
    prisma.product.count({ where: { status: "approved", publishedAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.user.count({ where: { username: { not: { startsWith: "voter" } }, createdAt: { gte: thisWeekStart } } }),
    prisma.user.count({ where: { username: { not: { startsWith: "voter" } }, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.vote.count({ where: { createdAt: { gte: thisWeekStart } } }),
    prisma.vote.count({ where: { createdAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    prisma.comment.count({ where: { deletedAt: null, createdAt: { gte: thisWeekStart } } }),
    prisma.comment.count({ where: { deletedAt: null, createdAt: { gte: lastWeekStart, lt: lastWeekEnd } } }),
    // Top 5 products by votes
    prisma.product.findMany({
      where: { status: "approved", publishedAt: { not: null } },
      include: {
        _count: { select: { votes: true } },
        maker: { select: { username: true, name: true, avatarUrl: true } },
      },
      orderBy: { votes: { _count: "desc" } },
      take: 5,
    }),
    // Votes per day last 7 days
    prisma.vote.findMany({
      where: { createdAt: { gte: thisWeekStart } },
      select: { createdAt: true },
    }),
    // Signups per day last 15 days
    prisma.user.findMany({
      where: {
        username: { not: { startsWith: "voter" } },
        createdAt: { gte: fifteenDaysAgo },
      },
      select: { createdAt: true },
    }),
  ]);

  // Top makers by approved product count
  const makerCounts = await prisma.user.findMany({
    where: {
      username: { not: { startsWith: "voter" } },
      products: { some: { status: "approved" } },
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      _count: { select: { products: true } },
    },
    orderBy: { products: { _count: "desc" } },
    take: 5,
  });

  // Build daily vote chart data (last 7 days)
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const votesByDay: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(thisWeekStart);
    d.setDate(d.getDate() + i);
    votesByDay[d.toDateString()] = 0;
  }
  for (const v of recentVotes) {
    const key = new Date(v.createdAt.getFullYear(), v.createdAt.getMonth(), v.createdAt.getDate()).toDateString();
    if (key in votesByDay) votesByDay[key] = (votesByDay[key] ?? 0) + 1;
  }
  const votesChart = Object.entries(votesByDay).map(([dateStr, count]) => ({
    day: dayLabels[new Date(dateStr).getDay()],
    votes: count,
  }));

  // Build daily signups chart (last 15 days)
  const signupsByDay: Record<string, number> = {};
  for (let i = 0; i < 15; i++) {
    const d = new Date(fifteenDaysAgo);
    d.setDate(d.getDate() + i);
    signupsByDay[d.toDateString()] = 0;
  }
  for (const u of recentSignups) {
    const key = new Date(u.createdAt.getFullYear(), u.createdAt.getMonth(), u.createdAt.getDate()).toDateString();
    if (key in signupsByDay) signupsByDay[key] = (signupsByDay[key] ?? 0) + 1;
  }
  const signupsChart = Object.values(signupsByDay).map((count, i) => ({ i, count }));

  function trend(current: number, previous: number) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    trends: {
      products: trend(productsThisWeek, productsLastWeek),
      users: trend(usersThisWeek, usersLastWeek),
      votes: trend(votesThisWeek, votesLastWeek),
      comments: trend(commentsThisWeek, commentsLastWeek),
    },
    topProducts: topProducts.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      thumbnailUrl: p.thumbnailUrl,
      votes: p._count.votes,
      maker: p.maker,
    })),
    topMakers: makerCounts.map(u => ({
      username: u.username,
      name: u.name,
      avatarUrl: u.avatarUrl,
      productCount: u._count.products,
    })),
    votesChart,
    signupsChart,
    totalSignupsRecent: recentSignups.length,
    signupsTrend: trend(usersThisWeek, usersLastWeek),
  };
}

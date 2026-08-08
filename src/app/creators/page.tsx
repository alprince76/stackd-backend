import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCategories, getCreators } from "@/lib/queries/products";
import { CreatorsClient } from "./creators-client";

export default async function CreatorsPage() {
  const session = await auth();
  const [creators, categories] = await Promise.all([
    getCreators(),
    getCategories(),
  ]);

  let followingIds: string[] = [];
  if (session?.user?.id) {
    const follows = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
        followingId: { in: creators.map(c => c.id) },
      },
      select: { followingId: true },
    });
    followingIds = follows.map(f => f.followingId);
  }

  const categoryNames = Array.from(
    new Set(creators.map(c => c.category).filter(Boolean)),
  ).sort();

  // Prefer category display names when slug matches
  const catMap = new Map(categories.map(c => [c.slug, c.name]));
  const mapped = creators.map(c => ({
    ...c,
    category: catMap.get(c.category) ?? c.category,
  }));
  const filterLabels = Array.from(
    new Set(mapped.map(c => c.category).filter(c => c && c !== "Other")),
  ).sort();

  return (
    <CreatorsClient
      creators={mapped}
      categories={filterLabels.length ? filterLabels : categoryNames}
      followingIds={followingIds}
    />
  );
}

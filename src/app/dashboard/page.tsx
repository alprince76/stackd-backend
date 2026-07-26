import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MakerDashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const products = await prisma.product.findMany({
    where: { makerId: session.user.id },
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      thumbnailUrl: true,
      status: true,
      _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = products.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    thumbnailUrl: p.thumbnailUrl,
    upvotes: p._count.votes,
    comments: p._count.comments,
    status: p.status,
  }));

  return <MakerDashboardClient username={session.user.username} products={mapped} />;
}

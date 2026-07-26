import { prisma } from "@/lib/db";
import { CrmClient } from "./crm-client";

export default async function AdminCrmPage() {
  const users = await prisma.user.findMany({
    where: { username: { not: { startsWith: "voter" } } },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatarUrl: true,
      bio: true,
      city: true,
      createdAt: true,
      roles: { select: { role: true } },
      _count: {
        select: {
          products: true,
          followers: true,
        },
      },
      products: {
        where: { status: "approved" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: {
          name: true,
          _count: { select: { votes: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = users.map(u => {
    const totalUpvotes = u.products.reduce((sum, p) => sum + (p._count.votes ?? 0), 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      avatarUrl: u.avatarUrl,
      roles: u.roles.map(r => r.role as string),
      city: u.city,
      bio: u.bio,
      joinedAt: u.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      productCount: u._count.products,
      followerCount: u._count.followers,
      totalUpvotes,
      latestProduct: u.products[0]?.name ?? null,
    };
  });

  return <CrmClient users={mapped} />;
}

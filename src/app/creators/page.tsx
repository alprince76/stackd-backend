import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function CreatorsPage() {
  const users = await prisma.user.findMany({
    where: { username: { not: { startsWith: "voter" } }, roles: { some: { role: "maker" } } },
    include: {
      _count: { select: { followers: true, products: true } },
    },
    orderBy: { name: "asc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Creators</h1>
      <p className="mt-2 text-muted-foreground">Makers building the next generation of products in Indonesia & SEA.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {users.map(u => (
          <Link key={u.id} href={`/u/${u.username}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-card">
            <img src={u.avatarUrl ?? ""} alt={u.name} className="h-14 w-14 rounded-full" />
            <div>
              <div className="font-semibold text-navy">{u.name}</div>
              <div className="text-xs text-muted-foreground">@{u.username}</div>
              <div className="mt-1 text-xs text-muted-foreground">{u._count.followers} followers · {u._count.products} products</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

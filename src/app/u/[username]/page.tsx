import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { auth } from "@/lib/auth";
import { getCategories, getUserByUsername, mapProduct } from "@/lib/queries/products";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const user = await getUserByUsername(username);
  if (!user) notFound();

  const categories = await getCategories();
  const products = await Promise.all(
    user.products.map(p => mapProduct(p, session?.user?.id)),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-start gap-4">
        <img src={user.avatarUrl ?? ""} alt={user.name} className="h-20 w-20 rounded-2xl border border-border" />
        <div>
          <h1 className="text-3xl font-bold text-navy">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          <p className="mt-2 text-sm">{user.bio}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {user._count.followers} followers · {user._count.following} following
          </p>
        </div>
      </div>
      <h2 className="mt-10 text-lg font-bold text-navy">Launches</h2>
      <div className="mt-4 space-y-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} categories={categories} />
        ))}
      </div>
      <Link href="/creators" className="mt-8 inline-block text-sm font-semibold text-navy">← All creators</Link>
    </div>
  );
}

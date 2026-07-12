import Link from "next/link";
import { notFound } from "next/navigation";
import { Twitter, Linkedin, Globe, MapPin } from "lucide-react";
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
        <img
          src={user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.name}
          className="h-20 w-20 shrink-0 rounded-2xl border border-border bg-light-gray"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-navy">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {user.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {user.city}
              </span>
            )}
            <span>{user._count.followers} followers · {user._count.following} following</span>
          </div>
          {(user.twitter || user.linkedin || user.website) && (
            <div className="mt-3 flex items-center gap-3">
              {user.twitter && (
                <a
                  href={`https://twitter.com/${user.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                >
                  <Twitter className="h-3.5 w-3.5" />@{user.twitter}
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                >
                  <Linkedin className="h-3.5 w-3.5" />LinkedIn
                </a>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-navy hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <h2 className="mt-10 text-lg font-bold text-navy">Launches</h2>
      <div className="mt-4 space-y-3">
        {products.length > 0 ? (
          products.map(p => (
            <ProductCard key={p.id} product={p} categories={categories} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No launches yet.</p>
        )}
      </div>
      <Link href="/creators" className="mt-8 inline-block text-sm font-semibold text-navy">← All creators</Link>
    </div>
  );
}

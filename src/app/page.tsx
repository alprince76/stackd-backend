export const revalidate = 300;

import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { auth } from "@/lib/auth";
import { getCategories, getVisibleProducts } from "@/lib/queries/products";
import { HomeTabs } from "@/components/home-tabs";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "today" } = await searchParams;
  const session = await auth();
  const [products, categories] = await Promise.all([
    getVisibleProducts(tab, session?.user?.id),
    getCategories(),
  ]);

  const topMakers = Array.from(
    new Map(products.map(p => [p.maker.username, p.maker])).values(),
  ).slice(0, 5);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-light-gray/40">
        <div className="absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-navy">
            <Sparkles className="h-3.5 w-3.5 text-coral" />
            New launches every day from Indonesia
          </div>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-navy sm:text-6xl">
            Spotlighting <span className="text-gradient-brand">what&apos;s next.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            The daily leaderboard for digital products built in Indonesia & Southeast Asia.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <HomeTabs current={tab} />
            <div className="mt-6 space-y-3">
              {products.length === 0 && (
                <p className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                  No launches for this period yet.
                </p>
              )}
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i + 1} categories={categories} />
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h2>
              <ul className="mt-3 space-y-1">
                {categories.map(c => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-navy hover:bg-light-gray">
                      <span>{c.emoji}</span> {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy">
                <TrendingUp className="h-4 w-4 text-coral" /> Top makers
              </div>
              <ul className="mt-3 space-y-2">
                {topMakers.map(m => (
                  <li key={m.username}>
                    <Link href={`/u/${m.username}`} className="flex items-center gap-2 text-sm hover:text-coral">
                      <img src={m.avatarUrl ?? ""} alt="" className="h-7 w-7 rounded-full" />
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/newsletter" className="block rounded-2xl bg-gradient-brand p-5 text-white shadow-card">
              <div className="text-sm font-semibold">Stackd Newsletter</div>
              <p className="mt-1 text-sm opacity-90">Weekly digest of the best launches.</p>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

import { ProductCard } from "@/components/product-card";
import { SearchForm } from "@/components/search-form";
import { auth } from "@/lib/auth";
import { getCategories, searchProducts } from "@/lib/queries/products";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const session = await auth();
  const categories = await getCategories();
  const products = q.trim() ? await searchProducts(q.trim(), session?.user?.id) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Search</h1>
      <SearchForm initialQuery={q} />
      <div className="mt-8 space-y-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} categories={categories} />
        ))}
        {q && products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products found for &quot;{q}&quot;</p>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { auth } from "@/lib/auth";
import { getCategories, getCategory, getProductsByCategory } from "@/lib/queries/products";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const category = await getCategory(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProductsByCategory(slug, session?.user?.id),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="text-4xl">{category.emoji}</div>
      <h1 className="mt-2 text-3xl font-bold text-navy">{category.name}</h1>
      <div className="mt-8 space-y-3">
        {products.map(p => (
          <ProductCard key={p.id} product={p} categories={categories} />
        ))}
        {products.length === 0 && (
          <p className="text-sm text-muted-foreground">No products in this category yet.</p>
        )}
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-navy">← Back to home</Link>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCategories, getComments, getProductBySlug } from "@/lib/queries/products";
import { ProductDetailClient } from "@/components/product-detail-client";
import { formatRelativeTime } from "@/lib/utils";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const product = await getProductBySlug(slug, session?.user?.id);
  if (!product) notFound();

  const [comments, categories] = await Promise.all([
    getComments(product.id),
    getCategories(),
  ]);
  const cat = categories.find(c => c.slug === product.category);

  return (
    <ProductDetailClient
      product={product}
      category={cat}
      comments={comments.map(c => ({
        id: c.id,
        text: c.text,
        createdAt: formatRelativeTime(c.createdAt),
        author: c.author,
        replies: c.replies.map(r => ({
          id: r.id,
          text: r.text,
          createdAt: formatRelativeTime(r.createdAt),
          author: r.author,
        })),
      }))}
    />
  );
}

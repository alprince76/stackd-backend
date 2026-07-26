import Link from "next/link";
import { ArrowBigUp, ExternalLink, Star } from "lucide-react";
import type { ProductWithMeta } from "@/lib/types";

export function FeaturedProductBanner({ product }: { product: ProductWithMeta }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-50 via-white to-coral/5 p-6 shadow-card sm:p-8">
        {/* Featured badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          Featured Product
        </div>

        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr_auto]">
          {/* Thumbnail */}
          <Link href={`/products/${product.slug}`} className="shrink-0">
            <img
              src={product.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${product.slug}`}
              alt={product.name}
              className="h-24 w-24 rounded-2xl border border-border bg-light-gray object-cover sm:h-32 sm:w-32"
            />
          </Link>

          {/* Info */}
          <div className="min-w-0">
            <Link href={`/products/${product.slug}`}>
              <h2 className="text-2xl font-bold text-navy hover:text-coral sm:text-3xl">{product.name}</h2>
            </Link>
            <p className="mt-1 text-base font-medium text-muted-foreground">{product.tagline}</p>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            <div className="mt-3 flex items-center gap-2">
              <Link href={`/u/${product.maker.username}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-navy">
                <img
                  src={product.maker.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.maker.username}`}
                  alt=""
                  className="h-5 w-5 rounded-full"
                />
                <span>by {product.maker.name}</span>
              </Link>
            </div>
          </div>

          {/* CTA + votes */}
          <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
            <div className="flex items-center gap-1.5 rounded-xl border border-border bg-white px-4 py-2 text-center">
              <ArrowBigUp className="h-5 w-5 text-violet-500" />
              <span className="text-lg font-bold text-navy">{product.upvotes}</span>
            </div>
            <a
              href={product.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
            >
              Try it <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

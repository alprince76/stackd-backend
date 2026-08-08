"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ArrowBigUp, ExternalLink, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductWithMeta } from "@/lib/types";

export function FeaturedSection({ products }: { products: ProductWithMeta[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = products.length;

  const next = useCallback(() => setActive(i => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive(i => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [total, paused, next]);

  if (total === 0) return null;

  const product = products[active];
  const thumb =
    product.thumbnailUrl ??
    `https://api.dicebear.com/7.x/shapes/svg?seed=${product.slug}`;

  return (
    <section className="border-b border-border bg-navy">
      <div
        className="relative mx-auto max-w-7xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Banner */}
        <div
          key={product.id}
          className="relative min-h-[280px] overflow-hidden sm:min-h-[320px]"
          style={{ animation: "bannerFade 0.45s ease" }}
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative flex flex-col justify-end gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-12">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy shadow-sm">
                <Star className="h-3 w-3 fill-navy" />
                Featured
              </span>
              <Link href={`/products/${product.slug}`}>
                <h2 className="mt-3 text-3xl font-bold leading-tight text-white hover:text-coral sm:text-4xl">
                  {product.name}
                </h2>
              </Link>
              <p className="mt-2 text-base text-white/80 sm:text-lg">{product.tagline}</p>
              <p className="mt-2 line-clamp-2 text-sm text-white/60">{product.description}</p>

              <Link
                href={`/u/${product.maker.username}`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
              >
                <img
                  src={
                    product.maker.avatarUrl ??
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.maker.username}`
                  }
                  alt=""
                  className="h-6 w-6 rounded-full border border-white/30"
                />
                by {product.maker.name}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-stretch">
              <div className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <ArrowBigUp className="h-5 w-5 text-amber-300" />
                <span className="text-lg font-bold text-white">{product.upvotes}</span>
              </div>
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Learn More
              </Link>
              <a
                href={product.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Visit Site <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Controls */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous featured"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next featured"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
              {products.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { setActive(i); setPaused(true); }}
                  aria-label={`Featured ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? "h-2 w-6 bg-amber-400"
                      : "h-2 w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bannerFade {
          from { opacity: 0.55; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

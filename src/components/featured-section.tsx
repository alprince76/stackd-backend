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
    const timer = setInterval(next, 2000);
    return () => clearInterval(timer);
  }, [total, paused, next]);

  if (total === 0) return null;

  const product = products[active];

  return (
    <section className="border-b border-border bg-gradient-to-br from-amber-50/80 via-white to-violet-50/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* Section header */}
        <div className="mb-5 flex flex-col items-start gap-1">
          <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Spotlight
          </span>
          <p className="text-sm text-muted-foreground">
            Handpicked by the Stackd team — products worth your attention.
          </p>
        </div>

        {/* Carousel container */}
        <div
          className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-white shadow-card"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Slide */}
          <div
            key={product.id}
            className="flex flex-col md:flex-row"
            style={{ animation: "fadeSlide 0.4s ease" }}
          >
            {/* Thumbnail */}
            <Link
              href={`/products/${product.slug}`}
              className="block shrink-0 overflow-hidden md:w-[45%]"
            >
              <img
                src={
                  product.thumbnailUrl ??
                  `https://api.dicebear.com/7.x/shapes/svg?seed=${product.slug}`
                }
                alt={product.name}
                className="h-52 w-full object-cover transition-transform duration-500 hover:scale-105 md:h-full md:min-h-64"
              />
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                  <Star className="h-3 w-3 fill-white text-white" />
                  Editor&apos;s Pick
                </span>

                <Link href={`/products/${product.slug}`}>
                  <h2 className="mt-3 text-2xl font-bold leading-tight text-navy hover:text-coral sm:text-3xl">
                    {product.name}
                  </h2>
                </Link>
                <p className="mt-1.5 text-base font-medium text-muted-foreground">
                  {product.tagline}
                </p>
                <p className="mt-2.5 line-clamp-3 text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/u/${product.maker.username}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-navy"
                >
                  <img
                    src={
                      product.maker.avatarUrl ??
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.maker.username}`
                    }
                    alt=""
                    className="h-7 w-7 rounded-full border border-border"
                  />
                  <span>
                    by{" "}
                    <span className="font-semibold text-navy">{product.maker.name}</span>
                  </span>
                </Link>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-sm font-bold text-navy">
                    <ArrowBigUp className="h-4 w-4 text-violet-500" />
                    {product.upvotes}
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="rounded-xl border border-navy px-4 py-1.5 text-sm font-semibold text-navy hover:bg-navy hover:text-white transition-colors"
                  >
                    Learn More →
                  </Link>
                  <a
                    href={product.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-coral px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  >
                    Visit Site <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow buttons (only when multiple products) */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-navy hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md border border-border text-navy hover:bg-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); setPaused(true); }}
                aria-label={`Go to slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === active
                    ? "w-6 h-2 bg-amber-500"
                    : "w-2 h-2 bg-amber-200 hover:bg-amber-400"
                }`}
              />
            ))}
            {/* Counter */}
            <span className="ml-2 text-xs text-muted-foreground">
              {active + 1} / {total}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}

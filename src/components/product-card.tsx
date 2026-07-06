"use client";

import Link from "next/link";
import { ArrowBigUp, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleVote } from "@/lib/actions/app";
import type { ProductWithMeta } from "@/lib/types";

export function ProductCard({
  product,
  rank,
  categories,
}: {
  product: ProductWithMeta;
  rank?: number;
  categories: { slug: string; name: string; emoji: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const cat = categories.find(c => c.slug === product.category);

  const handleVote = () => {
    startTransition(async () => {
      const res = await toggleVote(product.id);
      if (res?.error === "Please sign in") {
        router.push("/login");
        return;
      }
      router.refresh();
    });
  };

  return (
    <article className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-card sm:p-5">
      {rank !== undefined && (
        <div className="hidden w-6 shrink-0 pt-3 text-center text-sm font-bold text-muted-foreground sm:block">
          {rank}
        </div>
      )}
      <Link href={`/products/${product.slug}`} className="shrink-0">
        <img
          src={product.thumbnailUrl ?? ""}
          alt={product.name}
          className="h-16 w-16 rounded-xl border border-border bg-light-gray object-cover sm:h-20 sm:w-20"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="truncate text-base font-semibold text-navy sm:text-lg">{product.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{product.tagline}</p>
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link href={`/u/${product.maker.username}`} className="flex items-center gap-1.5 hover:text-navy">
            <img src={product.maker.avatarUrl ?? ""} alt="" className="h-4 w-4 rounded-full" />
            <span>{product.maker.name.split(" ")[0]}</span>
          </Link>
          {cat && (
            <Link href={`/category/${cat.slug}`} className="rounded-md bg-light-gray px-2 py-0.5 font-medium text-navy hover:bg-border">
              {cat.emoji} {cat.name}
            </Link>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> {product.comments}
          </span>
        </div>
      </div>
      <button
        onClick={handleVote}
        disabled={pending}
        className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-all sm:h-20 sm:w-16 ${
          product.hasUpvoted
            ? "border-transparent bg-gradient-brand text-white shadow-card"
            : "border-border bg-white text-navy hover:border-navy"
        }`}
        aria-label="Upvote"
      >
        <ArrowBigUp className={`h-5 w-5 ${product.hasUpvoted ? "fill-white" : ""}`} />
        <span className="mt-0.5 text-sm font-bold">{product.upvotes}</span>
      </button>
    </article>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowBigUp, ExternalLink, MessageCircle, Globe,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toggleVote, addComment } from "@/lib/actions/app";
import type { ProductWithMeta } from "@/lib/types";
import { toast } from "sonner";

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  author: { username: string; name: string; avatarUrl: string | null };
};

export function ProductDetailClient({
  product,
  category,
  comments: initialComments,
}: {
  product: ProductWithMeta;
  category?: { slug: string; name: string; emoji: string };
  comments: Comment[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [shotIdx, setShotIdx] = useState(0);
  const [upvotes, setUpvotes] = useState(product.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(product.hasUpvoted);

  const screenshots = product.screenshotUrls.length ? product.screenshotUrls : [product.thumbnailUrl ?? ""];

  const handleVote = () => {
    startTransition(async () => {
      const res = await toggleVote(product.id);
      if (res?.error) {
        if (res.error === "Please sign in") router.push("/login");
        else toast.error(res.error);
        return;
      }
      if (res.upvotes !== undefined) {
        setUpvotes(res.upvotes);
        setHasUpvoted(res.hasUpvoted ?? false);
      }
      router.refresh();
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await addComment(product.id, text.trim());
      if (res?.error) {
        if (res.error === "Please sign in") router.push("/login");
        else toast.error(res.error);
        return;
      }
      setText("");
      toast.success("Comment posted");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 sm:gap-6">
        <img src={product.thumbnailUrl ?? ""} alt={product.name} className="h-16 w-16 shrink-0 rounded-2xl border border-border bg-light-gray sm:h-24 sm:w-24" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-navy sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{product.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {category && (
              <Link href={`/category/${category.slug}`} className="rounded-md bg-light-gray px-2 py-1 text-xs font-medium text-navy hover:bg-border">
                {category.emoji} {category.name}
              </Link>
            )}
            {product.tags.map(t => (
              <span key={t} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">#{t}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <button
            onClick={handleVote}
            disabled={pending}
            className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2 transition-all sm:px-5 sm:py-3 ${
              hasUpvoted ? "border-transparent bg-gradient-brand text-white" : "border-border bg-white text-navy hover:border-navy"
            }`}
          >
            <ArrowBigUp className={`h-5 w-5 ${hasUpvoted ? "fill-white" : ""}`} />
            <span className="text-sm font-bold">{upvotes}</span>
          </button>
          <a href={product.website} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white sm:px-5 sm:py-3">
            Try it <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <section className="mt-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-light-gray">
          <img src={screenshots[shotIdx]} alt="" className="aspect-[16/9] w-full object-cover" />
          {screenshots.length > 1 && (
            <>
              <button type="button" onClick={() => setShotIdx(i => (i - 1 + screenshots.length) % screenshots.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setShotIdx(i => (i + 1) % screenshots.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </section>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <h2 className="text-xl font-bold text-navy">About {product.name}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{product.description}</p>

          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xl font-bold text-navy">Discussion</h2>
              <span className="rounded-md bg-light-gray px-2 py-0.5 text-xs font-medium text-navy">{initialComments.length}</span>
            </div>
            <form onSubmit={handleComment} className="mb-6 rounded-2xl border border-border bg-card p-3">
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                placeholder="What do you think of this product?"
                className="w-full resize-none rounded-lg border-0 bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground" />
              <div className="flex justify-end">
                <button type="submit" disabled={!text.trim() || pending}
                  className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  Post comment
                </button>
              </div>
            </form>
            <ul className="space-y-4">
              {initialComments.map(c => (
                <li key={c.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
                  <img src={c.author.avatarUrl ?? ""} alt="" className="h-9 w-9 rounded-full" />
                  <div>
                    <div className="text-sm font-semibold text-navy">{c.author.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                    <div className="mt-1 text-xs text-muted-foreground">{c.createdAt}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Maker</div>
            <Link href={`/u/${product.maker.username}`} className="mt-2 flex items-center gap-3">
              <img src={product.maker.avatarUrl ?? ""} alt="" className="h-10 w-10 rounded-full" />
              <div>
                <div className="font-semibold text-navy">{product.maker.name}</div>
                <div className="text-xs text-muted-foreground">@{product.maker.username}</div>
              </div>
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {product.comments} comments</div>
            <div className="mt-2 flex items-center gap-2"><Globe className="h-4 w-4" /> Launch {product.launchDate}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

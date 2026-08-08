"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, UserCheck, UserPlus } from "lucide-react";
import { toggleFollow } from "@/lib/actions/app";
import { toast } from "sonner";

export type CreatorRow = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  city: string | null;
  followers: number;
  products: number;
  category: string;
};

export function CreatorsClient({
  creators: initial,
  categories,
  followingIds,
}: {
  creators: CreatorRow[];
  categories: string[];
  followingIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [followed, setFollowed] = useState<Set<string>>(new Set(followingIds));
  const [tr, startTransition] = useTransition();

  const filters = ["All", ...categories];

  const creators = initial.filter(c => {
    const matchQuery =
      query === "" ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.username.toLowerCase().includes(query.toLowerCase()) ||
      (c.bio ?? "").toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === "All" || c.category === activeFilter;
    return matchQuery && matchFilter;
  });

  const onFollow = (username: string, id: string) => {
    startTransition(async () => {
      const res = await toggleFollow(username);
      if (res?.error) {
        if (res.error === "Please sign in") {
          toast.error("Please sign in to follow creators");
          return;
        }
        toast.error(res.error);
        return;
      }
      setFollowed(prev => {
        const next = new Set(prev);
        if (res?.following) next.add(id);
        else next.delete(id);
        return next;
      });
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Creators</h1>
      <p className="mt-2 text-muted-foreground">
        Makers building the next generation of products in Indonesia &amp; SEA.
      </p>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search creators by name or username…"
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              activeFilter === f
                ? "border-navy bg-navy text-white"
                : "border-border bg-white text-navy hover:bg-light-gray"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        {creators.length} creator{creators.length !== 1 ? "s" : ""} found
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {creators.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No creators match your search.
          </div>
        )}
        {creators.map(u => {
          const isFollowing = followed.has(u.id);
          return (
            <div key={u.id} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:shadow-card">
              <Link href={`/u/${u.username}`} className="shrink-0">
                <img
                  src={u.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                  alt={u.name}
                  className="h-14 w-14 rounded-full border border-border bg-light-gray object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link href={`/u/${u.username}`} className="block truncate font-semibold text-navy hover:text-coral">
                      {u.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">@{u.username}</div>
                  </div>
                  <button
                    type="button"
                    disabled={tr}
                    onClick={() => onFollow(u.username, u.id)}
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      isFollowing
                        ? "border-navy bg-navy text-white"
                        : "border-border text-navy hover:bg-light-gray"
                    }`}
                  >
                    {isFollowing ? (
                      <><UserCheck className="h-3.5 w-3.5" /> Following</>
                    ) : (
                      <><UserPlus className="h-3.5 w-3.5" /> Follow</>
                    )}
                  </button>
                </div>
                {u.bio && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{u.bio}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{u.followers} followers</span>
                  <span>·</span>
                  <span>{u.products} products</span>
                  {u.category && (
                    <span className="ml-auto rounded-full bg-light-gray px-2 py-0.5 text-[10px] font-medium capitalize text-navy">
                      {u.category.replace(/-/g, " ")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

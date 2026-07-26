"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, UserCheck, UserPlus } from "lucide-react";

/* ─────────────────────────── Mock creator data ─────────────────────────── */
const MOCK_CREATORS = [
  { id: "1", name: "Rizqi Maulana", username: "rizqi", avatarUrl: null, bio: "Building SaaS tools for Indonesian SMBs.", followers: 142, products: 4, category: "SaaS" },
  { id: "2", name: "Sari Dewi", username: "sari", avatarUrl: null, bio: "AI researcher & indie hacker.", followers: 89, products: 2, category: "AI" },
  { id: "3", name: "Budi Santoso", username: "budi", avatarUrl: null, bio: "Full-stack developer and startup founder.", followers: 214, products: 6, category: "Developer Tools" },
  { id: "4", name: "Rina Hasanah", username: "rina", avatarUrl: null, bio: "Product designer turned builder.", followers: 53, products: 1, category: "Design" },
  { id: "5", name: "Dimas Pratama", username: "dimas", avatarUrl: null, bio: "Fintech builder focused on financial inclusion.", followers: 178, products: 3, category: "Fintech" },
  { id: "6", name: "Nadia Fatima", username: "nadia", avatarUrl: null, bio: "EdTech entrepreneur changing how Indonesia learns.", followers: 91, products: 2, category: "Education" },
  { id: "7", name: "Hafiz Kurniawan", username: "hafiz", avatarUrl: null, bio: "Productivity tools for remote teams.", followers: 67, products: 2, category: "Productivity" },
  { id: "8", name: "Layla Andriani", username: "layla", avatarUrl: null, bio: "Building the next generation of AI assistants.", followers: 305, products: 5, category: "AI" },
];

const CATEGORY_FILTERS = ["All", "SaaS", "AI", "Developer Tools", "Design", "Fintech", "Education", "Productivity"];

export default function CreatorsPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const creators = MOCK_CREATORS.filter(c => {
    const matchQuery =
      query === "" ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.username.toLowerCase().includes(query.toLowerCase()) ||
      (c.bio ?? "").toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === "All" || c.category === activeFilter;
    return matchQuery && matchFilter;
  });

  const toggleFollow = (id: string) => {
    setFollowed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Creators</h1>
      <p className="mt-2 text-muted-foreground">
        Makers building the next generation of products in Indonesia &amp; SEA.
      </p>

      {/* Search bar */}
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

      {/* Category filter chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map(f => (
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

      {/* Results count */}
      <p className="mt-5 text-xs text-muted-foreground">
        {creators.length} creator{creators.length !== 1 ? "s" : ""} found
      </p>

      {/* Creator grid */}
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
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                  alt={u.name}
                  className="h-14 w-14 rounded-full border border-border bg-light-gray"
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
                    onClick={() => toggleFollow(u.id)}
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
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
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{isFollowing ? u.followers + 1 : u.followers} followers</span>
                  <span>·</span>
                  <span>{u.products} products</span>
                  <span className="ml-auto rounded-full bg-light-gray px-2 py-0.5 text-[10px] font-medium text-navy">{u.category}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

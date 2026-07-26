"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Loader2, X } from "lucide-react";

type SuggestItem = {
  slug: string;
  name: string;
  tagline: string;
  thumbnailUrl: string | null;
};

export function HeaderSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const goSearch = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    setMobileOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goSearch();
    }
    if (e.key === "Escape") {
      setOpen(false);
      setMobileOpen(false);
    }
  };

  const Dropdown = () => {
    if (!open || query.trim().length < 2) return null;
    return (
      <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
        {loading && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching…
          </div>
        )}
        {!loading && results.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-foreground">No products found</p>
        )}
        {!loading && results.length > 0 && (
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map(r => (
              <li key={r.slug}>
                <Link
                  href={`/products/${r.slug}`}
                  onClick={() => { setOpen(false); setMobileOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-light-gray"
                >
                  <img
                    src={r.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${r.slug}`}
                    alt=""
                    className="h-9 w-9 rounded-lg border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.tagline}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!loading && query.trim().length >= 2 && (
          <button
            type="button"
            onClick={goSearch}
            className="w-full border-t border-border px-4 py-2.5 text-left text-xs font-semibold text-coral hover:bg-light-gray"
          >
            See all results for “{query.trim()}”
          </button>
        )}
      </div>
    );
  };

  return (
    <div ref={wrapRef} className="relative">
      {/* Desktop input */}
      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products…"
          className="w-44 rounded-xl border border-border bg-light-gray py-2 pl-9 pr-3 text-sm text-navy outline-none transition-all placeholder:text-muted-foreground focus:w-64 focus:border-navy focus:bg-white md:w-52 md:focus:w-72"
        />
        <Dropdown />
      </div>

      {/* Mobile: icon toggles expanded search */}
      <button
        type="button"
        onClick={() => { setMobileOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:bg-light-gray sm:hidden"
        aria-label="Search"
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
      </button>

      {mobileOpen && (
        <div className="absolute right-0 top-11 z-50 w-[min(100vw-2rem,20rem)] sm:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onKeyDown={onKeyDown}
              placeholder="Search products…"
              autoFocus
              className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm text-navy outline-none shadow-lg focus:border-navy"
            />
            <Dropdown />
          </div>
        </div>
      )}
    </div>
  );
}

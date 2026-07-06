"use client";

import { useRouter } from "next/navigation";

export function SearchForm({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();

  return (
    <form
      className="mt-4"
      onSubmit={e => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        router.push(`/search?q=${encodeURIComponent(String(q ?? ""))}`);
      }}
    >
      <input
        name="q"
        defaultValue={initialQuery}
        placeholder="Search products..."
        className="w-full rounded-xl border border-border px-4 py-3 text-sm"
      />
    </form>
  );
}

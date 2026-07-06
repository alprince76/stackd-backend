"use client";

import Link from "next/link";

const TABS = [
  { label: "Hari Ini", value: "today" },
  { label: "Kemarin", value: "yesterday" },
  { label: "Minggu Ini", value: "week" },
  { label: "Bulan Ini", value: "month" },
];

export function HomeTabs({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map(t => (
        <Link
          key={t.value}
          href={`/?tab=${t.value}`}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            current === t.value
              ? "bg-navy text-white"
              : "border border-border text-navy hover:bg-light-gray"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

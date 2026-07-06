"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type NavItem = { label: string; href: string };

export function HeaderClient({
  nav,
  user,
}: {
  nav: NavItem[];
  user: { username: string; name: string; avatarUrl?: string | null } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="-ml-1 p-1.5 text-navy md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-16 border-t border-border bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {nav.map(n => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-light-gray ${
                  pathname === n.href ? "text-navy" : "text-muted-foreground"
                }`}
              >
                {n.label}
              </Link>
            ))}
            {!user && (
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-navy">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

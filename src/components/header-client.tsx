"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings } from "lucide-react";

type NavItem = { label: string; href: string };
type UserProp = { username: string; name: string; avatarUrl?: string | null };

export function HeaderClient({
  nav,
  user,
}: {
  nav: NavItem[];
  user: UserProp | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="-ml-1 p-1.5 text-navy md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
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
            {user ? (
              <>
                <Link href={`/u/${user.username}`} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-light-gray">
                  View Profile
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-light-gray">
                  Settings
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-light-gray"
                >
                  Sign Out
                </button>
              </>
            ) : (
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

export function UserDropdown({ user }: { user: UserProp }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        aria-label="User menu"
      >
        <img
          src={user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
          alt={user.name}
          className="h-9 w-9 rounded-full border border-border bg-light-gray"
        />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-48 rounded-xl border border-border bg-white py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-semibold text-navy">{user.name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
          <Link
            href={`/u/${user.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy hover:bg-light-gray"
          >
            <User className="h-4 w-4" />
            View Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy hover:bg-light-gray"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-light-gray"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

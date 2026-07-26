import Link from "next/link";
import { HeaderClient, UserDropdown, NotificationBell } from "./header-client";
import { HeaderSearch } from "./header-search";
import { Logo } from "./logo";
import { auth } from "@/lib/auth";

const NAV = [
  { label: "Discover", href: "/" },
  { label: "Creators", href: "/creators" },
  { label: "Newsletter", href: "/newsletter" },
];

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <HeaderClient nav={NAV} user={user ? {
          username: user.username,
          name: user.name,
          avatarUrl: user.avatarUrl,
        } : null} />
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-navy"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />
          {user && <NotificationBell />}
          <Link href="/submit" className="hidden rounded-xl bg-gradient-brand px-3.5 py-2 text-sm font-semibold text-white shadow-sm sm:inline-flex">
            Submit Product
          </Link>
          {user ? (
            <UserDropdown user={{
              username: user.username,
              name: user.name,
              avatarUrl: user.avatarUrl,
            }} />
          ) : (
            <Link
              href="/login"
              className="rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-navy transition-colors hover:bg-light-gray"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

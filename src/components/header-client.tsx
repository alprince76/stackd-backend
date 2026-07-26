"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import {
  LogOut, User, Settings, Bell, Check, ArrowBigUp,
  MessageCircle, UserPlus, LayoutDashboard, X,
} from "lucide-react";

type NavItem = { label: string; href: string };
type UserProp = { username: string; name: string; avatarUrl?: string | null };

/* ─────────────────────────── Notifications (DB polling) ─────────────────────────── */
type DbNotif = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

type UiNotif = {
  id: string;
  type: "product" | "community" | "social";
  icon: "check" | "clock" | "star" | "upvote" | "comment" | "reply" | "user-plus" | "users";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link: string | null;
};

function dbToUi(n: DbNotif): UiNotif {
  const typeMap: Record<string, { cat: UiNotif["type"]; icon: UiNotif["icon"] }> = {
    product_approved:     { cat: "product",   icon: "check" },
    product_rejected:     { cat: "product",   icon: "clock" },
    product_under_review: { cat: "product",   icon: "star" },
    product_upvoted:      { cat: "community", icon: "upvote" },
    product_commented:    { cat: "community", icon: "comment" },
    new_follower:         { cat: "social",    icon: "user-plus" },
  };
  const meta = typeMap[n.type] ?? { cat: "product" as const, icon: "star" as const };

  const elapsed = Date.now() - new Date(n.createdAt).getTime();
  const mins = Math.floor(elapsed / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  const timestamp = days > 0 ? `${days}d ago` : hrs > 0 ? `${hrs}h ago` : mins > 0 ? `${mins}m ago` : "just now";

  return {
    id: n.id,
    type: meta.cat,
    icon: meta.icon,
    title: n.title,
    description: n.body,
    timestamp,
    read: n.read,
    link: n.link,
  };
}

function NotifIcon({ icon }: { icon: UiNotif["icon"] }) {
  const base = "h-4 w-4";
  if (icon === "check") return <Check className={`${base} text-green-500`} />;
  if (icon === "clock") return <Bell className={`${base} text-amber-500`} />;
  if (icon === "star") return <Bell className={`${base} text-blue-500`} />;
  if (icon === "upvote") return <ArrowBigUp className={`${base} text-violet-500`} />;
  if (icon === "comment") return <MessageCircle className={`${base} text-emerald-500`} />;
  if (icon === "reply") return <MessageCircle className={`${base} text-sky-500`} />;
  if (icon === "user-plus") return <UserPlus className={`${base} text-coral`} />;
  return <User className={`${base} text-navy`} />;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<UiNotif[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "product" | "community" | "social">("all");

  const unread = notifs.filter(n => !n.read).length;
  const filtered = activeTab === "all" ? notifs : notifs.filter(n => n.type === activeTab);

  // Poll DB every 30s
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifs((data.notifications as DbNotif[] ?? []).map(dbToUi));
      } catch { /* network error — keep current state */ }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true }) });
  };

  const markRead = async (id: string, link: string | null) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (link) window.location.href = link;
  };

  const TABS = [
    { key: "all", label: "All" },
    { key: "product", label: "Product" },
    { key: "community", label: "Community" },
    { key: "social", label: "Social" },
  ] as const;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-light-gray hover:text-navy"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-border bg-white shadow-lg sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-semibold text-navy">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-coral hover:underline">
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border px-3 pt-2">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`rounded-t-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === t.key
                    ? "border-b-2 border-navy text-navy"
                    : "text-muted-foreground hover:text-navy"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <ul className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</li>
            )}
            {filtered.map(n => (
              <li
                key={n.id}
                onClick={() => markRead(n.id, n.link)}
                className={`flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-light-gray ${
                  !n.read ? "bg-violet-50/60" : ""
                }`}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-light-gray">
                  <NotifIcon icon={n.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${n.read ? "text-navy" : "text-navy"}`}>{n.title}</p>
                    {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-coral" />}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{n.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border px-4 py-2">
            <button onClick={() => setOpen(false)} className="w-full rounded-xl py-1.5 text-xs text-muted-foreground hover:bg-light-gray">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Mobile menu ─────────────────────────── */
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
          <X className="h-5 w-5" />
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
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-light-gray">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <Link href="/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-light-gray">
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error hover:bg-light-gray"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
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

/* ─────────────────────────── User dropdown ─────────────────────────── */
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
        <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-border bg-white py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-semibold text-navy">{user.name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy hover:bg-light-gray"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy hover:bg-light-gray"
          >
            <User className="h-4 w-4" />
            Profile
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

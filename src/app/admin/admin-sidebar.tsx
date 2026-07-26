"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, ListChecks, Mail, Users, Database,
  LogOut, Menu, X, ChevronRight,
  Bell, Check, Clock, AlertCircle,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  superadminOnly?: boolean;
};

type AdminUser = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

/* ─── Mock admin notifications ─── */
type AdminNotif = {
  id: string;
  type: "new" | "review" | "approved" | "rejected";
  productName: string;
  maker: string;
  time: string;
  action: string;
};

const INITIAL_NOTIFS: AdminNotif[] = [
  { id: "a1", type: "new", productName: "DataSync Pro", maker: "rizqi", time: "5m ago", action: "Review" },
  { id: "a2", type: "review", productName: "StackAI", maker: "sari", time: "20m ago", action: "Review" },
  { id: "a3", type: "approved", productName: "BuildFlow", maker: "budi", time: "1h ago", action: "View" },
  { id: "a4", type: "rejected", productName: "SpamBot 9000", maker: "anon", time: "2h ago", action: "View" },
];

function NotifIcon({ type }: { type: string }) {
  if (type === "new") return <Bell className="h-3.5 w-3.5 text-blue-400" />;
  if (type === "review") return <Clock className="h-3.5 w-3.5 text-amber-400" />;
  if (type === "approved") return <Check className="h-3.5 w-3.5 text-green-400" />;
  return <AlertCircle className="h-3.5 w-3.5 text-red-400" />;
}

function notifTitle(type: string, name: string) {
  if (type === "new") return `New Submission: ${name}`;
  if (type === "review") return `Under Review: ${name}`;
  if (type === "approved") return `Approved: ${name}`;
  return `Rejected: ${name}`;
}

function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<AdminNotif[]>(INITIAL_NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dismiss = (id: string) => setNotifs(n => n.filter(x => x.id !== id));

  return (
    <div ref={ref} className="relative px-3 py-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">Notifications</span>
        {notifs.length > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
            {notifs.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full top-0 z-50 ml-2 w-80 rounded-2xl border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-bold text-navy">Admin Notifications</span>
            {notifs.length > 0 && (
              <button onClick={() => setNotifs([])} className="text-[10px] font-semibold text-muted-foreground hover:text-navy">
                Clear all
              </button>
            )}
          </div>
          {notifs.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">All caught up!</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifs.map(n => (
                <div key={n.id} className="flex items-start gap-3 border-b border-border/50 px-4 py-3 last:border-0">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-light-gray">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-navy leading-snug">{notifTitle(n.type, n.productName)}</p>
                    <p className="text-[10px] text-muted-foreground">by @{n.maker} · {n.time}</p>
                    <Link href="/admin/queue"
                      className="mt-1 inline-flex rounded-lg border border-border px-2 py-0.5 text-[10px] font-semibold text-navy hover:bg-light-gray">
                      {n.action}
                    </Link>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="mt-0.5 text-muted-foreground hover:text-navy">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({
  user,
  pendingCount,
  isSuperAdmin = false,
}: {
  user: AdminUser;
  pendingCount: number;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Queue", href: "/admin/queue", icon: ListChecks, badge: pendingCount > 0 ? pendingCount : undefined },
    { label: "CRM", href: "/admin/crm", icon: Database },
    { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    { label: "Users", href: "/admin/users", icon: Users, superadminOnly: true },
  ];

  const visibleNav = NAV.filter(item => !item.superadminOnly || isSuperAdmin);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <span className="text-xs font-black text-white">S</span>
        </div>
        <div>
          <div className="text-sm font-bold text-white">Stackd</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Admin Panel</div>
        </div>
      </div>

      {/* Notification bell */}
      <div className="border-b border-white/10 py-2">
        <AdminNotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {visibleNav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              {item.badge !== undefined && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-[10px] font-bold text-white">
                  {item.badge}
                </span>
              )}
              {active && <ChevronRight className="h-3 w-3 text-white/40" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <img
            src={user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
            alt={user.name}
            className="h-8 w-8 shrink-0 rounded-full border border-white/20"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{user.name}</p>
            <p className="truncate text-[10px] text-white/50">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 bg-navy md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-navy px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <span className="text-xs font-black text-white">S</span>
          </div>
          <span className="text-sm font-bold text-white">Stackd Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-56 bg-navy shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}

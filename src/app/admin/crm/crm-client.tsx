"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";

export type CrmUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  roles: string[];
  city: string | null;
  bio: string | null;
  joinedAt: string;
  productCount: number;
  followerCount: number;
  totalUpvotes: number;
  latestProduct: string | null;
};

type Tab = "users" | "makers";
type RoleFilter = "All" | "User" | "Maker" | "Admin";

const ROLE_FILTERS: RoleFilter[] = ["All", "User", "Maker", "Admin"];

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    superadmin: "bg-purple-100 text-purple-700",
    admin: "bg-coral/10 text-coral",
    maker: "bg-violet-100 text-violet-700",
    user: "bg-light-gray text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[role] ?? map.user}`}>
      {role}
    </span>
  );
}

export function CrmClient({ users }: { users: CrmUser[] }) {
  const [tab, setTab] = useState<Tab>("users");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  const makers = users.filter(u => u.roles.includes("maker") || u.productCount > 0);

  const source = tab === "users" ? users : makers;

  const filtered = source.filter(u => {
    const matchQuery =
      !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase());

    const matchRole =
      roleFilter === "All" ||
      (roleFilter === "Admin" && (u.roles.includes("admin") || u.roles.includes("superadmin"))) ||
      (roleFilter === "Maker" && (u.roles.includes("maker") || u.productCount > 0)) ||
      (roleFilter === "User" && !u.roles.includes("admin") && !u.roles.includes("superadmin"));

    return matchQuery && matchRole;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
          <h1 className="mt-1 text-3xl font-bold text-navy">CRM</h1>
          <p className="mt-1 text-sm text-muted-foreground">View-only user and maker data</p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-light-gray"
          title="Export (coming soon)"
        >
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-border">
        {(["users", "makers"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-coral text-coral"
                : "border-transparent text-muted-foreground hover:text-navy"
            }`}
          >
            {t === "users" ? `All Users (${users.length})` : `Makers (${makers.length})`}
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email or username…"
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div className="flex gap-2">
          {ROLE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                roleFilter === f
                  ? "border-navy bg-navy text-white"
                  : "border-border text-muted-foreground hover:border-navy hover:text-navy"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-light-gray/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roles</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Products</th>
              {tab === "makers" && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upvotes</th>
              )}
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Followers</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No results found.
                </td>
              </tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-light-gray/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                      alt=""
                      className="h-8 w-8 rounded-full border border-border object-cover"
                    />
                    <div>
                      <p className="font-semibold text-navy">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground">@{u.username}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map(r => <RoleBadge key={r} role={r} />)}
                    {u.roles.length === 0 && <RoleBadge role="user" />}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.city ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-navy">{u.productCount}</span>
                  {tab === "makers" && u.latestProduct && (
                    <p className="text-[10px] text-muted-foreground truncate max-w-28">{u.latestProduct}</p>
                  )}
                </td>
                {tab === "makers" && (
                  <td className="px-4 py-3 font-semibold text-navy">{u.totalUpvotes}</td>
                )}
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.followerCount}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{u.joinedAt}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/u/${u.username}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-navy hover:bg-light-gray"
                  >
                    <ExternalLink className="h-3 w-3" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, ShieldOff, ShieldCheck, User, Hammer, Plus, X, Crown } from "lucide-react";
import { setAdminRole, createAdminUser } from "@/lib/actions/app";
import { toast } from "sonner";

type UserRow = {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  roles: string[];
  productCount: number;
  joinedAt: string;
};

const FILTERS = ["All", "Admin", "Maker", "User"] as const;
type Filter = (typeof FILTERS)[number];

function RoleBadge({ role }: { role: string }) {
  if (role === "superadmin") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
      <Crown className="h-3 w-3" /> Superadmin
    </span>
  );
  if (role === "admin") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
      <ShieldCheck className="h-3 w-3" /> Admin
    </span>
  );
  if (role === "maker") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
      <Hammer className="h-3 w-3" /> Maker
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-light-gray px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
      <User className="h-3 w-3" /> User
    </span>
  );
}

const EMPTY_FORM = { name: "", email: "", username: "", password: "" };

export function AdminUsersClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [tr, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"grant" | "revoke" | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = users.filter(u => {
    const matchQ = !query ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase());

    const matchFilter =
      filter === "All" ||
      (filter === "Admin" && (u.roles.includes("admin") || u.roles.includes("superadmin"))) ||
      (filter === "Maker" && u.roles.includes("maker") && !u.roles.includes("admin")) ||
      (filter === "User" && !u.roles.includes("admin") && !u.roles.includes("superadmin") && !u.roles.includes("maker"));

    return matchQ && matchFilter;
  });

  const handleAction = (userId: string, grant: boolean) => {
    setConfirmId(userId);
    setConfirmAction(grant ? "grant" : "revoke");
  };

  const confirmDo = () => {
    if (!confirmId || confirmAction === null) return;
    const grant = confirmAction === "grant";
    const user = users.find(u => u.id === confirmId);
    startTransition(async () => {
      const res = await setAdminRole(confirmId, grant);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(grant ? `${user?.name} is now an Admin` : `Admin role removed from ${user?.name}`);
        router.refresh();
      }
      setConfirmId(null);
      setConfirmAction(null);
    });
  };

  const submitCreate = () => {
    startTransition(async () => {
      const res = await createAdminUser(form);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`Admin ${form.name} created`);
      setForm(EMPTY_FORM);
      setShowCreate(false);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-coral">Superadmin</div>
          <h1 className="mt-1 text-3xl font-bold text-navy">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users.length} total users — create admins or promote / demote roles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Create Admin
        </button>
      </div>

      {/* Search + filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name, email, or username…"
            className="w-full rounded-xl border border-border py-2.5 pl-9 pr-4 text-sm outline-none focus:border-navy focus:ring-1 focus:ring-navy"
          />
        </div>
        <div className="flex gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === f ? "border-navy bg-navy text-white" : "border-border bg-white text-navy hover:bg-light-gray"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</p>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-light-gray/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Roles</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Products</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
              {filtered.map(u => {
                const isAdmin = u.roles.includes("admin") || u.roles.includes("superadmin");
                const isSuper = u.roles.includes("superadmin");
                const isConfirming = confirmId === u.id;
                return (
                  <tr key={u.id} className="hover:bg-light-gray/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                          alt={u.name}
                          className="h-8 w-8 shrink-0 rounded-full border border-border"
                        />
                        <div>
                          <div className="font-semibold text-navy">{u.name}</div>
                          <div className="text-xs text-muted-foreground">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map(r => <RoleBadge key={r} role={r} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-navy">{u.productCount}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{u.joinedAt}</td>
                    <td className="px-4 py-3 text-right">
                      {isSuper ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : isConfirming ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-muted-foreground">
                            {confirmAction === "grant" ? "Make admin?" : "Remove admin?"}
                          </span>
                          <button onClick={() => { setConfirmId(null); setConfirmAction(null); }}
                            className="rounded-lg border border-border px-2.5 py-1 text-xs text-navy hover:bg-light-gray">
                            Cancel
                          </button>
                          <button onClick={confirmDo} disabled={tr}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50 ${
                              confirmAction === "grant" ? "bg-violet-600 hover:bg-violet-700" : "bg-error hover:opacity-90"
                            }`}>
                            Confirm
                          </button>
                        </div>
                      ) : isAdmin ? (
                        <button
                          onClick={() => handleAction(u.id, false)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-error/40 px-3 py-1.5 text-xs font-semibold text-error hover:bg-red-50"
                        >
                          <ShieldOff className="h-3.5 w-3.5" /> Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(u.id, true)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                        >
                          <Shield className="h-3.5 w-3.5" /> Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Admin modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Create Admin</h2>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-light-gray">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Creates a new account with Admin role.</p>
            <div className="mt-5 space-y-3">
              {([
                ["name", "Full name", "text"],
                ["email", "Email", "email"],
                ["username", "Username", "text"],
                ["password", "Password (min 8)", "password"],
              ] as const).map(([key, label, type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-navy">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreate(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-light-gray">
                Cancel
              </button>
              <button type="button" disabled={tr} onClick={submitCreate}
                className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                Create Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

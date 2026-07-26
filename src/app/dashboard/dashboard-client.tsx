"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Eye, ArrowBigUp, MessageCircle, MousePointerClick,
  TrendingUp, TrendingDown, Package, Activity,
  BarChart2, User,
} from "lucide-react";

/* ─────────────────────────── Types ─────────────────────────── */
type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  thumbnailUrl: string | null;
  upvotes: number;
  comments: number;
  status: string;
};

type Props = {
  username: string;
  products: Product[];
};

/* ─────────────────────────── Mock data helpers ─────────────────────────── */
const DAILY_VISITS = [
  { day: "Mon", visits: 42 }, { day: "Tue", visits: 87 }, { day: "Wed", visits: 63 },
  { day: "Thu", visits: 110 }, { day: "Fri", visits: 95 }, { day: "Sat", visits: 34 },
  { day: "Sun", visits: 57 },
];

const WEEKLY_VISITS = [
  { week: "W1", visits: 312 }, { week: "W2", visits: 489 }, { week: "W3", visits: 401 },
  { week: "W4", visits: 623 },
];

function mockMetrics(product: Product) {
  const seed = product.id.charCodeAt(product.id.length - 1) || 1;
  return {
    views: (seed * 47 + product.upvotes * 12) % 980 + 20,
    visitors: Math.floor(((seed * 47 + product.upvotes * 12) % 980 + 20) * 0.7),
    ctr: ((seed % 7) + 2.1).toFixed(1) + "%",
    trend: seed % 3 === 0 ? "up" : seed % 3 === 1 ? "down" : "flat",
  };
}

/* ─────────────────────────── Sub-components ─────────────────────────── */
function StatCard({ label, value, icon: Icon, color, trend }: {
  label: string; value: string | number; icon: React.ElementType; color: string; trend?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${color}`} />
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
            trend > 0 ? "bg-green-50 text-green-600" : trend < 0 ? "bg-red-50 text-red-500" : "bg-light-gray text-muted-foreground"
          }`}>
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3 text-3xl font-bold text-navy">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─────────────────────────── Tabs ─────────────────────────── */
const TABS = [
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "products", label: "Products", icon: Package },
  { key: "activity", label: "Activity", icon: Activity },
] as const;
type Tab = (typeof TABS)[number]["key"];

/* ─────────────────────────── Main component ─────────────────────────── */
export function MakerDashboardClient({ username, products }: Props) {
  const [tab, setTab] = useState<Tab>("analytics");

  const totalViews = products.reduce((sum, p) => sum + mockMetrics(p).views, 0);
  const totalVotes = products.reduce((sum, p) => sum + p.upvotes, 0);
  const totalComments = products.reduce((sum, p) => sum + p.comments, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-coral">Maker</div>
        <h1 className="mt-1 text-3xl font-bold text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">@{username}</p>
      </div>

      {/* Tab nav */}
      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "border-b-2 border-navy text-navy"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Analytics tab ─── */}
      {tab === "analytics" && (
        <div className="mt-8 space-y-6">
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="text-blue-500" trend={14} />
            <StatCard label="Total Upvotes" value={totalVotes.toLocaleString()} icon={ArrowBigUp} color="text-violet-500" trend={7} />
            <StatCard label="Total Comments" value={totalComments.toLocaleString()} icon={MessageCircle} color="text-emerald-500" trend={-3} />
            <StatCard label="CTR (avg)" value="4.8%" icon={MousePointerClick} color="text-coral" trend={2} />
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="font-semibold text-navy">Daily Visits</div>
              <div className="text-xs text-muted-foreground">Last 7 days</div>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={DAILY_VISITS} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F05C2D" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#F05C2D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Area type="monotone" dataKey="visits" stroke="#F05C2D" strokeWidth={2} fill="url(#visitGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="font-semibold text-navy">Weekly Visits</div>
              <div className="text-xs text-muted-foreground">Last 4 weeks</div>
              <div className="mt-4 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_VISITS} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                    <Bar dataKey="visits" fill="#7B3FF2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Products tab ─── */}
      {tab === "products" && (
        <div className="mt-8 space-y-4">
          {products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              You haven&apos;t submitted any products yet.{" "}
              <Link href="/submit" className="font-semibold text-coral hover:underline">Submit one now →</Link>
            </div>
          )}
          {products.map(p => {
            const m = mockMetrics(p);
            return (
              <article key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
                <img
                  src={p.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${p.slug}`}
                  alt={p.name}
                  className="h-14 w-14 rounded-xl border border-border bg-light-gray object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${p.slug}`} className="font-semibold text-navy hover:text-coral">{p.name}</Link>
                  <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.status === "approved" ? "bg-green-50 text-green-700" :
                    p.status === "rejected" ? "bg-red-50 text-red-600" :
                    p.status === "underReview" ? "bg-amber-50 text-amber-700" :
                    "bg-light-gray text-muted-foreground"
                  }`}>
                    {p.status === "underReview" ? "Under Review" : p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
                {/* Per-product metrics */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Eye, label: "Views", value: m.views },
                    { icon: User, label: "Visitors", value: m.visitors },
                    { icon: ArrowBigUp, label: "Votes", value: p.upvotes },
                    { icon: MessageCircle, label: "Comments", value: p.comments },
                  ].map(stat => (
                    <div key={stat.label} className="flex flex-col items-center rounded-xl border border-border px-3 py-2 text-center">
                      <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="mt-0.5 text-sm font-bold text-navy">{stat.value}</span>
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-border px-3 py-2 text-center">
                    <span className={`text-xs font-bold ${m.trend === "up" ? "text-green-600" : m.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                      {m.trend === "up" ? "↑" : m.trend === "down" ? "↓" : "→"} {m.ctr}
                    </span>
                    <span className="text-[10px] text-muted-foreground">CTR</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ─── Activity tab ─── */}
      {tab === "activity" && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-16 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 font-semibold text-navy">Activity timeline coming soon</p>
          <p className="mt-1 text-sm text-muted-foreground">Track your product launches, votes, and follower growth over time.</p>
        </div>
      )}
    </div>
  );
}

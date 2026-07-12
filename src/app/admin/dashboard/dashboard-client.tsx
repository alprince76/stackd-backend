"use client";

import Link from "next/link";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Package, Users, ArrowBigUp, MessageCircle,
  TrendingUp, TrendingDown, Minus,
} from "lucide-react";

type Props = {
  stats: {
    products: number;
    users: number;
    votes: number;
    comments: number;
    pending: number;
  };
  trends: {
    products: number;
    users: number;
    votes: number;
    comments: number;
  };
  topProducts: {
    id: string;
    slug: string;
    name: string;
    thumbnailUrl: string | null;
    votes: number;
    maker: { username: string; name: string; avatarUrl: string | null };
  }[];
  topMakers: {
    username: string;
    name: string;
    avatarUrl: string | null;
    productCount: number;
  }[];
  votesChart: { day: string; votes: number }[];
  signupsChart: { i: number; count: number }[];
  totalSignupsRecent: number;
  signupsTrend: number;
};

function TrendBadge({ value }: { value: number }) {
  if (value > 0) return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
      <TrendingUp className="h-3 w-3" />+{value}% wk
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
      <TrendingDown className="h-3 w-3" />{value}% wk
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-light-gray px-2 py-0.5 text-xs font-semibold text-muted-foreground">
      <Minus className="h-3 w-3" />0% wk
    </span>
  );
}

const STAT_CARDS = (stats: Props["stats"], trends: Props["trends"]) => [
  { label: "Total Products", value: stats.products, trend: trends.products, icon: Package, color: "text-coral" },
  { label: "Total Users", value: stats.users.toLocaleString(), trend: trends.users, icon: Users, color: "text-blue-500" },
  { label: "Total Upvotes", value: stats.votes.toLocaleString(), trend: trends.votes, icon: ArrowBigUp, color: "text-violet-500" },
  { label: "Total Comments", value: stats.comments, trend: trends.comments, icon: MessageCircle, color: "text-emerald-500" },
];

export function DashboardClient({ stats, trends, topProducts, topMakers, votesChart, signupsChart, totalSignupsRecent, signupsTrend }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
          <h1 className="mt-1 text-3xl font-bold text-navy">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/newsletter"
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-navy hover:bg-light-gray"
          >
            Newsletter
          </Link>
          {stats.pending > 0 && (
            <Link
              href="/admin/queue"
              className="rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Review {stats.pending} pending
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS(stats, trends).map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <TrendBadge value={s.trend} />
            </div>
            <div className="mt-3 text-3xl font-bold text-navy">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Upvotes this week */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-navy">Upvotes this week</div>
              <div className="text-xs text-muted-foreground">Daily engagement across all products.</div>
            </div>
            <TrendBadge value={trends.votes} />
          </div>
          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={votesChart} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                <defs>
                  <linearGradient id="voteGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B3FF2" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7B3FF2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="votes" stroke="#7B3FF2" strokeWidth={2} fill="url(#voteGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New signups */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="font-semibold text-navy">New signups</div>
          <div className="text-xs text-muted-foreground">Last 15 days</div>
          <div className="mt-3 text-4xl font-bold text-navy">
            +{totalSignupsRecent.toLocaleString()}
          </div>
          <div className="mt-1">
            <TrendBadge value={signupsTrend} />
          </div>
          <div className="mt-4 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupsChart} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
                <Line type="monotone" dataKey="count" stroke="#06d6a0" strokeWidth={2} dot={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 11 }}
                  formatter={(v) => [v, "signups"]}
                  labelFormatter={() => ""}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products + Top Makers */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold text-navy">
            <TrendingUp className="h-4 w-4 text-coral" /> Top products
          </div>
          <ul className="mt-4 space-y-3">
            {topProducts.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                <img
                  src={p.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${p.slug}`}
                  alt={p.name}
                  className="h-9 w-9 rounded-lg border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="truncate text-sm font-semibold text-navy hover:text-coral"
                  >
                    {p.name}
                  </Link>
                </div>
                <span className="shrink-0 text-sm font-bold text-muted-foreground">{p.votes.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Makers */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 font-semibold text-navy">
            <Users className="h-4 w-4 text-coral" /> Top makers
          </div>
          <ul className="mt-4 space-y-3">
            {topMakers.map((m, i) => (
              <li key={m.username} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                <img
                  src={m.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.username}`}
                  alt={m.name}
                  className="h-9 w-9 rounded-full border border-border"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/u/${m.username}`}
                    className="truncate text-sm font-semibold text-navy hover:text-coral"
                  >
                    {m.name}
                  </Link>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{m.productCount} products</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

import { getDashboardStats } from "@/lib/queries/products";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
      <h1 className="mt-1 text-3xl font-bold text-navy">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Live products", value: stats.products },
          { label: "Makers", value: stats.users },
          { label: "Total upvotes", value: stats.votes },
          { label: "Pending review", value: stats.pending },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="text-2xl font-bold text-navy">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

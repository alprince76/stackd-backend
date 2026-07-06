import { getAllNewsletters } from "@/lib/queries/products";

export default async function AdminNewsletterPage() {
  const newsletters = await getAllNewsletters();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Newsletter CMS</h1>
      <div className="mt-8 space-y-3">
        {newsletters.map(n => (
          <div key={n.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="font-semibold text-navy">{n.title}</div>
            <div className="text-xs text-muted-foreground">{n.status} · {n.publishDate.toISOString().slice(0, 10)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

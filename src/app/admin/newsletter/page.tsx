import Link from "next/link";
import { Plus, FileText, Calendar } from "lucide-react";
import { getAllNewsletters } from "@/lib/queries/products";
import { NewsletterForm } from "./newsletter-form";

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; edit?: string }>;
}) {
  const params = await searchParams;

  // Show create form
  if (params.new === "1") {
    return <NewsletterForm />;
  }

  const newsletters = await getAllNewsletters();

  // Show edit form
  if (params.edit) {
    const n = newsletters.find(nl => nl.id === params.edit);
    if (n) {
      return (
        <NewsletterForm
          initial={{
            id: n.id,
            title: n.title,
            shortDescription: n.shortDescription ?? "",
            content: n.content ?? "",
            coverImageUrl: n.coverImageUrl ?? "",
            publishDate: n.publishDate.toISOString().slice(0, 10),
            status: n.status as "draft" | "published",
          }}
        />
      );
    }
  }

  /* ── Newsletter list ── */
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
          <h1 className="mt-1 text-3xl font-bold text-navy">Newsletter CMS</h1>
        </div>
        <Link
          href="/admin/newsletter?new=1"
          className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New Newsletter
        </Link>
      </div>

      {newsletters.length === 0 && (
        <div className="mt-12 rounded-3xl border border-dashed border-border p-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm text-muted-foreground">No newsletters yet.</p>
          <Link href="/admin/newsletter?new=1"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Create your first newsletter
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {newsletters.map(n => {
          const statusColor =
            n.status === "published" ? "bg-green-100 text-green-700"
            : n.status === "scheduled" ? "bg-amber-100 text-amber-700"
            : "bg-light-gray text-muted-foreground";

          return (
            <div key={n.id} className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-violet-200 hover:shadow-card transition-all">
              {n.coverImageUrl ? (
                <img src={n.coverImageUrl} alt="" className="h-14 w-20 rounded-xl object-cover border border-border" />
              ) : (
                <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-light-gray border border-border">
                  <FileText className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-navy">{n.title}</div>
                <p className="text-xs text-muted-foreground line-clamp-1">{n.shortDescription}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>
                    {n.status}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {n.publishDate.toISOString().slice(0, 10)}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/newsletter?edit=${n.id}`}
                className="shrink-0 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-navy opacity-0 group-hover:opacity-100 transition-opacity hover:bg-light-gray"
              >
                Edit
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

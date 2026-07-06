import Link from "next/link";
import { getPublishedNewsletters } from "@/lib/queries/products";
import { NewsletterSubscribe } from "@/components/newsletter-subscribe";

export default async function NewsletterPage() {
  const issues = await getPublishedNewsletters();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Stackd Newsletter</h1>
      <p className="mt-2 text-muted-foreground">Weekly digest of the best product launches from Indonesia & SEA.</p>
      <NewsletterSubscribe />
      <div className="mt-12 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Previous issues</h2>
        {issues.map(n => (
          <article key={n.id} className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold text-navy">{n.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{n.shortDescription}</p>
            <p className="mt-2 text-xs text-muted-foreground">{n.publishDate.toISOString().slice(0, 10)}</p>
          </article>
        ))}
      </div>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-navy">← Back</Link>
    </div>
  );
}

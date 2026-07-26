"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Check, X, ArrowBigUp, MessageCircle, Eye, Star, StarOff,
  ClockArrowUp,
} from "lucide-react";
import {
  approveProduct, rejectProduct, moveToUnderReview, pinProduct,
} from "@/lib/actions/app";
import { toast } from "sonner";

type QueueProduct = {
  id: string;
  name: string;
  tagline: string;
  thumbnailUrl: string | null;
  maker: { username: string; name: string };
  categoryId: string;
  pinnedPosition: number | null;
  status: string;
  upvotes?: number;
  comments?: number;
};

function mockViews(product: QueueProduct) {
  const seed = product.id.charCodeAt(product.id.length - 1) || 1;
  return (seed * 47 + (product.upvotes ?? 0) * 12) % 980 + 20;
}

export function AdminQueueClient({
  pending,
  underReview,
  approved,
}: {
  pending: QueueProduct[];
  underReview: QueueProduct[];
  approved: QueueProduct[];
}) {
  const router = useRouter();
  const [tr, startTransition] = useTransition();

  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const run = (fn: () => Promise<{ error?: string; success?: boolean }>, msg: string) => {
    startTransition(async () => {
      const res = await fn();
      if (res?.error) toast.error(res.error);
      else {
        toast.success(msg);
        router.refresh();
      }
    });
  };

  const openReject = (id: string) => {
    setRejectOpen(id);
    setRejectReason("");
  };

  const submitReject = (id: string, name: string) => {
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    run(() => rejectProduct(id, rejectReason.trim()), `Rejected ${name}`);
    setRejectOpen(null);
    setRejectReason("");
  };

  /* ─────────────────────────── Product card ─────────────────────────── */
  function QueueCard({ p, section }: { p: QueueProduct; section: "pending" | "underReview" | "approved" }) {
    const views = mockViews(p);
    const isFeatured = p.pinnedPosition !== null;

    return (
      <article className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-4 p-4">
          <img
            src={p.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${p.id}`}
            alt={p.name}
            className="h-14 w-14 rounded-xl border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-navy">{p.name}</h3>
              {isFeatured && section === "approved" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Featured
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{p.tagline}</p>
            <p className="text-xs text-muted-foreground">by @{p.maker.username}</p>
          </div>

          {/* Read-only metrics for under-review & approved */}
          {(section === "underReview" || section === "approved") && (
            <div className="flex gap-2 text-center">
              {[
                { icon: ArrowBigUp, label: "Votes", value: p.upvotes ?? 0 },
                { icon: Eye, label: "Views", value: views },
                { icon: MessageCircle, label: "Comments", value: p.comments ?? 0 },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center rounded-xl border border-border px-3 py-1.5">
                  <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-bold text-navy">{s.value}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {section === "pending" && (
              <>
                <button type="button" disabled={tr}
                  onClick={() => run(() => moveToUnderReview(p.id), `Moved "${p.name}" to Under Review`)}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100">
                  <ClockArrowUp className="h-4 w-4" /> Under Review
                </button>
                <button type="button" disabled={tr} onClick={() => openReject(p.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-error/40 px-3 py-2 text-sm text-error hover:bg-red-50">
                  <X className="h-4 w-4" /> Reject
                </button>
                <button type="button" disabled={tr} onClick={() => run(() => approveProduct(p.id), `Approved ${p.name}`)}
                  className="inline-flex items-center gap-1 rounded-xl bg-success px-3 py-2 text-sm font-semibold text-white">
                  <Check className="h-4 w-4" /> Approve
                </button>
              </>
            )}
            {section === "underReview" && (
              <>
                <button type="button" disabled={tr} onClick={() => openReject(p.id)}
                  className="inline-flex items-center gap-1 rounded-xl border border-error/40 px-3 py-2 text-sm text-error hover:bg-red-50">
                  <X className="h-4 w-4" /> Reject
                </button>
                <button type="button" disabled={tr} onClick={() => run(() => approveProduct(p.id), `Approved ${p.name}`)}
                  className="inline-flex items-center gap-1 rounded-xl bg-success px-3 py-2 text-sm font-semibold text-white">
                  <Check className="h-4 w-4" /> Approve
                </button>
              </>
            )}
            {section === "approved" && (
              isFeatured ? (
                <button type="button" disabled={tr}
                  onClick={() => run(() => pinProduct(p.id, null), `Unfeatured ${p.name}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-light-gray">
                  <StarOff className="h-3.5 w-3.5" /> Unfeature
                </button>
              ) : (
                <button type="button" disabled={tr}
                  onClick={() => run(() => pinProduct(p.id, 1), `Featured ${p.name}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                  <Star className="h-3.5 w-3.5" /> Feature
                </button>
              )
            )}
          </div>
        </div>

        {/* Reject inline form */}
        {rejectOpen === p.id && (
          <div className="border-t border-error/30 bg-red-50 p-4">
            <p className="mb-2 text-sm font-semibold text-error">Rejection Reason <span className="text-error">*</span></p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Explain why this product is being rejected…"
              className="w-full rounded-xl border border-error/40 bg-white px-3 py-2 text-sm outline-none"
              autoFocus
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => setRejectOpen(null)} className="rounded-xl border border-border px-3 py-1.5 text-sm text-navy hover:bg-light-gray">Cancel</button>
              <button type="button" disabled={!rejectReason.trim() || tr} onClick={() => submitReject(p.id, p.name)}
                className="rounded-xl bg-error px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </article>
    );
  }

  const featuredCount = approved.filter(p => p.pinnedPosition !== null).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
      <h1 className="mt-1 text-3xl font-bold text-navy">Submission Queue</h1>

      {/* ── Pending ── */}
      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pending ({pending.length})</h2>
        {pending.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Queue is empty.</div>
        )}
        {pending.map(p => <QueueCard key={p.id} p={p} section="pending" />)}
      </section>

      {/* ── Under Review ── */}
      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Under Review ({underReview.length})</h2>
        {underReview.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No products under review.</div>
        )}
        {underReview.map(p => <QueueCard key={p.id} p={p} section="underReview" />)}
      </section>

      {/* ── Approved + Feature Management ── */}
      {approved.length > 0 && (
        <section className="mt-10 space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Approved — Feature Management ({approved.length})
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {featuredCount > 0
                ? `${featuredCount} product${featuredCount > 1 ? "s" : ""} currently featured on the homepage.`
                : "No products featured yet. Click Feature to highlight a product on the homepage."}
            </p>
          </div>
          {approved.map(p => <QueueCard key={p.id} p={p} section="approved" />)}
        </section>
      )}

      <div className="mt-8">
        <Link href="/admin" className="text-sm font-semibold text-navy hover:underline">← Back to Admin</Link>
      </div>
    </div>
  );
}

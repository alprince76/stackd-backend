"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, X, Calendar, Pin, PinOff } from "lucide-react";
import { approveProduct, rejectProduct, scheduleProduct, pinProduct } from "@/lib/actions/app";
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
};

export function AdminQueueClient({
  pending,
  scheduled,
  approved,
}: {
  pending: QueueProduct[];
  scheduled: QueueProduct[];
  approved: QueueProduct[];
}) {
  const router = useRouter();
  const [pendingState, startTransition] = useTransition();
  const [scheduleFor, setScheduleFor] = useState<QueueProduct | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [pinInput, setPinInput] = useState<Record<string, string>>({});

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

  const handlePin = (productId: string, currentPin: number | null) => {
    const inputVal = pinInput[productId];
    const newPosition = inputVal ? parseInt(inputVal, 10) : null;
    run(() => pinProduct(productId, newPosition), currentPin !== null ? "Unpinned" : "Pinned");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
      <h1 className="mt-1 text-3xl font-bold text-navy">Submission queue</h1>

      <div className="mt-8 grid gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pending ({pending.length})</h2>
        {pending.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            Queue is empty.
          </div>
        )}
        {pending.map(p => (
          <article key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <img src={p.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${p.id}`} alt={p.name} className="h-14 w-14 rounded-xl border border-border" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-navy">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.tagline}</p>
              <p className="text-xs text-muted-foreground">by @{p.maker.username}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setScheduleFor(p)} className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm">
                <Calendar className="h-4 w-4" /> Schedule
              </button>
              <button type="button" disabled={pendingState} onClick={() => run(() => rejectProduct(p.id), `Rejected ${p.name}`)}
                className="inline-flex items-center gap-1 rounded-xl border border-error/40 px-3 py-2 text-sm text-error">
                <X className="h-4 w-4" /> Reject
              </button>
              <button type="button" disabled={pendingState} onClick={() => run(() => approveProduct(p.id), `Approved ${p.name}`)}
                className="inline-flex items-center gap-1 rounded-xl bg-success px-3 py-2 text-sm font-semibold text-white">
                <Check className="h-4 w-4" /> Approve
              </button>
            </div>
          </article>
        ))}
      </div>

      {scheduled.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Scheduled ({scheduled.length})</h2>
          <ul className="mt-3 space-y-2">
            {scheduled.map(p => (
              <li key={p.id} className="rounded-xl border border-border bg-card p-3 text-sm">{p.name}</li>
            ))}
          </ul>
        </section>
      )}

      {approved.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Approved — Pin Management ({approved.length})
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">Pinned products always appear first in the leaderboard.</p>
          <ul className="mt-3 space-y-2">
            {approved.map(p => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
                <img src={p.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${p.id}`} alt={p.name} className="h-10 w-10 rounded-lg border border-border" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-navy text-sm">{p.name}</div>
                  {p.pinnedPosition !== null && (
                    <div className="text-xs text-amber-600 font-medium">Pinned at position {p.pinnedPosition}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    placeholder="Position"
                    value={pinInput[p.id] ?? ""}
                    onChange={e => setPinInput(prev => ({ ...prev, [p.id]: e.target.value }))}
                    className="w-24 rounded-xl border border-border px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={pendingState}
                    onClick={() => handlePin(p.id, p.pinnedPosition)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                      p.pinnedPosition !== null
                        ? "border border-border text-navy hover:bg-light-gray"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    }`}
                  >
                    {p.pinnedPosition !== null ? (
                      <><PinOff className="h-3.5 w-3.5" /> Unpin</>
                    ) : (
                      <><Pin className="h-3.5 w-3.5" /> Pin</>
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {scheduleFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="font-bold text-navy">Schedule {scheduleFor.name}</h3>
            <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
              className="mt-4 w-full rounded-xl border border-border px-3 py-2" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setScheduleFor(null)} className="rounded-xl border px-4 py-2 text-sm">Cancel</button>
              <button type="button" disabled={!scheduleAt || pendingState}
                onClick={() => {
                  run(() => scheduleProduct(scheduleFor.id, new Date(scheduleAt).toISOString()), "Scheduled");
                  setScheduleFor(null);
                }}
                className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

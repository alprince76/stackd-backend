"use client";

import { useTransition } from "react";
import { subscribeNewsletter } from "@/lib/actions/app";
import { toast } from "sonner";

export function NewsletterSubscribe() {
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-6 flex gap-2"
      onSubmit={e => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email") as string;
        startTransition(async () => {
          const res = await subscribeNewsletter(email);
          if (res?.error) toast.error(res.error);
          else toast.success("Subscribed!");
        });
      }}
    >
      <input name="email" type="email" required placeholder="you@email.com" className="flex-1 rounded-xl border border-border px-3 py-2 text-sm" />
      <button type="submit" disabled={pending} className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
        Subscribe
      </button>
    </form>
  );
}

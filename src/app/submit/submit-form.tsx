"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { submitProduct } from "@/lib/actions/app";
import { toast } from "sonner";

const STEPS = ["Basic Info", "Media", "Details", "Preview"] as const;

export default function SubmitForm({
  categories,
}: {
  categories: { slug: string; name: string; emoji: string }[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "", tagline: "", description: "",
    thumbnailUrl: "", category: "saas", tags: "", website: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const res = await submitProduct(fd);
      if (res?.error) {
        if (res.error === "Please sign in") router.push("/login");
        else toast.error(res.error);
        return;
      }
      setDone(true);
      toast.success("Product submitted for review");
    });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl">🎉</div>
        <h1 className="mt-6 text-3xl font-bold text-navy">Your product has been submitted</h1>
        <p className="mt-3 text-muted-foreground">Our team will review it shortly.</p>
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Link href="/" className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy sm:text-4xl">Launch your product</h1>
      <p className="mt-2 text-muted-foreground">Get in front of thousands of early adopters in Indonesia & SEA.</p>

      <ol className="mt-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              i < step ? "bg-success text-white" : i === step ? "bg-gradient-brand text-white" : "bg-light-gray text-muted-foreground"
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <input placeholder="Product name" value={form.name} onChange={update("name")} className="w-full rounded-xl border border-border px-3 py-2" />
            <input placeholder="Tagline" value={form.tagline} onChange={update("tagline")} className="w-full rounded-xl border border-border px-3 py-2" />
            <select value={form.category} onChange={update("category")} className="w-full rounded-xl border border-border px-3 py-2">
              {categories.map(c => <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
        )}
        {step === 1 && (
          <input placeholder="Thumbnail URL (optional)" value={form.thumbnailUrl} onChange={update("thumbnailUrl")} className="w-full rounded-xl border border-border px-3 py-2" />
        )}
        {step === 2 && (
          <div className="space-y-4">
            <textarea placeholder="Description" value={form.description} onChange={update("description")} rows={5} className="w-full rounded-xl border border-border px-3 py-2" />
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={update("tags")} className="w-full rounded-xl border border-border px-3 py-2" />
            <input placeholder="Website URL" value={form.website} onChange={update("website")} className="w-full rounded-xl border border-border px-3 py-2" />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-2 text-sm">
            <div className="font-bold text-navy">{form.name || "Product name"}</div>
            <div className="text-muted-foreground">{form.tagline}</div>
            <p className="mt-2">{form.description}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button type="button" onClick={() => setStep(s => s + 1)} className="rounded-xl bg-navy px-5 py-2 text-sm font-semibold text-white">Continue</button>
        ) : (
          <button type="button" disabled={pending} onClick={handleSubmit} className="rounded-xl bg-gradient-brand px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Submit for review
          </button>
        )}
      </div>
    </div>
  );
}

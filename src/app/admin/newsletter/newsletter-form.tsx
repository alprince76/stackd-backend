"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, X } from "lucide-react";
import { saveNewsletter } from "@/lib/actions/app";
import { toast } from "sonner";

type FormData = {
  id?: string;
  title: string;
  shortDescription: string;
  content: string;
  coverImageUrl: string;
  publishDate: string;
  status: "draft" | "scheduled" | "published";
};

const EMPTY: FormData = {
  title: "",
  shortDescription: "",
  content: "",
  coverImageUrl: "",
  publishDate: new Date().toISOString().slice(0, 10),
  status: "draft",
};

export function NewsletterForm({ initial }: { initial?: FormData }) {
  const router = useRouter();
  const [tr, start] = useTransition();
  const [form, setForm] = useState<FormData>(initial ?? EMPTY);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (status: "draft" | "published") => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.shortDescription.trim()) { toast.error("Short description is required"); return; }
    if (!form.content.trim()) { toast.error("Content is required"); return; }

    start(async () => {
      const res = await saveNewsletter({
        id: form.id,
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        content: form.content.trim(),
        coverImageUrl: form.coverImageUrl.trim() || undefined,
        publishDate: form.publishDate,
        status,
        featuredProductIds: [],
      });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(status === "published" ? "Newsletter published!" : "Saved as draft");
        router.push("/admin/newsletter");
        router.refresh();
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-coral">Admin</div>
          <h1 className="mt-1 text-2xl font-bold text-navy">
            {form.id ? "Edit Newsletter" : "New Newsletter"}
          </h1>
        </div>
        <button type="button" onClick={() => router.push("/admin/newsletter")}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-light-gray">
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>

      {/* Form */}
      <div className="mt-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-navy">
            Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            placeholder="Newsletter title"
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Short description */}
        <div>
          <label className="block text-sm font-semibold text-navy">
            Short Description <span className="text-error">*</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">{form.shortDescription.length}/200</span>
          </label>
          <textarea
            value={form.shortDescription}
            onChange={set("shortDescription")}
            maxLength={200}
            rows={2}
            placeholder="A brief summary shown in the newsletter list…"
            className="mt-1.5 w-full resize-none rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-navy">
            Content <span className="text-error">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={set("content")}
            rows={12}
            placeholder="Write the full newsletter content here…"
            className="mt-1.5 w-full resize-y rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {/* Row: publish date + status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-navy">Publish Date</label>
            <input
              type="date"
              value={form.publishDate}
              onChange={set("publishDate")}
              className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-navy">Status</label>
            <select
              value={form.status}
              onChange={set("status")}
              className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        {/* Cover image URL */}
        <div>
          <label className="block text-sm font-semibold text-navy">
            Cover Image URL <span className="text-muted-foreground text-xs font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={form.coverImageUrl}
            onChange={set("coverImageUrl")}
            placeholder="https://…"
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
          {form.coverImageUrl && (
            <img src={form.coverImageUrl} alt="cover preview" className="mt-3 h-32 w-full rounded-xl object-cover border border-border" />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-6">
          <button type="button" disabled={tr} onClick={() => submit("draft")}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-navy hover:bg-light-gray disabled:opacity-50">
            <Save className="h-4 w-4" /> Save as Draft
          </button>
          <button type="button" disabled={tr} onClick={() => submit("published")}
            className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            <Send className="h-4 w-4" /> Publish
          </button>
        </div>
      </div>
    </div>
  );
}

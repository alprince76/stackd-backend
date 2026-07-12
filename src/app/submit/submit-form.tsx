"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef } from "react";
import { Check, ChevronLeft, X, Plus } from "lucide-react";
import { submitProduct } from "@/lib/actions/app";
import { toast } from "sonner";

const STEPS = ["Basic Info", "Media", "Details", "Preview"] as const;

const PRESET_TAGS = [
  "saas", "open-source", "ai", "mobile", "developer-tools",
  "design", "productivity", "marketplace", "fintech", "edtech",
];

const MAX_TAGS = 5;

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
    name: "",
    tagline: "",
    description: "",
    category: categories[0]?.slug ?? "saas",
    website: "",
    videoUrl: "",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coMakers, setCoMakers] = useState<string[]>([]);
  const [coMakerInput, setCoMakerInput] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 4;

  const addImages = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    setImages(prev => {
      const combined = [...prev, ...arr].slice(0, MAX_IMAGES);
      setImagePreviews(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
  };

  const removeImage = (idx: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setImagePreviews(next.map(f => URL.createObjectURL(f)));
      return next;
    });
  };

  const tagInputRef = useRef<HTMLInputElement>(null);
  const coMakerInputRef = useRef<HTMLInputElement>(null);

  const update = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const addTag = (tag: string) => {
    const t = tag.toLowerCase().trim().replace(/\s+/g, "-");
    if (!t || tags.includes(t) || tags.length >= MAX_TAGS) return;
    setTags(prev => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const togglePresetTag = (tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else if (tags.length < MAX_TAGS) {
      setTags(prev => [...prev, tag]);
    }
  };

  const addCoMaker = (username: string) => {
    const u = username.replace(/^@/, "").trim();
    if (!u || coMakers.includes(u)) return;
    setCoMakers(prev => [...prev, u]);
    setCoMakerInput("");
  };

  const removeCoMaker = (u: string) => setCoMakers(prev => prev.filter(m => m !== u));

  const handleSubmit = () => {
    if (!form.name || !form.tagline || !form.description || !form.website) {
      toast.error("Please fill in all required fields");
      return;
    }
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("tagline", form.tagline);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("website", form.website);
    fd.append("videoUrl", form.videoUrl);
    fd.append("tags", tags.join(","));
    fd.append("coMakers", coMakers.join(","));
    fd.append("thumbnailUrl", "");

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
            <span className="hidden text-xs text-muted-foreground sm:block">{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">

        {/* Step 0 — Basic Info */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-navy">Product name <span className="text-error">*</span></label>
              <input
                placeholder="e.g. InvoiceKit"
                value={form.name}
                onChange={update("name")}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-navy">Tagline <span className="text-error">*</span></label>
                <span className={`text-xs ${form.tagline.length > 55 ? "text-error" : "text-muted-foreground"}`}>
                  {60 - form.tagline.length} chars left
                </span>
              </div>
              <input
                placeholder="Short description of your product"
                value={form.tagline}
                onChange={update("tagline")}
                maxLength={60}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Category <span className="text-error">*</span></label>
              <select
                value={form.category}
                onChange={update("category")}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              >
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Co-makers <span className="text-xs font-normal text-muted-foreground">(optional)</span></label>
              <p className="mb-2 text-xs text-muted-foreground">Add teammates by username</p>
              <div className="flex gap-2">
                <input
                  ref={coMakerInputRef}
                  placeholder="@username"
                  value={coMakerInput}
                  onChange={e => setCoMakerInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); addCoMaker(coMakerInput); }
                  }}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => addCoMaker(coMakerInput)}
                  className="rounded-xl border border-border px-3 py-2 text-sm text-navy hover:bg-light-gray"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {coMakers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {coMakers.map(u => (
                    <span key={u} className="flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1 text-xs font-medium text-navy">
                      @{u}
                      <button type="button" onClick={() => removeCoMaker(u)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — Media */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-navy">
                  Images <span className="text-xs font-normal text-muted-foreground">(max {MAX_IMAGES} · first = thumbnail)</span>
                </span>
                <span className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
              </div>

              {/* Drop Zone — shown only when space remains */}
              {images.length < MAX_IMAGES && (
                <div
                  className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                    dragOver ? "border-navy bg-navy/5" : "border-border bg-light-gray hover:border-navy"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files.length) addImages(e.dataTransfer.files);
                  }}
                >
                  <svg className="mx-auto h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-navy">
                    {dragOver ? "Drop to upload" : "Drop images here or click to upload"}
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF · Min 800×400px</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => { if (e.target.files) addImages(e.target.files); e.target.value = ""; }}
              />

              {/* Preview Grid */}
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {imagePreviews.map((src, idx) => (
                    <div key={idx} className="group relative aspect-square">
                      <img
                        src={src}
                        alt={`Image ${idx + 1}`}
                        className="h-full w-full rounded-xl object-cover border border-border"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-md bg-navy/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          Thumbnail
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-navy">
                Video demo URL <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                placeholder="https://youtube.com/watch?v=..."
                value={form.videoUrl}
                onChange={update("videoUrl")}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Details */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-navy">Description <span className="text-error">*</span></label>
                <span className={`text-xs ${form.description.length > 460 ? "text-error" : "text-muted-foreground"}`}>
                  {500 - form.description.length} chars left
                </span>
              </div>
              <textarea
                placeholder="What does your product do? Who is it for?"
                value={form.description}
                onChange={update("description")}
                maxLength={500}
                rows={6}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Tags <span className="text-xs font-normal text-muted-foreground">(max {MAX_TAGS})</span></label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePresetTag(tag)}
                    disabled={!tags.includes(tag) && tags.length >= MAX_TAGS}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      tags.includes(tag)
                        ? "bg-navy text-white"
                        : "bg-light-gray text-navy hover:bg-border disabled:opacity-40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  ref={tagInputRef}
                  placeholder="Custom tag (press Enter)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  disabled={tags.length >= MAX_TAGS}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
                  }}
                  className="flex-1 rounded-xl border border-border px-3 py-2 text-sm disabled:opacity-50"
                />
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 rounded-full bg-navy text-white px-3 py-1 text-xs font-medium">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-navy">Website URL <span className="text-error">*</span></label>
              <input
                placeholder="https://yourproduct.com"
                value={form.website}
                onChange={update("website")}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Step 3 — Preview */}
        {step === 3 && (
          <div className="space-y-4 text-sm">
            {imagePreviews[0] && (
              <img src={imagePreviews[0]} alt="Thumbnail" className="h-40 w-full rounded-xl object-cover" />
            )}
            <div className="font-bold text-navy text-lg">{form.name || "Product name"}</div>
            <div className="text-muted-foreground">{form.tagline}</div>
            {form.description && <p className="text-muted-foreground leading-relaxed">{form.description}</p>}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map(t => (
                  <span key={t} className="rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">#{t}</span>
                ))}
              </div>
            )}
            {form.website && (
              <p className="text-xs text-muted-foreground">🔗 {form.website}</p>
            )}
            {form.videoUrl && (
              <p className="text-xs text-muted-foreground">🎬 {form.videoUrl}</p>
            )}
            {coMakers.length > 0 && (
              <p className="text-xs text-muted-foreground">Co-makers: {coMakers.map(u => `@${u}`).join(", ")}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(s => s - 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="rounded-xl bg-navy px-5 py-2 text-sm font-semibold text-white"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={handleSubmit}
            className="rounded-xl bg-gradient-brand px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Submit for review
          </button>
        )}
      </div>
    </div>
  );
}

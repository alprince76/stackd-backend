"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";
import { updateProfile } from "@/lib/actions/app";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

type InitialData = {
  name: string;
  bio: string;
  twitter: string;
  linkedin: string;
  website: string;
  city: string;
  avatarUrl: string;
};

export function SettingsForm({ initial }: { initial: InitialData }) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [pending, startTransition] = useTransition();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<InitialData>(initial);

  const update = (k: keyof InitialData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm(f => ({ ...f, avatarUrl: preview }));
    setAvatarUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, avatarUrl: url }));
    } catch {
      toast.error("Avatar upload failed. Please try again.");
      setForm(f => ({ ...f, avatarUrl: initial.avatarUrl }));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    startTransition(async () => {
      const res = await updateProfile(fd);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Profile updated");
      await updateSession({ name: form.name });
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Edit profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">Update your public profile information.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Avatar upload */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={form.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`}
              alt="Avatar"
              className="h-20 w-20 rounded-2xl border border-border bg-light-gray object-cover"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-white shadow-sm hover:bg-light-gray disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5 text-navy" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-navy">Profile photo</p>
            <p className="text-xs text-muted-foreground">
              {avatarUploading ? "Uploading…" : "Click the camera icon to change"}
            </p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-navy">Display name</label>
          <input
            name="name"
            value={form.name}
            onChange={update("name")}
            required
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-navy">Bio</label>
            <span className={`text-xs ${form.bio.length > 140 ? "text-error" : "text-muted-foreground"}`}>
              {160 - form.bio.length} chars left
            </span>
          </div>
          <textarea
            name="bio"
            value={form.bio}
            onChange={update("bio")}
            maxLength={160}
            rows={3}
            placeholder="Tell the community about yourself…"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-navy">City</label>
          <input
            name="city"
            value={form.city}
            onChange={update("city")}
            placeholder="e.g. Jakarta"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-navy">Twitter / X</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
            <input
              name="twitter"
              value={form.twitter}
              onChange={update("twitter")}
              placeholder="username"
              className="w-full rounded-xl border border-border py-2 pl-7 pr-3 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-navy">LinkedIn URL</label>
          <input
            name="linkedin"
            value={form.linkedin}
            onChange={update("linkedin")}
            placeholder="https://linkedin.com/in/yourname"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-navy">Website</label>
          <input
            name="website"
            value={form.website}
            onChange={update("website")}
            placeholder="https://yourwebsite.com"
            className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

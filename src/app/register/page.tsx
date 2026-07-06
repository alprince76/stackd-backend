"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { registerUser } from "@/lib/actions/app";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Join Stackd to upvote, comment, and launch products.</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await registerUser(fd);
            if (res?.error) {
              setError(res.error);
              toast.error(res.error);
              return;
            }
            toast.success("Account created");
            router.push("/");
            router.refresh();
          });
        }}
      >
        <div>
          <label className="text-sm font-medium text-navy">Name</label>
          <input name="name" required className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Username</label>
          <input name="username" required pattern="[a-z0-9]+" className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Password</label>
          <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white disabled:opacity-50">
          Create account
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="font-semibold text-navy">Sign in</Link>
      </p>
    </div>
  );
}

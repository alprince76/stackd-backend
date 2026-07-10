"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { loginUser } from "@/lib/actions/app";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setGooglePending(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome back to Stackd.
      </p>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googlePending}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border py-3 text-sm font-semibold text-navy transition-colors hover:bg-light-gray disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {googlePending ? "Redirecting…" : "Continue with Google"}
        </button>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="mx-3 text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await loginUser(fd);
            if (res?.error) {
              setError(res.error);
              toast.error(res.error);
              return;
            }
            toast.success("Signed in");
            router.push("/");
            router.refresh();
          });
        }}
      >
        <div>
          <label className="text-sm font-medium text-navy">Email</label>
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Password</label>
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm" />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        <button type="submit" disabled={pending} className="w-full rounded-xl bg-navy py-3 text-sm font-semibold text-white disabled:opacity-50">
          Sign in
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        No account? <Link href="/register" className="font-semibold text-navy">Register</Link>
      </p>
    </div>
  );
}

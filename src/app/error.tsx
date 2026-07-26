"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-coral">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-bold text-navy">We hit a snag</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-navy hover:bg-light-gray"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

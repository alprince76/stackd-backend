import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute -top-24 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-10 blur-3xl" />
      <div className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:py-32">
        <p className="text-xs font-semibold uppercase tracking-wider text-coral">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          This page doesn’t exist
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          The link may be broken, or the product / creator you’re looking for isn’t here.
          Let’s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <Link
            href="/creators"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-navy hover:bg-light-gray"
          >
            <Compass className="h-4 w-4" />
            Browse creators
          </Link>
        </div>
        <p className="mt-10 text-xs font-medium text-muted-foreground">Stackd · Spotlighting what’s next</p>
      </div>
    </div>
  );
}

import Link from "next/link";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <svg viewBox="0 0 160 160" className={className} aria-hidden>
        <defs>
          <linearGradient id="l1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#FF3D6B" />
          </linearGradient>
          <linearGradient id="l2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C84B9E" />
            <stop offset="100%" stopColor="#9B35C8" />
          </linearGradient>
          <linearGradient id="l3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7B35C8" />
            <stop offset="100%" stopColor="#5535C8" />
          </linearGradient>
        </defs>
        <path d="M20 56 L80 36 L140 56 L80 76 Z" fill="url(#l1)" />
        <path d="M20 82 L80 62 L140 82 L80 102 Z" fill="url(#l2)" />
        <path d="M20 108 L80 88 L140 108 L80 128 Z" fill="url(#l3)" />
      </svg>
      <span className="text-xl font-bold tracking-tight text-navy">
        Stackd<span className="text-coral">.</span>
      </span>
    </Link>
  );
}

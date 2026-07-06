import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-light-gray/50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Stackd is the home for digital products built in Indonesia and Southeast Asia.
          </p>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Product</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-navy">Discover</Link></li>
            <li><Link href="/submit" className="hover:text-navy">Submit</Link></li>
            <li><Link href="/creators" className="hover:text-navy">Creators</Link></li>
            <li><Link href="/newsletter" className="hover:text-navy">Newsletter</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-navy">Stackd</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a className="hover:text-navy" href="#">About</a></li>
            <li><a className="hover:text-navy" href="#">Twitter</a></li>
            <li><a className="hover:text-navy" href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 Stackd · Made in Jakarta
      </div>
    </footer>
  );
}

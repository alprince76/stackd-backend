import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) {
    redirect("/login");
  }

  return (
    <div>
      <div className="border-b border-border bg-light-gray/50">
        <div className="mx-auto flex max-w-6xl gap-4 px-4 py-3 text-sm">
          <Link href="/admin/dashboard" className="font-semibold text-navy">Dashboard</Link>
          <Link href="/admin/queue" className="text-muted-foreground hover:text-navy">Queue</Link>
          <Link href="/admin/newsletter" className="text-muted-foreground hover:text-navy">Newsletter</Link>
        </div>
      </div>
      {children}
    </div>
  );
}

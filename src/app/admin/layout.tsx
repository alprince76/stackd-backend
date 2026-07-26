import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) {
    redirect("/login");
  }

  // Fetch pending count for queue badge
  // Note: "underReview" is included after migration runs on Vercel deploy
  const pendingCount = await prisma.product.count({
    where: { status: "pending" },
  });

  const isSuperAdmin = session.user.roles.includes("superadmin");

  return (
    <div className="flex h-screen overflow-hidden bg-light-gray/40">
      <AdminSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          avatarUrl: session.user.avatarUrl,
        }}
        pendingCount={pendingCount}
        isSuperAdmin={isSuperAdmin}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminUsersClient } from "./users-client";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user.roles.includes("superadmin")) {
    redirect("/admin/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { username: { not: { startsWith: "voter" } } },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatarUrl: true,
      createdAt: true,
      roles: { select: { role: true } },
      _count: { select: { products: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatarUrl: u.avatarUrl,
    roles: u.roles.map(r => r.role as string),
    productCount: u._count.products,
    joinedAt: u.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return <AdminUsersClient users={mapped} />;
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, bio: true, twitter: true, linkedin: true, website: true, city: true, avatarUrl: true },
  });

  return (
    <SettingsForm
      initial={{
        name: user?.name ?? session.user.name ?? "",
        bio: user?.bio ?? "",
        twitter: user?.twitter ?? "",
        linkedin: user?.linkedin ?? "",
        website: user?.website ?? "",
        city: user?.city ?? "",
        avatarUrl: user?.avatarUrl ?? session.user.avatarUrl ?? "",
      }}
    />
  );
}

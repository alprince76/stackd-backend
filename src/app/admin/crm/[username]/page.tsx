import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Globe, Twitter, Linkedin, Package, Users, Calendar } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminCrmDetailPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatarUrl: true,
      bio: true,
      city: true,
      twitter: true,
      linkedin: true,
      website: true,
      createdAt: true,
      roles: { select: { role: true } },
      _count: {
        select: {
          products: true,
          followers: true,
          following: true,
          votes: true,
          comments: true,
        },
      },
      products: {
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          slug: true,
          name: true,
          tagline: true,
          thumbnailUrl: true,
          status: true,
          publishedAt: true,
          _count: { select: { votes: true, comments: { where: { deletedAt: null } } } },
        },
      },
    },
  });

  if (!user) notFound();

  const roles = user.roles.map(r => r.role);
  const joinedAt = user.createdAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const statusColor: Record<string, string> = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    underReview: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    scheduled: "bg-light-gray text-muted-foreground",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/admin/crm"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to CRM
      </Link>

      <div className="mt-6 rounded-2xl border border-border bg-white p-6">
        <div className="flex flex-wrap items-start gap-5">
          <img
            src={user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.name}
            className="h-20 w-20 rounded-2xl border border-border object-cover"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-navy">{user.name}</h1>
            <p className="text-sm text-muted-foreground">@{user.username} · {user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roles.map(r => (
                <span
                  key={r}
                  className="rounded-full bg-light-gray px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy"
                >
                  {r}
                </span>
              ))}
            </div>
            {user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {user.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {user.city}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Joined {joinedAt}
              </span>
              {user.website && (
                <a href={user.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-navy">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-navy">
                  <Twitter className="h-3.5 w-3.5" /> @{user.twitter}
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-navy">
                  <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Products", value: user._count.products, icon: Package },
            { label: "Followers", value: user._count.followers, icon: Users },
            { label: "Following", value: user._count.following, icon: Users },
            { label: "Votes cast", value: user._count.votes, icon: Package },
            { label: "Comments", value: user._count.comments, icon: Package },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border bg-light-gray/40 px-3 py-3 text-center">
              <div className="text-lg font-bold text-navy">{s.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Products ({user.products.length})
        </h2>
        {user.products.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No products for this user.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {user.products.map(p => (
              <li
                key={p.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4"
              >
                <img
                  src={p.thumbnailUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${p.id}`}
                  alt=""
                  className="h-12 w-12 rounded-xl border border-border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-navy">{p.name}</div>
                  <p className="truncate text-xs text-muted-foreground">{p.tagline}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${statusColor[p.status] ?? statusColor.pending}`}>
                      {p.status}
                    </span>
                    <span>{p._count.votes} votes</span>
                    <span>{p._count.comments} comments</span>
                  </div>
                </div>
                {p.status === "approved" && (
                  <Link
                    href={`/products/${p.slug}`}
                    className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-light-gray"
                  >
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowBigUp, ExternalLink, MessageCircle, Globe,
  ChevronLeft, ChevronRight, Twitter, Linkedin, Link2,
} from "lucide-react";
import { toggleVote, addComment, toggleFollow } from "@/lib/actions/app";
import type { ProductWithMeta, TeamMember } from "@/lib/types";
import { toast } from "sonner";

type CommentReply = {
  id: string;
  text: string;
  createdAt: string;
  author: { username: string; name: string; avatarUrl: string | null };
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  author: { username: string; name: string; avatarUrl: string | null };
  replies: CommentReply[];
};

function MemberCard({ member }: { member: TeamMember }) {
  const [following, setFollowing] = useState(false);
  const [followPending, startFollow] = useTransition();

  const handleFollow = () => {
    startFollow(async () => {
      const res = await toggleFollow(member.user.username);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      setFollowing(f => !f);
    });
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
      <Link href={`/u/${member.user.username}`} className="shrink-0">
        <img
          src={member.user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user.username}`}
          alt={member.user.name}
          className="h-10 w-10 rounded-full border border-border"
        />
      </Link>
      <div className="min-w-0 flex-1">
        {/* Name + badge + Follow button all in one row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Link href={`/u/${member.user.username}`} className="truncate text-sm font-semibold text-navy hover:underline">
              {member.user.name}
            </Link>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              member.role === "hunter"
                ? "bg-amber-100 text-amber-700"
                : "bg-green-100 text-green-700"
            }`}>
              {member.role === "hunter" ? "Hunter" : "Maker"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFollow}
            disabled={followPending}
            className={`shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold transition-colors ${
              following
                ? "border-navy bg-navy text-white"
                : "border-border text-navy hover:bg-light-gray"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
        {member.user.bio && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{member.user.bio}</p>
        )}
        {member.user.city && (
          <p className="mt-0.5 text-xs text-muted-foreground">{member.user.city}</p>
        )}
        {(member.user.twitter || member.user.linkedin || member.user.website) && (
          <div className="mt-1.5 flex items-center gap-2">
            {member.user.twitter && (
              <a href={`https://twitter.com/${member.user.twitter}`} target="_blank" rel="noreferrer"
                className="text-muted-foreground hover:text-navy" title={`@${member.user.twitter}`}>
                <Twitter className="h-3.5 w-3.5" />
              </a>
            )}
            {member.user.linkedin && (
              <a href={member.user.linkedin} target="_blank" rel="noreferrer"
                className="text-muted-foreground hover:text-navy" title="LinkedIn">
                <Linkedin className="h-3.5 w-3.5" />
              </a>
            )}
            {member.user.website && (
              <a href={member.user.website} target="_blank" rel="noreferrer"
                className="text-muted-foreground hover:text-navy" title={member.user.website}>
                <Link2 className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductDetailClient({
  product,
  category,
  comments: initialComments,
}: {
  product: ProductWithMeta;
  category?: { slug: string; name: string; emoji: string };
  comments: Comment[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState("");
  const [shotIdx, setShotIdx] = useState(0);
  const [upvotes, setUpvotes] = useState(product.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(product.hasUpvoted);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fallbackImg = `https://api.dicebear.com/7.x/shapes/svg?seed=${product.slug}`;
  const screenshots = product.screenshotUrls.length
    ? product.screenshotUrls
    : [product.thumbnailUrl ?? fallbackImg];

  // Build full team: primary maker + additional team members (deduped)
  const primaryMaker: TeamMember = {
    userId: "",
    role: "maker",
    user: product.maker,
  };
  const teamMakerUsernames = new Set(product.teamMembers.map(m => m.user.username));
  const fullTeam: TeamMember[] = teamMakerUsernames.has(product.maker.username)
    ? product.teamMembers
    : [primaryMaker, ...product.teamMembers];

  const handleVote = () => {
    startTransition(async () => {
      const res = await toggleVote(product.id);
      if (res?.error) {
        if (res.error === "Please sign in") router.push("/login");
        else toast.error(res.error);
        return;
      }
      if (res.upvotes !== undefined) {
        setUpvotes(res.upvotes);
        setHasUpvoted(res.hasUpvoted ?? false);
      }
      router.refresh();
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await addComment(product.id, text.trim());
      if (res?.error) {
        if (res.error === "Please sign in") router.push("/login");
        else toast.error(res.error);
        return;
      }
      setText("");
      toast.success("Comment posted");
      router.refresh();
    });
  };

  const handleReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    startTransition(async () => {
      const res = await addComment(product.id, replyText.trim(), parentId);
      if (res?.error) {
        if (res.error === "Please sign in") router.push("/login");
        else toast.error(res.error);
        return;
      }
      setReplyText("");
      setReplyTo(null);
      toast.success("Reply posted");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 sm:gap-6">
        <img src={product.thumbnailUrl ?? fallbackImg} alt={product.name} className="h-16 w-16 shrink-0 rounded-2xl border border-border bg-light-gray sm:h-24 sm:w-24" />
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-navy sm:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{product.tagline}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {category && (
              <Link href={`/category/${category.slug}`} className="rounded-md bg-light-gray px-2 py-1 text-xs font-medium text-navy hover:bg-border">
                {category.emoji} {category.name}
              </Link>
            )}
            {product.tags.map(t => (
              <span key={t} className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">#{t}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <button
            onClick={handleVote}
            disabled={pending}
            className={`flex flex-col items-center justify-center rounded-xl border px-4 py-2 transition-all sm:px-5 sm:py-3 ${
              hasUpvoted ? "border-transparent bg-gradient-brand text-white" : "border-border bg-white text-navy hover:border-navy"
            }`}
          >
            <ArrowBigUp className={`h-5 w-5 ${hasUpvoted ? "fill-white" : ""}`} />
            <span className="text-sm font-bold">{upvotes}</span>
          </button>
          <a href={product.website} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white sm:px-5 sm:py-3">
            Try it <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <section className="mt-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-light-gray">
          <img src={screenshots[shotIdx]} alt="" className="aspect-[16/9] w-full object-cover" />
          {screenshots.length > 1 && (
            <>
              <button type="button" onClick={() => setShotIdx(i => (i - 1 + screenshots.length) % screenshots.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setShotIdx(i => (i + 1) % screenshots.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-card">
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {product.videoUrl && (
          <a
            href={product.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Watch demo video
          </a>
        )}
      </section>

      <div className="mt-10 grid gap-8 md:grid-cols-[1fr_280px]">
        <div>
          <h2 className="text-xl font-bold text-navy">About {product.name}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{product.description}</p>

          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-xl font-bold text-navy">Discussion</h2>
              <span className="rounded-md bg-light-gray px-2 py-0.5 text-xs font-medium text-navy">{initialComments.length}</span>
            </div>
            <form onSubmit={handleComment} className="mb-6 rounded-2xl border border-border bg-card p-3">
              <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
                placeholder="What do you think of this product?"
                className="w-full resize-none rounded-lg border-0 bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground" />
              <div className="flex justify-end">
                <button type="submit" disabled={!text.trim() || pending}
                  className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  Post comment
                </button>
              </div>
            </form>
            <ul className="space-y-4">
              {initialComments.map(c => (
                <li key={c.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex gap-3">
                    <img src={c.author.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author.username}`} alt="" className="h-9 w-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-navy">{c.author.name}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{c.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTo(r => r === c.id ? null : c.id);
                            setReplyText("");
                          }}
                          className="text-xs font-medium text-muted-foreground hover:text-navy"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline reply form */}
                  {replyTo === c.id && (
                    <form onSubmit={e => handleReply(e, c.id)} className="mt-3 ml-12 rounded-xl border border-border bg-white p-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={2}
                        placeholder={`Reply to ${c.author.name}…`}
                        className="w-full resize-none rounded-lg border-0 bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
                        autoFocus
                      />
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setReplyTo(null); setReplyText(""); }}
                          className="text-xs text-muted-foreground hover:text-navy"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!replyText.trim() || pending}
                          className="rounded-lg bg-navy px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          Post reply
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Nested replies */}
                  {c.replies.length > 0 && (
                    <ul className="mt-3 ml-12 space-y-3">
                      {c.replies.map(r => (
                        <li key={r.id} className="flex gap-3 rounded-xl border border-border bg-white p-3">
                          <img src={r.author.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.author.username}`} alt="" className="h-7 w-7 shrink-0 rounded-full" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-navy">{r.author.name}</div>
                            <p className="mt-0.5 text-sm text-muted-foreground">{r.text}</p>
                            <div className="mt-1 text-xs text-muted-foreground">{r.createdAt}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          {/* Team / Makers section */}
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {fullTeam.length > 1 ? "Team" : "Maker"}
            </div>
            <div className="mt-3 space-y-3">
              {fullTeam.map((member, i) => (
                <MemberCard key={`${member.user.username}-${i}`} member={member} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {product.comments} comments</div>
            <div className="mt-2 flex items-center gap-2"><Globe className="h-4 w-4" /> Launch {product.launchDate}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

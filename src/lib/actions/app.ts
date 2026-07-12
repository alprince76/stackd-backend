"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";
import { Role } from "@prisma/client";
import { slugify } from "@/lib/utils";

export async function registerUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").toLowerCase().trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !username || !name) {
    return { error: "All fields are required" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) return { error: "Email or username already taken" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      username,
      name,
      passwordHash,
      emailVerified: new Date(),
      roles: { create: [{ role: Role.user }] },
    },
  });

  await signIn("credentials", { email, password, redirect: false });
  return { success: true };
}

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch {
    return { error: "Invalid email or password" };
  }
}

export async function toggleVote(productId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in" };

  const existing = await prisma.vote.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.vote.delete({
      where: { userId_productId: { userId: session.user.id, productId } },
    });
  } else {
    await prisma.vote.create({
      data: { userId: session.user.id, productId },
    });
  }

  const count = await prisma.vote.count({ where: { productId } });
  revalidatePath("/");
  revalidatePath(`/products/${productId}`);
  return { upvotes: count, hasUpvoted: !existing };
}

export async function addComment(productId: string, text: string, parentId?: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in" };
  if (!text.trim()) return { error: "Comment cannot be empty" };

  await prisma.comment.create({
    data: {
      productId,
      authorId: session.user.id,
      text: text.trim(),
      parentId: parentId ?? null,
    },
  });

  revalidatePath(`/products/${productId}`);
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Not found" };

  const isAdmin = session.user.roles.includes("admin");
  if (comment.authorId !== session.user.id && !isAdmin) {
    return { error: "Forbidden" };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/products/${comment.productId}`);
  return { success: true };
}

export async function submitProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in" };

  const name = String(formData.get("name") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "saas");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 5);
  const website = String(formData.get("website") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim() || null;
  const screenshotUrls = String(formData.get("screenshotUrls") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  const videoUrl = String(formData.get("videoUrl") ?? "").trim() || null;
  const coMakers = String(formData.get("coMakers") ?? "")
    .split(",")
    .map(u => u.trim())
    .filter(Boolean);

  if (!name || !tagline || !description || !website) {
    return { error: "Please fill required fields" };
  }
  if (tagline.length > 60) return { error: "Tagline must be 60 characters or less" };
  if (description.length > 500) return { error: "Description must be 500 characters or less" };

  const slug = slugify(name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) return { error: "A product with this name already exists" };

  await prisma.userRole.upsert({
    where: { userId_role: { userId: session.user.id, role: Role.maker } },
    create: { userId: session.user.id, role: Role.maker },
    update: {},
  });

  const id = `sub-${Date.now()}`;
  const product = await prisma.product.create({
    data: {
      id,
      slug,
      name,
      tagline,
      description,
      thumbnailUrl,
      screenshotUrls,
      videoUrl,
      categoryId: category,
      tags,
      launchDate: new Date(),
      website,
      makerId: session.user.id,
      status: "pending",
    },
  });

  // Link co-makers (best-effort; skip unknown usernames)
  if (coMakers.length > 0) {
    const coMakerUsers = await prisma.user.findMany({
      where: { username: { in: coMakers } },
      select: { id: true },
    });
    await prisma.productMaker.createMany({
      data: coMakerUsers.map(u => ({
        productId: product.id,
        userId: u.id,
        role: "maker" as const,
      })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/admin/queue");
  revalidatePath(`/u/${session.user.username}`);
  return { success: true, slug };
}

export async function approveProduct(productId: string) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) return { error: "Forbidden" };

  const now = new Date();
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: "approved",
      publishedAt: now,
      launchDate: now,
    },
  });

  revalidatePath("/admin/queue");
  revalidatePath("/");
  return { success: true };
}

export async function rejectProduct(productId: string) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) return { error: "Forbidden" };

  await prisma.product.update({
    where: { id: productId },
    data: { status: "rejected", publishedAt: null },
  });

  revalidatePath("/admin/queue");
  return { success: true };
}

export async function scheduleProduct(productId: string, scheduledAtIso: string) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) return { error: "Forbidden" };

  const scheduledAt = new Date(scheduledAtIso);
  const isPast = scheduledAt <= new Date();
  const approvalNow = isPast ? new Date() : null;
  await prisma.product.update({
    where: { id: productId },
    data: {
      status: isPast ? "approved" : "scheduled",
      scheduledAt,
      publishedAt: approvalNow,
      launchDate: approvalNow ?? undefined,
    },
  });

  revalidatePath("/admin/queue");
  revalidatePath("/");
  return { success: true };
}

export async function toggleFollow(username: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in" };

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) return { error: "User not found" };
  if (target.id === session.user.id) return { error: "Cannot follow yourself" };

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: target.id,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: target.id,
        },
      },
    });
    return { following: false };
  }

  await prisma.follow.create({
    data: { followerId: session.user.id, followingId: target.id },
  });
  return { following: true };
}

export async function subscribeNewsletter(email: string) {
  const normalized = email.toLowerCase().trim();
  if (!normalized.includes("@")) return { error: "Invalid email" };

  await prisma.newsletterSubscriber.upsert({
    where: { email: normalized },
    create: { email: normalized, confirmedAt: new Date() },
    update: {},
  });

  return { success: true };
}

export async function saveNewsletter(data: {
  id?: string;
  title: string;
  shortDescription: string;
  content: string;
  coverImageUrl?: string;
  publishDate: string;
  status: "draft" | "scheduled" | "published";
  featuredProductIds: string[];
}) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) return { error: "Forbidden" };

  const slug = slugify(data.title);
  const id = data.id ?? `n-${Date.now()}`;

  await prisma.newsletter.upsert({
    where: { id },
    create: {
      id,
      slug,
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? null,
      publishDate: new Date(data.publishDate),
      status: data.status,
      featuredProductIds: data.featuredProductIds,
    },
    update: {
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      coverImageUrl: data.coverImageUrl ?? null,
      publishDate: new Date(data.publishDate),
      status: data.status,
      featuredProductIds: data.featuredProductIds,
    },
  });

  revalidatePath("/admin/newsletter");
  revalidatePath("/newsletter");
  return { success: true };
}

export async function deleteNewsletter(id: string) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) return { error: "Forbidden" };

  await prisma.newsletter.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
  return { success: true };
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const twitter = String(formData.get("twitter") ?? "").replace(/^@/, "").trim();

  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim() || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: String(formData.get("name") ?? session.user.name).trim() || session.user.name,
      bio: String(formData.get("bio") ?? "").slice(0, 160),
      twitter: twitter || null,
      linkedin: String(formData.get("linkedin") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      city: String(formData.get("city") ?? "").trim() || null,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  revalidatePath(`/u/${session.user.username}`);
  revalidatePath("/settings");
  return { success: true };
}

export async function pinProduct(productId: string, position: number | null) {
  const session = await auth();
  if (!session?.user.roles.includes("admin")) return { error: "Forbidden" };

  await prisma.product.update({
    where: { id: productId },
    data: { pinnedPosition: position },
  });

  revalidatePath("/");
  revalidatePath("/admin/queue");
  return { success: true };
}

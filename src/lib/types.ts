import type { TeamRole } from "@prisma/client";

export type TeamMember = {
  userId: string;
  role: TeamRole;
  user: {
    username: string;
    name: string;
    avatarUrl: string | null;
    bio: string;
    twitter: string | null;
    linkedin: string | null;
    website: string | null;
    city: string | null;
  };
};

export type ProductWithMeta = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  thumbnailUrl: string | null;
  screenshotUrls: string[];
  videoUrl: string | null;
  category: string;
  tags: string[];
  launchDate: string;
  website: string;
  upvotes: number;
  comments: number;
  hasUpvoted: boolean;
  pinnedPosition: number | null;
  maker: {
    username: string;
    name: string;
    avatarUrl: string | null;
    bio: string;
    twitter: string | null;
    linkedin: string | null;
    website: string | null;
    city: string | null;
  };
  teamMembers: TeamMember[];
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
};

export type CommentWithAuthor = {
  id: string;
  productId: string;
  text: string;
  createdAt: string;
  author: {
    username: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type ProductWithMeta = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  thumbnailUrl: string | null;
  screenshotUrls: string[];
  category: string;
  tags: string[];
  launchDate: string;
  website: string;
  upvotes: number;
  comments: number;
  hasUpvoted: boolean;
  maker: {
    username: string;
    name: string;
    avatarUrl: string | null;
  };
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

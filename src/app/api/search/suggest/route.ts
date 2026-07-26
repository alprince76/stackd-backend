import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const products = await prisma.product.findMany({
    where: {
      status: "approved",
      publishedAt: { not: null },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { tagline: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    select: {
      slug: true,
      name: true,
      tagline: true,
      thumbnailUrl: true,
    },
    take: 8,
    orderBy: { publishedAt: "desc" },
  });

  return NextResponse.json({ results: products });
}

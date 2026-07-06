import { getPendingProducts, getScheduledProducts } from "@/lib/queries/products";
import { AdminQueueClient } from "./queue-client";

export default async function AdminQueuePage() {
  const [pending, scheduled] = await Promise.all([
    getPendingProducts(),
    getScheduledProducts(),
  ]);

  const mapItem = (p: (typeof pending)[0]) => ({
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    thumbnailUrl: p.thumbnailUrl,
    maker: p.maker,
    categoryId: p.categoryId,
  });

  return (
    <AdminQueueClient
      pending={pending.map(mapItem)}
      scheduled={scheduled.map(mapItem)}
    />
  );
}

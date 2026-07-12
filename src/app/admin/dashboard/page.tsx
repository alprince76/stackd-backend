import { getDashboardStats, getDashboardExtended } from "@/lib/queries/products";
import { DashboardClient } from "./dashboard-client";

export default async function AdminDashboardPage() {
  const [stats, extended] = await Promise.all([
    getDashboardStats(),
    getDashboardExtended(),
  ]);

  return (
    <DashboardClient
      stats={stats}
      trends={extended.trends}
      topProducts={extended.topProducts}
      topMakers={extended.topMakers}
      votesChart={extended.votesChart}
      signupsChart={extended.signupsChart}
      totalSignupsRecent={extended.totalSignupsRecent}
      signupsTrend={extended.signupsTrend}
    />
  );
}

import {
  computeWikiStats,
  getAllWikiPages,
  getWikiLogEntries,
} from "@/lib/wiki/reader";
import { HomeDashboard } from "@/components/HomeDashboard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [pages, logs] = await Promise.all([
    getAllWikiPages(),
    getWikiLogEntries(),
  ]);

  const stats = computeWikiStats(pages);
  const overviewPage =
    pages.find((p) => p.frontmatter.type === "overview") ?? null;

  return (
    <HomeDashboard
      pages={pages}
      logs={logs}
      stats={stats}
      overviewPage={overviewPage}
    />
  );
}

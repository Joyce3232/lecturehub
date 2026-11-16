import { notFound } from "next/navigation";
import { getAllWikiPages, getWikiPageBySlug } from "@/lib/wiki/reader";
import { SlideViewer } from "@/components/SlideViewer";

export async function generateStaticParams() {
  const pages = await getAllWikiPages();
  return pages.map((page) => ({
    slug: page.slug.split("/"),
  }));
}

interface DeckPageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { slug } = await params;
  const fullSlug = slug.join("/");
  const [page, allPages] = await Promise.all([
    getWikiPageBySlug(fullSlug),
    getAllWikiPages(),
  ]);

  if (!page) {
    notFound();
  }

  const targetOtherTrack =
    page.frontmatter.source_type === "ppt"
      ? "book"
      : page.frontmatter.source_type === "book"
        ? "ppt"
        : null;

  const crossTrackPages = targetOtherTrack
    ? allPages
        .filter(
          (p) =>
            p.frontmatter.source_type === targetOtherTrack &&
            p.frontmatter.type === "concept"
        )
        .map((p) => ({
          slug: p.slug,
          title: p.frontmatter.title,
          sourceType: p.frontmatter.source_type,
        }))
    : [];

  return <SlideViewer page={page} crossTrackPages={crossTrackPages} />;
}

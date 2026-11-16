import type { WikiLinkRef } from "./types";

const WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

export function normalizeWikiSlug(rawTarget: string): string {
  return rawTarget
    .trim()
    .replace(/^\.?\//, "")
    .replace(/\.md$/i, "");
}

export function slugToDeckHref(slug: string): string {
  const clean = normalizeWikiSlug(slug);
  if (clean === "index") return "/";
  return `/deck/${clean}`;
}

export function extractWikilinks(markdown: string): WikiLinkRef[] {
  const refs: WikiLinkRef[] = [];
  const seen = new Set<string>();

  for (const match of markdown.matchAll(WIKILINK_REGEX)) {
    const rawTarget = match[1];
    const rawLabel = match[2];
    const slug = normalizeWikiSlug(rawTarget);
    if (!slug || slug === "index") continue;

    const label = rawLabel?.trim() || slug.split("/").pop() || slug;
    if (!seen.has(slug)) {
      seen.add(slug);
      refs.push({
        slug,
        label,
        href: slugToDeckHref(slug),
      });
    }
  }

  return refs;
}

export function convertWikilinksToMarkdown(
  markdown: string,
  titleLookup?: Map<string, string>
): string {
  return markdown.replace(
    WIKILINK_REGEX,
    (_full, rawTarget: string, rawLabel?: string) => {
      const slug = normalizeWikiSlug(rawTarget);
      const href = slugToDeckHref(slug);
      const display =
        rawLabel?.trim() ||
        titleLookup?.get(slug) ||
        slug.split("/").pop() ||
        slug;
      return `[${display}](${href})`;
    }
  );
}

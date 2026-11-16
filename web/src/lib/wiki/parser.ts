import matter from "gray-matter";
import { WikiFrontmatterSchema, type WikiFrontmatter } from "./types";

export interface ParsedMarkdownFile {
  frontmatter: WikiFrontmatter;
  content: string;
}

export function parseWikiMarkdown(
  rawText: string,
  fallbackSlug: string
): ParsedMarkdownFile {
  const { data, content } = matter(rawText);

  const inferredSourceType = fallbackSlug.includes("/ppt/")
    ? "ppt"
    : fallbackSlug.includes("/book/")
      ? "book"
      : "mixed";

  const inferredType = fallbackSlug.startsWith("sources/")
    ? "source"
    : fallbackSlug.startsWith("concepts/")
      ? "concept"
      : fallbackSlug.startsWith("comparisons/")
        ? "comparison"
        : fallbackSlug === "overview"
          ? "overview"
          : "concept";

  const parsed = WikiFrontmatterSchema.safeParse({
    title: data.title ?? fallbackSlug.split("/").pop() ?? fallbackSlug,
    type: data.type ?? inferredType,
    source_type: data.source_type ?? inferredSourceType,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    created: data.created,
    updated: data.updated,
    sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
    status: data.status ?? "seed",
    authors: data.authors ? String(data.authors) : undefined,
    published: data.published,
    raw_file: data.raw_file ? String(data.raw_file) : undefined,
    source_url: data.source_url ? String(data.source_url) : undefined,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in ${fallbackSlug}: ${parsed.error.message}`
    );
  }

  return {
    frontmatter: parsed.data,
    content: content.trim(),
  };
}

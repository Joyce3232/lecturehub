import fs from "fs/promises";
import path from "path";
import { parseWikiMarkdown } from "./parser";
import {
  convertWikilinksToMarkdown,
  extractWikilinks,
  slugToDeckHref,
} from "./links";
import { buildSlidesFromMarkdown } from "./slides";
import type {
  WikiLinkRef,
  WikiLogEntry,
  WikiPage,
  WikiStats,
} from "./types";

const WIKI_DIR = path.resolve(process.cwd(), "..", "wiki");

async function collectMarkdownFiles(
  dir: string,
  baseDir: string
): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectMarkdownFiles(fullPath, baseDir);
      files.push(...nested);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      if (rel === "index.md" || rel === "log.md") continue;
      files.push(rel);
    }
  }

  return files;
}

export async function getAllWikiPages(): Promise<WikiPage[]> {
  const relFiles = await collectMarkdownFiles(WIKI_DIR, WIKI_DIR);

  const rawRecords = await Promise.all(
    relFiles.map(async (relPath) => {
      const fullPath = path.join(WIKI_DIR, relPath);
      const rawText = await fs.readFile(fullPath, "utf-8");
      const slug = relPath.replace(/\.md$/i, "");
      const parsed = parseWikiMarkdown(rawText, slug);
      return { slug, parsed };
    })
  );

  const titleLookup = new Map<string, string>();
  for (const { slug, parsed } of rawRecords) {
    titleLookup.set(slug, parsed.frontmatter.title);
  }

  const pages: WikiPage[] = rawRecords.map(({ slug, parsed }) => {
    const outgoingRefs = extractWikilinks(parsed.content);
    const sourceRefs = parsed.frontmatter.sources.flatMap((s) =>
      extractWikilinks(s)
    );
    const convertedMd = convertWikilinksToMarkdown(parsed.content, titleLookup);
    const slides = buildSlidesFromMarkdown(parsed.frontmatter, convertedMd);

    return {
      slug,
      frontmatter: parsed.frontmatter,
      content: convertedMd,
      rawContent: parsed.content,
      slides,
      sourceRefs,
      outgoingSlugs: outgoingRefs.map((r) => r.slug),
      backlinks: [],
    };
  });

  const backlinkMap = new Map<string, WikiLinkRef[]>();
  for (const page of pages) {
    const targets = new Set([
      ...page.outgoingSlugs,
      ...page.sourceRefs.map((s) => s.slug),
    ]);
    for (const targetSlug of targets) {
      if (targetSlug === page.slug) continue;
      const list = backlinkMap.get(targetSlug) ?? [];
      list.push({
        slug: page.slug,
        label: page.frontmatter.title,
        href: slugToDeckHref(page.slug),
      });
      backlinkMap.set(targetSlug, list);
    }
  }

  for (const page of pages) {
    page.backlinks = backlinkMap.get(page.slug) ?? [];
  }

  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

export async function getWikiPageBySlug(
  slug: string
): Promise<WikiPage | null> {
  const pages = await getAllWikiPages();
  const decoded = decodeURIComponent(slug).replace(/\.md$/i, "");
  return pages.find((p) => p.slug === decoded) ?? null;
}

export async function getWikiLogEntries(): Promise<WikiLogEntry[]> {
  const logPath = path.join(WIKI_DIR, "log.md");
  try {
    const text = await fs.readFile(logPath, "utf-8");
    const lines = text.split("\n");
    const entries: WikiLogEntry[] = [];
    let current: WikiLogEntry | null = null;

    for (const line of lines) {
      const headerMatch = line.match(
        /^##\s+\[(\d{4}-\d{2}-\d{2})\]\s+([^|]+)\|\s*(.+)$/
      );
      if (headerMatch) {
        if (current) entries.push(current);
        current = {
          date: headerMatch[1].trim(),
          action: headerMatch[2].trim(),
          title: headerMatch[3].trim(),
          details: [],
        };
      } else if (current && line.trim().startsWith("- ")) {
        current.details.push(line.trim().slice(2));
      }
    }
    if (current) entries.push(current);

    return entries.reverse();
  } catch {
    return [];
  }
}

export function computeWikiStats(pages: WikiPage[]): WikiStats {
  return {
    totalDecks: pages.length,
    pptSources: pages.filter(
      (p) => p.frontmatter.type === "source" && p.frontmatter.source_type === "ppt"
    ).length,
    pptConcepts: pages.filter(
      (p) => p.frontmatter.type === "concept" && p.frontmatter.source_type === "ppt"
    ).length,
    bookSources: pages.filter(
      (p) => p.frontmatter.type === "source" && p.frontmatter.source_type === "book"
    ).length,
    bookConcepts: pages.filter(
      (p) => p.frontmatter.type === "concept" && p.frontmatter.source_type === "book"
    ).length,
    comparisons: pages.filter((p) => p.frontmatter.type === "comparison").length,
  };
}

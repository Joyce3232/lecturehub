import { z } from "zod";

const dateFieldSchema = z
  .union([z.string(), z.date()])
  .transform((val) =>
    val instanceof Date ? val.toISOString().slice(0, 10) : String(val)
  );

export const WikiFrontmatterSchema = z.object({
  title: z.string(),
  type: z.enum([
    "source",
    "concept",
    "model",
    "benchmark",
    "comparison",
    "overview",
  ]),
  source_type: z.enum(["ppt", "book", "mixed"]),
  tags: z.array(z.string()).default([]),
  created: dateFieldSchema.optional(),
  updated: dateFieldSchema.optional(),
  sources: z.array(z.string()).default([]),
  status: z.enum(["seed", "growing", "evergreen"]).default("seed"),
  authors: z.string().optional(),
  published: dateFieldSchema.optional(),
  raw_file: z.string().optional(),
  source_url: z.string().optional(),
});

export type WikiFrontmatter = z.infer<typeof WikiFrontmatterSchema>;

export interface WikiLinkRef {
  slug: string;
  label: string;
  href: string;
}

export interface WikiSlide {
  index: number;
  kind: "cover" | "content";
  title: string;
  markdown: string;
}

export interface WikiPage {
  slug: string;
  frontmatter: WikiFrontmatter;
  content: string;
  rawContent: string;
  slides: WikiSlide[];
  sourceRefs: WikiLinkRef[];
  outgoingSlugs: string[];
  backlinks: WikiLinkRef[];
}

export interface WikiLogEntry {
  date: string;
  action: string;
  title: string;
  details: string[];
}

export interface WikiStats {
  totalDecks: number;
  pptSources: number;
  pptConcepts: number;
  bookSources: number;
  bookConcepts: number;
  comparisons: number;
}

import type { WikiFrontmatter, WikiSlide } from "./types";

export function buildSlidesFromMarkdown(
  frontmatter: WikiFrontmatter,
  markdown: string
): WikiSlide[] {
  const slides: WikiSlide[] = [
    {
      index: 0,
      kind: "cover",
      title: frontmatter.title,
      markdown: "",
    },
  ];

  const lines = markdown.split("\n");
  const sections: string[] = [];
  let currentLines: string[] = [];
  let inCodeFence = false;

  const flushSection = () => {
    const text = currentLines.join("\n").trim();
    if (text.length > 0) {
      sections.push(text);
    }
    currentLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      currentLines.push(line);
      continue;
    }

    if (!inCodeFence) {
      if (currentLines.length === 0 && sections.length === 0 && trimmed.startsWith("# ")) {
        continue;
      }
      if (trimmed === "---") {
        flushSection();
        continue;
      }
      if (trimmed.startsWith("## ")) {
        flushSection();
        currentLines.push(line);
        continue;
      }
    }

    currentLines.push(line);
  }
  flushSection();

  sections.forEach((sectionMd, idx) => {
    const firstLine = sectionMd.split("\n")[0]?.trim() ?? "";
    const headingMatch = firstLine.match(/^##\s+(.+)$/);
    const slideTitle = headingMatch
      ? headingMatch[1].trim()
      : `投影片 ${idx + 2}`;

    slides.push({
      index: idx + 1,
      kind: "content",
      title: slideTitle,
      markdown: sectionMd,
    });
  });

  return slides;
}

#!/usr/bin/env python3
"""
讀取 wiki/ 中的雙軌 Markdown 知識庫，自動生成可直接在瀏覽器開啟的單一互動式簡報網頁 index.html。
視覺風格：Swiss Keynote（瑞士網格投影片風 — 純白 #FFFFFF、純黑 #000000、瑞士橘 #EA580C、直角 2px 網格）。
嚴格遵守 AGENTS.md：內容與呈現分離，所有知識動態從 wiki/ 讀取。
"""
import glob
import json
import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
WIKI_DIR = ROOT_DIR / "wiki"
OUTPUT_HTML = ROOT_DIR / "index.html"


def parse_frontmatter(raw_text: str, fallback_slug: str):
    fm = {
        "title": fallback_slug.split("/")[-1],
        "type": "concept",
        "source_type": "ppt" if "/ppt/" in fallback_slug else ("book" if "/book/" in fallback_slug else "mixed"),
        "tags": [],
        "created": "",
        "updated": "",
        "sources": [],
        "status": "seed",
        "authors": "",
        "raw_file": "",
    }
    body = raw_text

    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n(.*)$", raw_text, re.S)
    if not m:
        return fm, body.strip()

    fm_text, body = m.group(1), m.group(2).strip()
    current_list_key = None

    for line in fm_text.splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        list_item = re.match(r"^\s*-\s+(.*)$", line)
        if list_item and current_list_key in ("tags", "sources"):
            val = list_item.group(1).strip().strip('"').strip("'")
            fm[current_list_key].append(val)
            continue

        kv = re.match(r"^([a-zA-Z0-9_]+)\s*:\s*(.*)$", line)
        if kv:
            key = kv.group(1).strip()
            val = kv.group(2).strip()
            if val == "" and key in ("tags", "sources"):
                current_list_key = key
            else:
                current_list_key = None
                if not (val.startswith('"') or val.startswith("'")):
                    val = val.split("#")[0].strip()
                val = val.strip('"').strip("'")
                if key in fm:
                    fm[key] = val

    return fm, body


def normalize_slug(raw_target: str) -> str:
    s = raw_target.strip()
    if s.startswith("./"):
        s = s[2:]
    if s.startswith("/"):
        s = s[1:]
    if s.endswith(".md"):
        s = s[:-3]
    return s


def extract_wikilinks(text: str):
    refs = []
    seen = set()
    for m in re.finditer(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", text):
        slug = normalize_slug(m.group(1))
        if not slug or slug == "index":
            continue
        label = m.group(2).strip() if m.group(2) else slug.split("/")[-1]
        if slug not in seen:
            seen.add(slug)
            refs.append({"slug": slug, "label": label})
    return refs


def convert_wikilinks(text: str, title_lookup: dict) -> str:
    def repl(m):
        slug = normalize_slug(m.group(1))
        if slug == "index":
            return "[知識庫首頁](#home)"
        label = (
            m.group(2).strip()
            if m.group(2)
            else title_lookup.get(slug, slug.split("/")[-1])
        )
        return f"[{label}](#deck/{slug})"

    return re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", repl, text)


def split_slides(frontmatter: dict, markdown_text: str):
    slides = [
        {
            "index": 0,
            "kind": "cover",
            "title": frontmatter["title"],
            "markdown": "",
        }
    ]
    lines = markdown_text.splitlines()
    sections = []
    current = []
    in_code = False

    def flush():
        nonlocal current
        txt = "\n".join(current).strip()
        if txt:
            sections.append(txt)
        current = []

    for line in lines:
        trimmed = line.strip()
        if trimmed.startswith("```"):
            in_code = not in_code
            current.append(line)
            continue
        if not in_code:
            if len(current) == 0 and len(sections) == 0 and trimmed.startswith("# "):
                continue
            if trimmed == "---":
                flush()
                continue
            if trimmed.startswith("## "):
                flush()
                current.append(line)
                continue
        current.append(line)
    flush()

    for idx, sec in enumerate(sections):
        first_line = sec.splitlines()[0].strip() if sec else ""
        hm = re.match(r"^##\s+(.+)$", first_line)
        slide_title = hm.group(1).strip() if hm else f"投影片 {idx + 2}"
        slides.append(
            {
                "index": idx + 1,
                "kind": "content",
                "title": slide_title,
                "markdown": sec,
            }
        )
    return slides


def parse_log():
    log_path = WIKI_DIR / "log.md"
    if not log_path.exists():
        return []
    entries = []
    cur = None
    for line in log_path.read_text(encoding="utf-8").splitlines():
        hm = re.match(r"^##\s+\[(\d{4}-\d{2}-\d{2})\]\s+([^|]+)\|\s*(.+)$", line)
        if hm:
            if cur:
                entries.append(cur)
            cur = {
                "date": hm.group(1).strip(),
                "action": hm.group(2).strip(),
                "title": hm.group(3).strip(),
                "details": [],
            }
        elif cur and line.strip().startswith("- "):
            cur["details"].append(line.strip()[2:])
    if cur:
        entries.append(cur)
    entries.reverse()
    return entries


def build_data():
    md_files = sorted(glob.glob(str(WIKI_DIR / "**" / "*.md"), recursive=True))
    raw_pages = []
    title_lookup = {}

    for fpath in md_files:
        rel = os.path.relpath(fpath, WIKI_DIR).replace("\\", "/")
        if rel in ("index.md", "log.md"):
            continue
        slug = rel[:-3]
        text = Path(fpath).read_text(encoding="utf-8")
        fm, body = parse_frontmatter(text, slug)
        title_lookup[slug] = fm["title"]
        raw_pages.append((slug, fm, body))

    pages = []
    backlinks = {}
    for slug, fm, body in raw_pages:
        outgoing = extract_wikilinks(body)
        source_refs = []
        for s in fm.get("sources", []):
            source_refs.extend(extract_wikilinks(s))

        converted_md = convert_wikilinks(body, title_lookup)
        slides = split_slides(fm, converted_md)

        targets = {r["slug"] for r in outgoing} | {r["slug"] for r in source_refs}
        for t in targets:
            if t != slug:
                backlinks.setdefault(t, []).append(
                    {"slug": slug, "label": fm["title"]}
                )

        pages.append(
            {
                "slug": slug,
                "frontmatter": fm,
                "content": converted_md,
                "rawContent": body,
                "slides": slides,
                "sourceRefs": [
                    {"slug": r["slug"], "label": title_lookup.get(r["slug"], r["label"])}
                    for r in source_refs
                ],
                "backlinks": [],
            }
        )

    for p in pages:
        p["backlinks"] = backlinks.get(p["slug"], [])

    logs = parse_log()
    return {"pages": pages, "logs": logs}


HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>課程簡報與原文書知識庫 | Swiss Keynote Slides</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
  <style>
    body {
      font-family: "Inter", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", system-ui, sans-serif;
      background-color: #FFFFFF;
      color: #000000;
    }
    .wiki-prose h1 { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.025em; color: #000000; margin-bottom: 1.25rem; }
    .wiki-prose h2 { font-size: 1.5rem; font-weight: 900; letter-spacing: -0.02em; color: #000000; margin-top: 1.25rem; margin-bottom: 1rem; border-bottom: 2px solid #000000; padding-bottom: 0.4rem; }
    .wiki-prose h3 { font-size: 1.125rem; font-weight: 800; color: #000000; margin-top: 1.1rem; margin-bottom: 0.5rem; }
    .wiki-prose p { color: #171717; line-height: 1.75; margin-bottom: 0.85rem; }
    .wiki-prose ul { list-style-type: square; padding-left: 1.5rem; margin-bottom: 1rem; color: #171717; }
    .wiki-prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; color: #171717; }
    .wiki-prose li { margin-bottom: 0.4rem; line-height: 1.65; }
    .wiki-prose blockquote { border-left: 4px solid #EA580C; background: #F5F5F5; padding: 0.75rem 1rem; margin: 1.1rem 0; color: #000000; font-weight: 500; }
    .wiki-prose code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.875em; background: #F5F5F5; color: #EA580C; border: 1px solid #E5E5E5; padding: 0.1rem 0.35rem; }
    .wiki-prose pre { background: #000000; color: #FFFFFF; padding: 1.1rem; overflow-x: auto; margin: 1.1rem 0; font-size: 0.85rem; border: 2px solid #000000; }
    .wiki-prose pre code { background: transparent; color: inherit; border: none; padding: 0; }
    .wiki-prose table { width: 100%; border-collapse: collapse; margin: 1.1rem 0; font-size: 0.875rem; border: 2px solid #000000; }
    .wiki-prose th { background: #000000; color: #FFFFFF; border: 1px solid #000000; padding: 0.6rem 0.75rem; text-align: left; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; font-size: 0.75rem; }
    .wiki-prose td { border: 1px solid #D4D4D4; padding: 0.6rem 0.75rem; color: #171717; vertical-align: top; }
    .wiki-prose a { color: #EA580C; text-decoration: underline; text-underline-offset: 3px; font-weight: 700; }
    .wiki-prose a:hover { color: #000000; }
  </style>
</head>
<body class="bg-white text-black min-h-screen">
  <div id="app"></div>

  <script>
    const WIKI_DATA = __WIKI_DATA_JSON__;

    const state = {
      route: "home",
      activeSlug: null,
      activeTab: "ppt",
      searchQuery: "",
      selectedTag: null,
      viewerMode: "slides",
      slideIndex: 0,
      showOutline: true,
    };

    function sourceBadgeHtml(sourceType) {
      if (sourceType === "ppt") {
        return `<span class="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-black text-white">PPT 簡報</span>`;
      }
      if (sourceType === "book") {
        return `<span class="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-white text-black border-2 border-black">BOOK 原文書</span>`;
      }
      return `<span class="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-orange-600 text-white">MIXED 對照</span>`;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function renderMarkdown(md) {
      if (window.marked) {
        marked.setOptions({ gfm: true, breaks: false });
        return marked.parse(md || "");
      }
      return `<pre>${escapeHtml(md || "")}</pre>`;
    }

    function applyMath(container) {
      if (window.renderMathInElement && container) {
        try {
          renderMathInElement(container, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
          });
        } catch (e) {}
      }
    }

    function syncHashFromState() {
      if (state.route === "home") {
        if (location.hash !== "#home" && location.hash !== "") {
          history.replaceState(null, "", "#home");
        }
      } else if (state.route === "deck" && state.activeSlug) {
        const targetHash = `#deck/${state.activeSlug}`;
        if (location.hash !== targetHash) {
          history.replaceState(null, "", targetHash);
        }
      }
    }

    function loadStateFromHash() {
      const h = decodeURIComponent(location.hash || "");
      if (h.startsWith("#deck/")) {
        const slug = h.slice(6);
        const found = WIKI_DATA.pages.find((p) => p.slug === slug);
        if (found) {
          state.route = "deck";
          state.activeSlug = slug;
          state.slideIndex = 0;
          return;
        }
      }
      state.route = "home";
      state.activeSlug = null;
    }

    function openDeck(slug) {
      state.route = "deck";
      state.activeSlug = slug;
      state.slideIndex = 0;
      state.viewerMode = "slides";
      syncHashFromState();
      render();
      window.scrollTo(0, 0);
    }

    function goHome() {
      state.route = "home";
      state.activeSlug = null;
      syncHashFromState();
      render();
      window.scrollTo(0, 0);
    }

    function renderHome() {
      const pages = WIKI_DATA.pages;
      const deckPages = pages.filter((p) => p.frontmatter.type !== "overview");
      const overview = pages.find((p) => p.frontmatter.type === "overview");

      const pptSources = pages.filter((p) => p.frontmatter.type === "source" && p.frontmatter.source_type === "ppt").length;
      const pptConcepts = pages.filter((p) => p.frontmatter.type === "concept" && p.frontmatter.source_type === "ppt").length;
      const bookSources = pages.filter((p) => p.frontmatter.type === "source" && p.frontmatter.source_type === "book").length;
      const bookConcepts = pages.filter((p) => p.frontmatter.type === "concept" && p.frontmatter.source_type === "book").length;
      const comparisons = pages.filter((p) => p.frontmatter.type === "comparison").length;

      const allTags = Array.from(
        new Set(deckPages.flatMap((p) => p.frontmatter.tags || []))
      ).sort();

      const q = state.searchQuery.trim().toLowerCase();
      const filtered = deckPages.filter((p) => {
        if (state.activeTab === "ppt" && p.frontmatter.source_type !== "ppt") return false;
        if (state.activeTab === "book" && p.frontmatter.source_type !== "book") return false;
        if (state.activeTab === "comparisons" && p.frontmatter.type !== "comparison") return false;
        if (state.selectedTag && !(p.frontmatter.tags || []).includes(state.selectedTag)) return false;
        if (q) {
          const hay = (p.frontmatter.title + "\n" + p.rawContent + "\n" + (p.frontmatter.tags || []).join(" ")).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      const tabs = [
        { id: "ppt", label: "課程簡報軌道（PPT）" },
        { id: "book", label: "原文書軌道（BOOK）" },
        { id: "comparisons", label: "跨來源對照（COMPARISONS）" },
        { id: "all", label: "全部簡報（ALL）" },
      ];

      return `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          <!-- Header -->
          <header class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-4 border-black pb-6">
            <div>
              <div class="font-mono text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
                LLM WIKI · SWISS KEYNOTE EDITION
              </div>
              <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-black">
                課程簡報與原文書知識庫
              </h1>
              <p class="text-neutral-600 mt-2 text-sm">
                雙軌物理分離（PPT 課程簡報 ／ Book 原文書），高對比網格簡報呈現。
              </p>
            </div>
            ${overview ? `
              <button onclick="openDeck('overview')" class="inline-flex items-center gap-2 px-5 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors shrink-0">
                開啟全域總覽簡報（${overview.slides.length} 頁） →
              </button>
            ` : ""}
          </header>

          <!-- Stats Grid -->
          <section class="grid grid-cols-2 lg:grid-cols-4 border-2 border-black divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-black bg-white">
            <div class="p-5">
              <div class="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">PPT 課程簡報</div>
              <div class="mt-2 flex items-baseline gap-3">
                <span class="text-3xl font-black text-black">${pptSources + pptConcepts}</span>
                <span class="font-mono text-xs text-neutral-600">${pptSources} SRC / ${pptConcepts} CPT</span>
              </div>
            </div>
            <div class="p-5">
              <div class="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">BOOK 原文書</div>
              <div class="mt-2 flex items-baseline gap-3">
                <span class="text-3xl font-black text-black">${bookSources + bookConcepts}</span>
                <span class="font-mono text-xs text-neutral-600">${bookSources} SRC / ${bookConcepts} CPT</span>
              </div>
            </div>
            <div class="p-5">
              <div class="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">跨來源對照</div>
              <div class="mt-2 flex items-baseline gap-3">
                <span class="text-3xl font-black text-black">${comparisons}</span>
                <span class="font-mono text-xs text-neutral-600">COMPARISONS</span>
              </div>
            </div>
            <div class="p-5 bg-neutral-100">
              <div class="font-mono text-xs font-bold uppercase tracking-wider text-orange-600">TOTAL DECKS</div>
              <div class="mt-2 flex items-baseline gap-3">
                <span class="text-3xl font-black text-black">${pages.length}</span>
                <span class="font-mono text-xs text-neutral-600">含全域總覽</span>
              </div>
            </div>
          </section>

          <!-- Main Content -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-2 space-y-6">
              <!-- Track Tabs -->
              <div class="flex flex-wrap items-center gap-2 border-b-2 border-black pb-4">
                ${tabs.map((t) => `
                  <button onclick="setTab('${t.id}')" class="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    state.activeTab === t.id
                      ? "bg-black text-white"
                      : "bg-white text-black border-2 border-black hover:bg-neutral-100"
                  }">${t.label}</button>
                `).join("")}
              </div>

              <!-- Search & Tags -->
              <div class="space-y-3">
                <input
                  id="searchInput"
                  type="text"
                  value="${escapeHtml(state.searchQuery)}"
                  oninput="setSearch(this.value)"
                  placeholder="搜尋簡報標題、內文關鍵字或標籤..."
                  class="w-full px-4 py-2.5 bg-white border-2 border-black text-sm font-medium focus:outline-none focus:border-orange-600"
                />
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="font-mono text-xs font-bold uppercase text-neutral-500 mr-1">TAGS:</span>
                  <button onclick="setTag(null)" class="px-2.5 py-1 text-xs font-mono font-bold ${state.selectedTag === null ? "bg-orange-600 text-white" : "bg-white border border-black text-black hover:bg-neutral-100"}">ALL</button>
                  ${allTags.map((tag) => `
                    <button onclick="setTag('${escapeHtml(tag)}')" class="px-2.5 py-1 text-xs font-mono font-bold ${state.selectedTag === tag ? "bg-orange-600 text-white" : "bg-white border border-black text-black hover:bg-neutral-100"}">#${escapeHtml(tag)}</button>
                  `).join("")}
                </div>
              </div>

              <!-- Cards -->
              ${filtered.length === 0 ? `
                <div class="border-2 border-dashed border-black p-10 text-center text-neutral-600 text-sm font-mono">
                  目前此軌道或篩選條件下尚無簡報頁面。
                </div>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  ${filtered.map((p) => `
                    <div onclick="openDeck('${escapeHtml(p.slug)}')" class="cursor-pointer group bg-white border-2 border-black p-5 hover:border-orange-600 transition-colors flex flex-col justify-between gap-5">
                      <div class="space-y-3">
                        <div class="flex items-center justify-between gap-2">
                          ${sourceBadgeHtml(p.frontmatter.source_type)}
                          <span class="font-mono text-xs font-bold text-neutral-500 uppercase">${escapeHtml(p.frontmatter.type)} · ${p.slides.length} SLIDES</span>
                        </div>
                        <h2 class="text-lg font-black tracking-tight text-black group-hover:text-orange-600 transition-colors">${escapeHtml(p.frontmatter.title)}</h2>
                        <div class="flex flex-wrap gap-1.5">
                          ${(p.frontmatter.tags || []).slice(0, 4).map((t) => `<span class="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-700 font-mono text-xs">#${escapeHtml(t)}</span>`).join("")}
                        </div>
                      </div>
                      <div class="flex items-center justify-between pt-3 border-t border-neutral-300 font-mono text-xs">
                        <span class="text-neutral-500">${escapeHtml(p.frontmatter.updated || "—")}</span>
                        <span class="font-bold text-orange-600 uppercase">OPEN DECK →</span>
                      </div>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>

            <!-- Log Sidebar -->
            <aside class="bg-white border-2 border-black p-5 space-y-5">
              <div class="border-b-2 border-black pb-3">
                <h2 class="font-mono text-xs font-bold uppercase tracking-widest text-black">RECENT LOG · 更新紀錄</h2>
              </div>
              <div class="space-y-4">
                ${WIKI_DATA.logs.slice(0, 6).map((entry) => `
                  <div class="pl-4 border-l-4 border-orange-600 space-y-1">
                    <div class="flex items-center gap-2 font-mono text-xs">
                      <span class="font-bold text-black">${escapeHtml(entry.date)}</span>
                      <span class="px-1.5 py-0.5 bg-black text-white uppercase font-bold">${escapeHtml(entry.action)}</span>
                    </div>
                    <p class="text-sm font-bold text-black">${escapeHtml(entry.title)}</p>
                    ${entry.details.length ? `<p class="text-xs text-neutral-600">${escapeHtml(entry.details[entry.details.length - 1])}</p>` : ""}
                  </div>
                `).join("")}
              </div>
            </aside>
          </div>
        </div>
      `;
    }

    function renderDeck() {
      const page = WIKI_DATA.pages.find((p) => p.slug === state.activeSlug);
      if (!page) {
        goHome();
        return "";
      }

      const total = page.slides.length;
      const idx = Math.min(Math.max(0, state.slideIndex), total - 1);
      state.slideIndex = idx;
      const slide = page.slides[idx];
      const progress = total > 0 ? Math.round(((idx + 1) / total) * 100) : 100;

      const otherTrack = page.frontmatter.source_type === "ppt" ? "book" : (page.frontmatter.source_type === "book" ? "ppt" : null);
      const crossTrack = otherTrack
        ? WIKI_DATA.pages.filter((p) => p.frontmatter.source_type === otherTrack && p.frontmatter.type === "concept")
        : [];

      const mainColSpan = state.viewerMode === "slides" && state.showOutline ? "lg:col-span-6" : "lg:col-span-9";

      return `
        <div class="min-h-screen flex flex-col bg-neutral-100">
          <!-- Top Bar -->
          <header class="bg-white border-b-2 border-black px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
            <div class="flex items-center gap-3 min-w-0">
              <button onclick="goHome()" class="px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-mono font-bold uppercase hover:bg-black hover:text-white transition-colors">
                ← INDEX
              </button>
              ${sourceBadgeHtml(page.frontmatter.source_type)}
              <h1 class="text-sm sm:text-base font-black tracking-tight text-black truncate">${escapeHtml(page.frontmatter.title)}</h1>
            </div>

            <div class="flex items-center gap-2">
              ${state.viewerMode === "slides" ? `
                <button onclick="toggleOutline()" class="px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-black bg-white text-black hover:bg-neutral-100">
                  ${state.showOutline ? "HIDE OUTLINE" : "SHOW OUTLINE"}
                </button>
              ` : ""}
              <div class="inline-flex border-2 border-black bg-white">
                <button onclick="setViewerMode('slides')" class="px-3 py-1.5 text-xs font-mono font-bold uppercase ${state.viewerMode === "slides" ? "bg-black text-white" : "text-black hover:bg-neutral-100"}">SLIDES</button>
                <button onclick="setViewerMode('document')" class="px-3 py-1.5 text-xs font-mono font-bold uppercase border-l-2 border-black ${state.viewerMode === "document" ? "bg-black text-white" : "text-black hover:bg-neutral-100"}">READ</button>
              </div>
            </div>
          </header>

          ${state.viewerMode === "slides" ? `
            <div class="w-full h-1.5 bg-neutral-300">
              <div class="h-full bg-orange-600 transition-all duration-300" style="width: ${progress}%"></div>
            </div>
          ` : ""}

          <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            ${state.viewerMode === "slides" && state.showOutline ? `
              <aside class="lg:col-span-3 bg-white border-2 border-black p-4 space-y-3 lg:sticky lg:top-20 max-h-[75vh] overflow-y-auto">
                <div class="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-300 pb-2">
                  OUTLINE · ${total} SLIDES
                </div>
                <nav class="space-y-1">
                  ${page.slides.map((s, i) => `
                    <button onclick="goSlide(${i})" class="w-full text-left px-3 py-2 text-xs font-bold flex items-start gap-2 transition-colors ${
                      i === idx ? "bg-black text-white" : "text-black hover:bg-neutral-100"
                    }">
                      <span class="font-mono shrink-0 ${i === idx ? "text-orange-400" : "text-neutral-400"}">${String(i + 1).padStart(2, "0")}</span>
                      <span>${escapeHtml(s.title)}</span>
                    </button>
                  `).join("")}
                </nav>
              </aside>
            ` : ""}

            <main class="${mainColSpan}">
              ${state.viewerMode === "slides" ? `
                <div class="space-y-4">
                  <div class="bg-white border-2 border-black p-8 sm:p-12 min-h-[500px] flex flex-col justify-between">
                    ${slide.kind === "cover" ? `
                      <div class="my-auto space-y-6">
                        <div class="flex flex-wrap items-center gap-3">
                          ${sourceBadgeHtml(page.frontmatter.source_type)}
                          <span class="font-mono text-xs font-bold uppercase tracking-widest text-orange-600">${escapeHtml(page.frontmatter.type)} · ${escapeHtml(page.frontmatter.status)}</span>
                        </div>
                        <h2 class="text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight">${escapeHtml(page.frontmatter.title)}</h2>
                        ${page.frontmatter.authors ? `<p class="font-mono text-xs text-neutral-600 uppercase">AUTHOR / INSTRUCTOR: ${escapeHtml(page.frontmatter.authors)}</p>` : ""}
                        <div class="flex flex-wrap gap-2">
                          ${(page.frontmatter.tags || []).map((t) => `<span class="px-2.5 py-1 bg-neutral-100 border border-black text-black font-mono text-xs font-bold">#${escapeHtml(t)}</span>`).join("")}
                        </div>
                        <div class="pt-5 border-t-2 border-black flex flex-wrap items-center gap-6 font-mono text-xs text-neutral-600">
                          <span>UPDATED: ${escapeHtml(page.frontmatter.updated || "—")}</span>
                          ${page.frontmatter.raw_file ? `<span>RAW: ${escapeHtml(page.frontmatter.raw_file)}</span>` : ""}
                        </div>
                      </div>
                    ` : `
                      <div id="markdownTarget" class="wiki-prose flex-1">${renderMarkdown(slide.markdown)}</div>
                    `}
                    <div class="mt-8 pt-4 border-t border-neutral-300 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
                      <span class="text-neutral-500">${escapeHtml(page.slug)}</span>
                      <span class="text-orange-600">${String(idx + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between bg-white border-2 border-black px-4 py-3">
                    <button onclick="prevSlide()" ${idx === 0 ? "disabled" : ""} class="px-4 py-2 text-xs font-mono font-bold uppercase border-2 border-black bg-white text-black hover:bg-black hover:text-white disabled:opacity-30">← PREV</button>
                    <span class="font-mono text-xs font-bold text-neutral-600">KEYBOARD ← / →</span>
                    <button onclick="nextSlide()" ${idx >= total - 1 ? "disabled" : ""} class="px-4 py-2 text-xs font-mono font-bold uppercase bg-orange-600 text-white hover:bg-black disabled:opacity-30">NEXT →</button>
                  </div>
                </div>
              ` : `
                <article class="bg-white border-2 border-black p-8 sm:p-12 space-y-6">
                  <div class="border-b-4 border-black pb-6 space-y-3">
                    <div class="flex flex-wrap items-center gap-3">
                      ${sourceBadgeHtml(page.frontmatter.source_type)}
                      <span class="font-mono text-xs font-bold text-neutral-500 uppercase">UPDATED: ${escapeHtml(page.frontmatter.updated || "—")}</span>
                    </div>
                    <h2 class="text-3xl font-black tracking-tight text-black">${escapeHtml(page.frontmatter.title)}</h2>
                  </div>
                  <div id="markdownTarget" class="wiki-prose">${renderMarkdown(page.content)}</div>
                </article>
              `}
            </main>

            <aside class="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
              <div class="bg-white border-2 border-black p-4 space-y-3">
                <div class="font-mono text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-300 pb-2">SOURCES · 來源出處</div>
                ${page.sourceRefs.length === 0 ? `
                  <p class="font-mono text-xs text-neutral-600">${page.frontmatter.raw_file ? `RAW: ${escapeHtml(page.frontmatter.raw_file)}` : "本頁為來源或總覽頁面。"}</p>
                ` : `
                  <ul class="space-y-2">
                    ${page.sourceRefs.map((r) => `
                      <li>
                        <button onclick="openDeck('${escapeHtml(r.slug)}')" class="w-full text-left flex items-center justify-between gap-2 p-2 border border-black bg-neutral-50 hover:bg-orange-600 hover:text-white text-xs font-bold transition-colors">
                          <span class="truncate">${escapeHtml(r.label)}</span>
                          <span>→</span>
                        </button>
                      </li>
                    `).join("")}
                  </ul>
                `}
              </div>

              <div class="bg-white border-2 border-black p-4 space-y-3">
                <div class="font-mono text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-300 pb-2">BACKLINKS · ${page.backlinks.length}</div>
                ${page.backlinks.length === 0 ? `<p class="text-xs text-neutral-500 font-mono">NO BACKLINKS</p>` : `
                  <ul class="space-y-1.5">
                    ${page.backlinks.map((b) => `
                      <li>
                        <button onclick="openDeck('${escapeHtml(b.slug)}')" class="w-full text-left px-2.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-100 hover:text-orange-600 truncate">
                          ← ${escapeHtml(b.label)}
                        </button>
                      </li>
                    `).join("")}
                  </ul>
                `}
              </div>

              ${crossTrack.length > 0 ? `
                <div class="bg-white border-2 border-black p-4 space-y-3">
                  <div class="font-mono text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-neutral-300 pb-2">OTHER TRACK · 他軌快速切換</div>
                  <ul class="space-y-1.5">
                    ${crossTrack.slice(0, 5).map((c) => `
                      <li>
                        <button onclick="openDeck('${escapeHtml(c.slug)}')" class="w-full text-left flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-100 hover:text-orange-600">
                          <span class="truncate">${escapeHtml(c.title)}</span>
                          <span>→</span>
                        </button>
                      </li>
                    `).join("")}
                  </ul>
                </div>
              ` : ""}
            </aside>
          </div>
        </div>
      `;
    }

    function setTab(t) { state.activeTab = t; render(); }
    function setSearch(q) {
      state.searchQuery = q;
      const input = document.getElementById("searchInput");
      const pos = input ? input.selectionStart : q.length;
      render();
      const newInput = document.getElementById("searchInput");
      if (newInput) { newInput.focus(); newInput.setSelectionRange(pos, pos); }
    }
    function setTag(tag) { state.selectedTag = state.selectedTag === tag ? null : tag; render(); }
    function setViewerMode(m) { state.viewerMode = m; render(); }
    function toggleOutline() { state.showOutline = !state.showOutline; render(); }
    function goSlide(i) { state.slideIndex = i; render(); }
    function prevSlide() { if (state.slideIndex > 0) { state.slideIndex--; render(); } }
    function nextSlide() {
      const page = WIKI_DATA.pages.find((p) => p.slug === state.activeSlug);
      if (page && state.slideIndex < page.slides.length - 1) { state.slideIndex++; render(); }
    }

    window.addEventListener("keydown", (e) => {
      if (state.route === "deck" && state.viewerMode === "slides") {
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "ArrowRight") nextSlide();
      }
    });

    window.addEventListener("hashchange", () => {
      loadStateFromHash();
      render();
    });

    function render() {
      const app = document.getElementById("app");
      app.innerHTML = state.route === "deck" ? renderDeck() : renderHome();
      const target = document.getElementById("markdownTarget");
      if (target) applyMath(target);
    }

    loadStateFromHash();
    render();
  </script>
</body>
</html>
"""


def main():
    data = build_data()
    json_str = json.dumps(data, ensure_ascii=False)
    json_str = json_str.replace("</", "<\\/")
    html = HTML_TEMPLATE.replace("__WIKI_DATA_JSON__", json_str)
    OUTPUT_HTML.write_text(html, encoding="utf-8")
    print(f"Generated {OUTPUT_HTML} (Swiss Keynote) with {len(data['pages'])} decks and {len(data['logs'])} log entries.")


if __name__ == "__main__":
    main()

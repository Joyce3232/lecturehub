"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WikiLogEntry, WikiPage, WikiStats } from "@/lib/wiki/types";
import { SourceBadge } from "./SourceBadge";

interface HomeDashboardProps {
  pages: WikiPage[];
  logs: WikiLogEntry[];
  stats: WikiStats;
  overviewPage: WikiPage | null;
}

type TrackTab = "ppt" | "book" | "comparisons" | "all";

export function HomeDashboard({
  pages,
  logs,
  stats,
  overviewPage,
}: HomeDashboardProps) {
  const [activeTab, setActiveTab] = useState<TrackTab>("ppt");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const deckPages = useMemo(
    () => pages.filter((p) => p.frontmatter.type !== "overview"),
    [pages]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const page of deckPages) {
      for (const tag of page.frontmatter.tags) {
        tagSet.add(tag);
      }
    }
    return Array.from(tagSet).sort();
  }, [deckPages]);

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return deckPages.filter((page) => {
      if (activeTab === "ppt" && page.frontmatter.source_type !== "ppt") {
        return false;
      }
      if (activeTab === "book" && page.frontmatter.source_type !== "book") {
        return false;
      }
      if (
        activeTab === "comparisons" &&
        page.frontmatter.type !== "comparison"
      ) {
        return false;
      }
      if (selectedTag && !page.frontmatter.tags.includes(selectedTag)) {
        return false;
      }
      if (q) {
        const hay = [
          page.frontmatter.title,
          page.rawContent,
          page.frontmatter.tags.join(" "),
        ]
          .join("\n")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [deckPages, activeTab, selectedTag, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b-4 border-black pb-6">
        <div>
          <div className="font-mono text-xs font-bold uppercase tracking-widest text-orange-600 mb-2">
            LLM WIKI · SWISS KEYNOTE EDITION
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
            課程簡報與原文書知識庫
          </h1>
          <p className="text-neutral-600 mt-2 text-sm">
            雙軌物理分離（PPT 課程簡報 ／ Book 原文書），高對比網格簡報呈現。
          </p>
        </div>

        {overviewPage && (
          <Link
            href="/deck/overview"
            className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors shrink-0"
          >
            開啟全域總覽簡報（{overviewPage.slides.length} 頁） →
          </Link>
        )}
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 border-2 border-black divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-black bg-white">
        <div className="p-5">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
            PPT 課程簡報
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-black">
              {stats.pptSources + stats.pptConcepts}
            </span>
            <span className="font-mono text-xs text-neutral-600">
              {stats.pptSources} SRC / {stats.pptConcepts} CPT
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
            BOOK 原文書
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-black">
              {stats.bookSources + stats.bookConcepts}
            </span>
            <span className="font-mono text-xs text-neutral-600">
              {stats.bookSources} SRC / {stats.bookConcepts} CPT
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500">
            跨來源對照
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-black">
              {stats.comparisons}
            </span>
            <span className="font-mono text-xs text-neutral-600">
              COMPARISONS
            </span>
          </div>
        </div>

        <div className="p-5 bg-neutral-100">
          <div className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600">
            TOTAL DECKS
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-3xl font-black text-black">
              {stats.totalDecks}
            </span>
            <span className="font-mono text-xs text-neutral-600">
              含全域總覽
            </span>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b-2 border-black pb-4">
            {(
              [
                { id: "ppt", label: "課程簡報軌道（PPT）" },
                { id: "book", label: "原文書軌道（BOOK）" },
                { id: "comparisons", label: "跨來源對照（COMPARISONS）" },
                { id: "all", label: "全部簡報（ALL）" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "bg-white text-black border-2 border-black hover:bg-neutral-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋簡報標題、內文關鍵字或標籤..."
              className="w-full px-4 py-2.5 bg-white border-2 border-black text-sm font-medium focus:outline-none focus:border-orange-600"
            />

            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs font-bold uppercase text-neutral-500 mr-1">
                  TAGS:
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold ${
                    selectedTag === null
                      ? "bg-orange-600 text-white"
                      : "bg-white border border-black text-black hover:bg-neutral-100"
                  }`}
                >
                  ALL
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(selectedTag === tag ? null : tag)
                    }
                    className={`px-2.5 py-1 text-xs font-mono font-bold ${
                      selectedTag === tag
                        ? "bg-orange-600 text-white"
                        : "bg-white border border-black text-black hover:bg-neutral-100"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredPages.length === 0 ? (
            <div className="border-2 border-dashed border-black p-10 text-center text-neutral-600 text-sm font-mono">
              目前此軌道或篩選條件下尚無簡報頁面。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filteredPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/deck/${page.slug}`}
                  className="group bg-white border-2 border-black p-5 hover:border-orange-600 transition-colors flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <SourceBadge sourceType={page.frontmatter.source_type} />
                      <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
                        {page.frontmatter.type} · {page.slides.length} SLIDES
                      </span>
                    </div>

                    <h2 className="text-lg font-black tracking-tight text-black group-hover:text-orange-600 transition-colors line-clamp-2">
                      {page.frontmatter.title}
                    </h2>

                    <div className="flex flex-wrap gap-1.5">
                      {page.frontmatter.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-neutral-700 font-mono text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-300 font-mono text-xs">
                    <span className="text-neutral-500">
                      {page.frontmatter.updated ?? "—"}
                    </span>
                    <span className="font-bold text-orange-600 uppercase">
                      OPEN DECK →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Log Sidebar */}
        <aside className="bg-white border-2 border-black p-5 space-y-5">
          <div className="border-b-2 border-black pb-3">
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-black">
              RECENT LOG · 更新紀錄
            </h2>
          </div>

          <div className="space-y-4">
            {logs.slice(0, 6).map((entry, idx) => (
              <div
                key={`${entry.date}-${idx}`}
                className="pl-4 border-l-4 border-orange-600 space-y-1"
              >
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-black">{entry.date}</span>
                  <span className="px-1.5 py-0.5 bg-black text-white uppercase font-bold">
                    {entry.action}
                  </span>
                </div>
                <p className="text-sm font-bold text-black">{entry.title}</p>
                {entry.details.length > 0 && (
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {entry.details[entry.details.length - 1]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { WikiPage } from "@/lib/wiki/types";
import { SourceBadge } from "./SourceBadge";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface SlideViewerProps {
  page: WikiPage;
  crossTrackPages: Array<{
    slug: string;
    title: string;
    sourceType: "ppt" | "book" | "mixed";
  }>;
}

export function SlideViewer({ page, crossTrackPages }: SlideViewerProps) {
  const [mode, setMode] = useState<"slides" | "document">("slides");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showOutline, setShowOutline] = useState(true);

  const totalSlides = page.slides.length;
  const activeSlide = page.slides[currentIndex] ?? page.slides[0];

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  }, [totalSlides]);

  useEffect(() => {
    if (mode !== "slides") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, goPrev, goNext]);

  const progressPercent =
    totalSlides > 0 ? Math.round(((currentIndex + 1) / totalSlides) * 100) : 100;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      {/* Top Bar */}
      <header className="bg-white border-b-2 border-black px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-mono font-bold uppercase hover:bg-black hover:text-white transition-colors"
          >
            ← INDEX
          </Link>
          <SourceBadge sourceType={page.frontmatter.source_type} />
          <h1 className="text-sm sm:text-base font-black tracking-tight text-black truncate">
            {page.frontmatter.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {mode === "slides" && (
            <button
              onClick={() => setShowOutline((v) => !v)}
              className="px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 border-black bg-white text-black hover:bg-neutral-100"
            >
              {showOutline ? "HIDE OUTLINE" : "SHOW OUTLINE"}
            </button>
          )}

          <div className="inline-flex border-2 border-black bg-white">
            <button
              onClick={() => setMode("slides")}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase ${
                mode === "slides"
                  ? "bg-black text-white"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              SLIDES
            </button>
            <button
              onClick={() => setMode("document")}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-l-2 border-black ${
                mode === "document"
                  ? "bg-black text-white"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              READ
            </button>
          </div>
        </div>
      </header>

      {mode === "slides" && (
        <div className="w-full h-1.5 bg-neutral-300">
          <div
            className="h-full bg-orange-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {mode === "slides" && showOutline && (
          <aside className="lg:col-span-3 bg-white border-2 border-black p-4 space-y-3 lg:sticky lg:top-20 max-h-[75vh] overflow-y-auto">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-300 pb-2">
              OUTLINE · {totalSlides} SLIDES
            </div>
            <nav className="space-y-1">
              {page.slides.map((slide, idx) => (
                <button
                  key={slide.index}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full text-left px-3 py-2 text-xs font-bold flex items-start gap-2 transition-colors ${
                    idx === currentIndex
                      ? "bg-black text-white"
                      : "text-black hover:bg-neutral-100"
                  }`}
                >
                  <span
                    className={`font-mono shrink-0 ${
                      idx === currentIndex
                        ? "text-orange-400"
                        : "text-neutral-400"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2">{slide.title}</span>
                </button>
              ))}
            </nav>
          </aside>
        )}

        <main
          className={
            mode === "slides" && showOutline ? "lg:col-span-6" : "lg:col-span-9"
          }
        >
          {mode === "slides" ? (
            <div className="space-y-4">
              <div className="bg-white border-2 border-black p-8 sm:p-12 min-h-[500px] flex flex-col justify-between">
                {activeSlide.kind === "cover" ? (
                  <div className="my-auto space-y-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <SourceBadge sourceType={page.frontmatter.source_type} />
                      <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-600">
                        {page.frontmatter.type} · {page.frontmatter.status}
                      </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight">
                      {page.frontmatter.title}
                    </h2>

                    {page.frontmatter.authors && (
                      <p className="font-mono text-xs text-neutral-600 uppercase">
                        AUTHOR / INSTRUCTOR: {page.frontmatter.authors}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {page.frontmatter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-neutral-100 border border-black text-black font-mono text-xs font-bold"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-5 border-t-2 border-black flex flex-wrap items-center gap-6 font-mono text-xs text-neutral-600">
                      <span>UPDATED: {page.frontmatter.updated ?? "—"}</span>
                      {page.frontmatter.raw_file && (
                        <span>RAW: {page.frontmatter.raw_file}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <MarkdownRenderer content={activeSlide.markdown} />
                  </div>
                )}

                <div className="mt-8 pt-4 border-t border-neutral-300 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider">
                  <span className="text-neutral-500">{page.slug}</span>
                  <span className="text-orange-600">
                    {String(currentIndex + 1).padStart(2, "0")} /{" "}
                    {String(totalSlides).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white border-2 border-black px-4 py-3">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 text-xs font-mono font-bold uppercase border-2 border-black bg-white text-black hover:bg-black hover:text-white disabled:opacity-30"
                >
                  ← PREV
                </button>

                <span className="font-mono text-xs font-bold text-neutral-600">
                  KEYBOARD ← / →
                </span>

                <button
                  onClick={goNext}
                  disabled={currentIndex >= totalSlides - 1}
                  className="px-4 py-2 text-xs font-mono font-bold uppercase bg-orange-600 text-white hover:bg-black disabled:opacity-30"
                >
                  NEXT →
                </button>
              </div>
            </div>
          ) : (
            <article className="bg-white border-2 border-black p-8 sm:p-12 space-y-6">
              <div className="border-b-4 border-black pb-6 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <SourceBadge sourceType={page.frontmatter.source_type} />
                  <span className="font-mono text-xs font-bold text-neutral-500 uppercase">
                    UPDATED: {page.frontmatter.updated ?? "—"}
                  </span>
                </div>
                <h2 className="text-3xl font-black tracking-tight text-black">
                  {page.frontmatter.title}
                </h2>
              </div>

              <MarkdownRenderer content={page.content} />
            </article>
          )}
        </main>

        <aside className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white border-2 border-black p-4 space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-300 pb-2">
              SOURCES · 來源出處
            </div>
            {page.sourceRefs.length === 0 ? (
              <p className="font-mono text-xs text-neutral-600">
                {page.frontmatter.raw_file
                  ? `RAW: ${page.frontmatter.raw_file}`
                  : "本頁為來源或總覽頁面。"}
              </p>
            ) : (
              <ul className="space-y-2">
                {page.sourceRefs.map((ref) => (
                  <li key={ref.slug}>
                    <Link
                      href={ref.href}
                      className="flex items-center justify-between gap-2 p-2 border border-black bg-neutral-50 hover:bg-orange-600 hover:text-white text-xs font-bold transition-colors"
                    >
                      <span className="truncate">{ref.label}</span>
                      <span>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border-2 border-black p-4 space-y-3">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-black border-b border-neutral-300 pb-2">
              BACKLINKS · {page.backlinks.length}
            </div>
            {page.backlinks.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono">NO BACKLINKS</p>
            ) : (
              <ul className="space-y-1.5">
                {page.backlinks.map((bl) => (
                  <li key={bl.slug}>
                    <Link
                      href={bl.href}
                      className="block px-2.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-100 hover:text-orange-600 truncate"
                    >
                      ← {bl.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {crossTrackPages.length > 0 && (
            <div className="bg-white border-2 border-black p-4 space-y-3">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-orange-600 border-b border-neutral-300 pb-2">
                OTHER TRACK · 他軌快速切換
              </div>
              <ul className="space-y-1.5">
                {crossTrackPages.slice(0, 5).map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/deck/${item.slug}`}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-100 hover:text-orange-600"
                    >
                      <span className="truncate">{item.title}</span>
                      <span>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

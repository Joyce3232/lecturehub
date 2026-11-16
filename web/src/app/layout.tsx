import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "課程簡報與原文書知識庫 | Swiss Keynote Slides",
  description:
    "雙軌物理分離（PPT 課程簡報 / Book 原文書）之 Markdown 知識庫與瑞士網格風互動式簡報平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}

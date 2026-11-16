# 課程簡報與原文書知識庫（LLM Wiki + 簡報網頁）

這是一個依據 **Karpathy LLM Wiki** 架構建立的個人課程知識系統，結合**「課程簡報（PPT）」與「原文書（Book）」雙軌物理分離**設計，以及**免伺服器靜態 HTML（`index.html`）與 Next.js 網頁簡報播放器**。

- **人類負責**：策展原始教材、提出問題、閱讀與審核重點。
- **AI Agent 負責**：自動掃描未處理教材、摘要與交叉連結、維護雙軌 Wiki，並將知識同步呈現為可互動的網頁簡報。

---

## 系統三層架構與目錄結構

本專案嚴格維持以下三層分離設計（完整規範見 [AGENTS.md](./AGENTS.md)）：

```text
.
├── AGENTS.md                 # AI Agent 最高層級共用規範（Schema）
├── README.md                 # 本操作指南
├── raw/                      # 【Layer 1：唯讀】原始資料層（AI 不可修改、刪除或改名）
│   ├── ppt/                  # 課程簡報原始檔（如 DS_Ch3.pdf）
│   ├── book/                 # 原文書／教材原始檔（如教科書 PDF 與文字整理）
│   ├── papers/               # 補充論文
│   ├── articles/             # 技術文章（Web Clipper）
│   └── assets/               # 圖表與圖片附件
├── _templates/               # Wiki 頁面標準範本（Frontmatter 與版面格式）
│   ├── source_note.md
│   ├── concept_page.md
│   ├── model_page.md
│   └── comparison_page.md
├── wiki/                     # 【Layer 2：AI 維護】雙軌物理分離之 Markdown 知識庫
│   ├── index.md              # 全站內容導向目錄
│   ├── log.md                # Append-only 時間軸操作紀錄
│   ├── overview.md           # 全域知識總覽
│   ├── sources/
│   │   ├── ppt/              # 課程簡報逐份摘要
│   │   └── book/             # 原文書逐章／逐份摘要
│   ├── concepts/
│   │   ├── ppt/              # 僅由課程簡報累積之概念網絡
│   │   └── book/             # 僅由原文書累積之概念網絡
│   ├── models/               # 特定系統、架構或實作案例實體頁
│   ├── benchmarks/           # 評測基準與方法論頁
│   └── comparisons/          # 跨來源對照（PPT vs. Book）與問答沉澱
├── scripts/
│   └── build_html.py         # 靜態 HTML 生成腳本（讀取 wiki/ 自動產出 index.html）
├── index.html                # 【Layer 3：免伺服器靜態網頁】可雙擊直接開啟的互動簡報
└── web/                      # 【Layer 3：網頁呈現層】Next.js 簡報呈現網站（含 package.json 與 src/）
```

### 核心設計原則
- **雙軌物理分離**：`raw/ppt/` 的內容僅寫入 `wiki/sources/ppt/` 與 `wiki/concepts/ppt/`；`raw/book/` 的內容僅寫入 `wiki/sources/book/` 與 `wiki/concepts/book/`，不混寫於同一份概念頁內。需要比較兩者差異時，統一整理至 `wiki/comparisons/`（`source_type: mixed`）。
- **內容與呈現分離**：網頁端動態讀取 `wiki/` 中的 Markdown 檔案來渲染投影片，不將知識內容寫死在前端元件中。

---

## 快速開始

### 1. 放入原始資料
將課程檔案放入對應的 `raw/` 子資料夾：
- 課程簡報 → `raw/ppt/`
- 原文書／教科書 → `raw/book/`
- 補充論文／網頁文章 → `raw/papers/`、`raw/articles/`
- 圖片與圖表附件 → `raw/assets/`

### 2. 呼叫 AI Agent 執行任務
開啟新的 Agent 對話（Codex、Claude Code、Cursor、Gemini、GitHub Copilot 等），可使用以下常用指令：

- **一鍵自動同步（Auto-Sync）**：
  > 「請閱讀 `AGENTS.md`，自動掃描 `raw/` 中尚未處理的檔案並完成知識庫整理與簡報網頁同步。」
  Agent 會自動比對 `raw/ppt/`、`raw/book/` 與 `wiki/sources/` 的 `raw_file` 欄位，補齊未收錄的教材，並自動執行 `python3 scripts/build_html.py` 更新 `index.html`（若環境支援亦驗證 Next.js 建置）。
- **指定收錄（Ingest）**：
  > 「請依照 `AGENTS.md` 處理 `raw/ppt/xxx.pdf`（或 `raw/book/xxx.pdf`）。」
  將單份資料歸檔至對應軌道，更新 `wiki/index.md`、`wiki/log.md` 與相關概念頁，並同步檢查網頁簡報。
- **提問與沉澱（Query & Synthesis）**：
  > 「比較簡報與原文書對某概念的說明差異，並整理成對照頁。」
  Agent 會先查閱 `wiki/index.md` 再深讀來源，區分 `ppt/` 與 `book/` 觀點；具長期價值的分析會存入 `wiki/comparisons/`。
- **健康檢查（Lint）**：
  > 「請依照 `AGENTS.md` 對 `wiki/` 執行一次 Lint 健康檢查。」
  檢查雙軌純淨度、YAML Frontmatter 完整性、斷鏈（Broken Wikilinks）、孤島頁面（Orphans）與索引遺漏。

---

## 網頁簡報介面（HTML 靜態版 & Next.js 版）

本專案提供兩種呈現方式，皆動態讀取 `wiki/` 中的 Markdown 筆記自動轉換為可翻頁瀏覽的網頁簡報，並統一採用 **Swiss Keynote（瑞士網格投影片風）** 視覺設計（純白 `#FFFFFF` 底色、純黑 `#000000` 2px 直角網格邊框、瑞士橘 `#EA580C` 強調色與高對比雙軌徽章）：

### 1. 靜態 HTML 互動簡報（推薦：免伺服器、雙擊即開）
- 直接在 Finder 雙擊根目錄的 `index.html`，即可於瀏覽器中瀏覽完整簡報，不需安裝 Node.js 或啟動伺服器。
- 每次更新 `wiki/` 後，AI Agent（或手動）執行以下指令即可重新生成並同步 `index.html`：
  ```bash
  python3 scripts/build_html.py
  ```

### 2. Next.js 簡報網站（`web/`）
- **技術架構**：Next.js（App Router）、React、TypeScript、Tailwind CSS、Zod、`gray-matter`、`react-markdown`、`remark-gfm`、`remark-math` + `rehype-katex`。
- **投影片切分規則**：自動將每份 Wiki 頁面的 Frontmatter 轉為封面頁（顯示標題、`source_type` 徽章、標籤與來源），並依二級標題 `## ` 或 `---` 切分為獨立投影片。
- **核心功能**：
  - 首頁總覽儀表板與「課程簡報（PPT）／原文書（Book）／跨來源對照（Comparisons）」雙軌切換。
  - 簡報播放模式（鍵盤 `←` / `→` 翻頁、頁碼進度、大綱側邊欄）與長文閱讀模式一鍵切換。
  - 支援 Obsidian `[[...]]` Wikilink 站內路由跳轉、反向連結（Backlinks）、KaTeX 數學公式與標籤／全文搜尋。

若本機已安裝 Node.js，可使用以下指令啟動與驗證 Next.js 版本：

```bash
cd web
npm install        # 安裝相依套件（首次使用）
npm run dev        # 啟動本地開發伺服器
npm run lint       # ESLint 檢查
npx tsc --noEmit   # TypeScript 型別檢查
npm run build      # 生產環境建置驗證
```

---

## Obsidian 搭配使用建議

你也可以同時將本資料夾設為 **Obsidian Vault**，用 Graph View 瀏覽雙軌知識網絡：

- **Web Clipper**：將網頁技術文章轉為 Markdown 存至 `raw/articles/`。
- **附件路徑設定**：`Settings → Files and links → Attachment folder path` 設為 `raw/assets/`，方便本地保存圖表。
- **Dataview（選用）**：所有 Wiki 頁面皆附帶標準 YAML Frontmatter（含 `source_type: ppt | book | mixed` 與 `status`），可用 Dataview 自動生成雙軌複習進度表。
- **Git 版本控管（選用）**：整個資料夾以純文字 Markdown 與程式碼組成，適合用 Git 追蹤知識庫與網站的演化歷史。

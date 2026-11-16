# AGENTS.md — 課程簡報與原文書知識庫（LLM Wiki + 簡報網頁）運作規範

> 本文件為整個專案的最高層級共用規範（Schema）。所有參與本專案的 AI Agent（Codex、Claude Code、Cursor、Gemini、GitHub Copilot 等），在執行任何任務前都必須先閱讀並遵循本文件。
>
> **核心定位**：`raw/` 由使用者提供且不可變；`wiki/` 由 AI 依雙軌規則持續累積；**網頁前端（Next.js）負責將 `wiki/` 中的知識自動呈現為可互動的簡報（Presentation）**。

---

## 0. 開啟新任務的標準啟動流程（Read First）

每次開啟新的 Agent 對話，收到「同步知識庫與網頁」或一般開發／整理指令時，依序執行：

1. **閱讀本文件（`AGENTS.md`）** 與 `_templates/` 下的頁面範本。
2. **讀取目前狀態**：檢查 `wiki/index.md`、`wiki/log.md` 近期紀錄。
3. **掃描未處理的原始資料（Auto-Discovery）**：
   - 比對 `raw/ppt/` 與 `raw/book/` 中的所有檔案（如 `.pdf`、`.md`）。
   - 對照 `wiki/sources/ppt/`、`wiki/sources/book/` 中各來源頁面的 `raw_file` 欄位與 `wiki/index.md`，找出**尚未建立知識網絡的 PDF／檔案**。
4. **依序完成「知識整理（Ingest）」→「網頁簡報同步與驗證（Web Sync）」**（含執行 `python3 scripts/build_html.py` 自動更新 `index.html`），最後向使用者回報結果。

---

## 1. 三層架構與資料夾結構（Directory Structure）

嚴格維持以下既有目錄結構，不得擅自更動 `raw/` 或 `wiki/` 的頂層路徑：

```text
.
├── AGENTS.md                 # 本規範文件（Schema）
├── README.md                 # 使用者操作指南
├── raw/                      # 【Layer 1：唯讀】原始資料層（不可修改、覆寫或刪除）
│   ├── ppt/                  # 課程簡報原始檔（如 DS_Ch3.pdf）
│   ├── book/                 # 原文書／教材原始檔（如教科書 PDF 與文字整理）
│   ├── papers/               # 補充論文
│   ├── articles/             # 技術文章（Web Clipper）
│   └── assets/               # 圖表與圖片附件
├── _templates/               # 標準頁面範本（Frontmatter 與版面規範）
│   ├── source_note.md
│   ├── concept_page.md
│   ├── model_page.md
│   └── comparison_page.md
├── wiki/                     # 【Layer 2：AI 維護】雙軌物理分離之 Markdown 知識庫
│   ├── index.md              # 全站內容導向目錄
│   ├── log.md                # Append-only 時間軸操作紀錄
│   ├── overview.md           # 全域總覽（Synthesis）
│   ├── sources/
│   │   ├── ppt/              # 課程簡報逐份摘要
│   │   └── book/             # 原文書逐章／逐份摘要
│   ├── concepts/
│   │   ├── ppt/              # 僅由課程簡報累積之概念網絡
│   │   └── book/             # 僅由原文書累積之概念網絡
│   ├── models/               # 特定系統、架構或實作案例實體頁
│   ├── benchmarks/           # 評測基準與方法論頁
│   └── comparisons/          # 跨來源對照（如 PPT vs. Book）與問答沉澱
├── scripts/
│   └── build_html.py         # 靜態 HTML 生成腳本（讀取 wiki/ 自動產出 index.html）
├── index.html                # 【Layer 3：免伺服器靜態網頁】可雙擊直接開啟的互動簡報
└── web/                      # 【Layer 3：網頁呈現層】Next.js 簡報呈現網站（含 package.json 與 src/）
```

### 不可違反的邊界原則
- **Raw Sources 唯讀**：AI 只能讀取 `raw/`，不得修改、刪除或重新命名原始檔案。
- **雙軌物理分離（PPT vs. Book）**：
  - `raw/ppt/` 的產出**嚴格寫入** `wiki/sources/ppt/` 與 `wiki/concepts/ppt/`（`source_type: ppt`）。
  - `raw/book/` 的產出**嚴格寫入** `wiki/sources/book/` 與 `wiki/concepts/book/`（`source_type: book`）。
  - **嚴禁將 PPT 與原文書的知識混寫於同一份概念頁內**；跨軌對照請在文末「對應他軌參考」用 `[[...]]` 連結，或於 `wiki/comparisons/` 建立獨立對照頁（`source_type: mixed`）。
- **內容與呈現分離**：網站程式碼必須動態讀取 `wiki/` 的 Markdown 檔案來渲染簡報，**禁止把知識內容硬編碼（Hardcode）在 React 元件中**。

---

## 2. Wiki 頁面格式規範（Knowledge Schema）

所有 `wiki/` 下的內容頁面（`index.md` 與 `log.md` 除外）必須包含標準 YAML Frontmatter（與 `_templates/` 一致）：

```yaml
---
title: "頁面標題"
type: source | concept | model | benchmark | comparison | overview
source_type: ppt | book | mixed
tags:
  - course-notes
  - ppt # 或 book
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources:
  - "[[sources/ppt/...]]" # 或 sources/book/...
status: seed | growing | evergreen
---
```

- **來源頁額外欄位**（`_templates/source_note.md`）：`authors`、`published`、`raw_file`（必須對應 `raw/` 中實際存在的檔案路徑，作為自動掃描是否已收錄的依據）、`source_url`。
- **內部連結語法**：統一使用 Obsidian Wikilink 帶軌道路徑（例如 `[[concepts/ppt/頁面名稱|顯示文字]]`、`[[concepts/book/頁面名稱|顯示文字]]`、`[[sources/book/來源檔名]]`），確保雙軌同名概念不衝突。
- **事實與推論區分**：所有數據、公式與定義須可追溯至對應 `sources/` 頁面；若 AI 進行延伸推論或發現來源不足，應明確標註 `[推論]` 或 `[待確認]`，不得偽裝為教材原文。
- **矛盾處理**：若同軌道內新舊來源說法衝突，使用 Obsidian Callout 並陳雙方出處，不得擅自刪除舊觀點。

---

## 3. 核心知識操作流程（Ingest / Query / Lint）

### 3.1 Ingest（自動或指定收錄未處理 PDF）
1. **識別待處理檔案**：掃描 `raw/ppt/` 與 `raw/book/`，找出尚未出現在 `wiki/sources/<ppt|book>/`（`raw_file` 比對）的 PDF 或文件。
2. **完整閱讀**：讀取 PDF 文字與關鍵圖表／公式，不可僅憑檔名推測內容。
3. **建立來源摘要**：依 `_templates/source_note.md` 在 `wiki/sources/<ppt|book>/` 建立摘要頁，務必填寫準確的 `raw_file` 路徑。
4. **同軌概念整合**：檢查 `wiki/concepts/<ppt|book>/` 既有頁面，將新知識補充進既有概念頁或建立新概念頁，並維護同軌雙向連結。
5. **更新總覽、索引與日誌**：
   - 更新 `wiki/overview.md`（若引入新主題或改變脈絡）。
   - 更新 `wiki/index.md` 對應軌道（`PPT` 或 `Book`）的條目、更新日期與來源數。
   - 在 `wiki/log.md` 尾端以 Append-only 格式附加紀錄：
     ```markdown
     ## [YYYY-MM-DD] ingest | [PPT/Book] 來源標題
     - 建立：[[sources/...]]
     - 更新：[[concepts/...]]
     - 摘要：一句話說明本次收錄重點。
     ```

### 3.2 Query & Synthesis（查詢與跨軌對照沉澱）
- 先查 `wiki/index.md` 定位頁面再深讀；回答時明確區分哪些觀點來自 `ppt/`、哪些來自 `book/`。
- 若產出高價值的「PPT vs. 原文書對照表」或跨章節綜合分析，存至 `wiki/comparisons/`（`source_type: mixed`）並同步更新 `index.md` 與 `log.md`。

### 3.3 Lint（知識庫健康檢查）
- 檢查 `ppt/` 與 `book/` 軌道純淨度（無混寫、Frontmatter 完整）、無斷鏈（Broken Wikilinks）、無孤島頁面（Orphans），並確認 `raw/` 檔案皆已正確對應至 `wiki/index.md`。

---

## 4. 簡報呈現網頁開發規範（Web Presentation Interface）

本專案的網站目標是**「將 `wiki/` 的知識庫內容轉化為結構清晰、可翻頁瀏覽的網頁簡報（Slide Deck）」**。

### 4.1 技術選型
- **框架與語言**：Next.js（App Router）、React、TypeScript、Tailwind CSS
- **Markdown 解析與渲染**：`gray-matter`（解析 YAML Frontmatter）、`react-markdown`、`remark-gfm`（表格／GFM）、`remark-math` + `rehype-katex`（數學公式渲染）、`zod`（Frontmatter 驗證）、`lucide-react`（圖示）
- 依照既有 `package.json` 版本維護，不任意升級核心套件。

### 4.2 統一資料讀取層（`web/src/lib/wiki/`）
- 所有讀取 `wiki/` 的邏輯必須集中在伺服器端資料層（如 `reader.ts`、`parser.ts`、`slides.ts`、`links.ts`），**嚴禁在 React Component 內各自讀檔**，且不得將 `raw/` 檔案直接暴露給 Client Components。
- **簡報投影片切分規則（Markdown → Slides）**：
  - 每個 Wiki 頁面（`concepts/`、`sources/`、`comparisons/`、`overview.md`）皆可呈現為一份簡報：
    - **封面頁（Slide 1）**：顯示 `title`、`source_type` 徽章（`PPT 簡報` / `Book 原文書` / `跨來源對照`）、`tags`、`updated` 與來源出處連結。
    - **內容投影片**：依 Markdown 二級標題 `## `（或水平分隔線 `---`）自動切分為獨立投影片，保留標題層級、條列、表格、程式碼區塊與 KaTeX 公式。
  - **Wikilink 解析**：將 `[[path/file|label]]` 自動轉換為網站內部簡報路由連結（例如 `/deck/concepts/book/CPU-Scheduling`），點擊即可跳轉至對應簡報，並支援顯示 **Backlinks（反向連結）** 與 **對應他軌簡報快速切換**。

### 4.3 網頁核心功能與介面
1. **首頁／總覽儀表板**：
   - 顯示 `wiki/overview.md` 摘要、最近更新紀錄（讀取 `wiki/log.md`）與統計資訊（已收錄來源數、概念簡報數）。
   - 提供**雙軌分頁切換**：`課程簡報軌道（PPT）`、`原文書軌道（Book）`、`跨來源對照（Comparisons）`。
2. **簡報播放與閱讀頁面（Slide Viewer）**：
   - **簡報模式（Presentation Mode）**：單張投影片置中放大呈現、支援鍵盤 `←` / `→` 與按鈕翻頁、頁碼進度條、投影片大綱側邊欄。
   - **閱讀模式切換（Slide / Document Toggle）**：可一鍵切換為完整長文筆記閱讀模式，方便深度複習。
   - **出處與關聯面板**：顯示該頁引用的 `sources` 與相關概念連結。
3. **快速搜尋與標籤篩選**：依標題、全文關鍵字、`source_type`（`ppt` / `book`）與 `tags` 過濾簡報。

### 4.4 網站建置與更新同步（Web Sync）
- **靜態 HTML 簡報自動同步（必要步驟）**：每次完成 `wiki/` 新增、修改或 `raw/ppt/`、`raw/book/` Ingest 後，**必須立即執行**：
  ```bash
  python3 scripts/build_html.py
  ```
  確保根目錄的 `index.html` 自動與最新 `wiki/` 內容同步，讓使用者不需啟動伺服器即可直接雙擊開啟瀏覽。
- **Next.js 網站專案同步（若本機已安裝 Node.js / npm）**：
  - 若網站專案尚未初始化：依照上述架構於根目錄建立 Next.js + TypeScript + Tailwind CSS 專案（注意保留根目錄下的 `raw/`、`wiki/`、`_templates/`、`AGENTS.md`、`README.md`）。
  - 確認網頁能正確讀取新產出的 Markdown 簡報，並依 `package.json` 執行驗證：
    ```bash
    npm run lint
    npx tsc --noEmit
    npm run build
    ```
- 若驗證或生成過程中發現因新 Markdown 語法（如未閉合的數學公式或異常 Frontmatter）導致解析失敗，必須修復該 Wiki 頁面格式直到通過。

### 4.5 網頁視覺風格規範（Swiss Keynote 瑞士網格投影片風）
所有簡報網頁介面（`index.html` 與 `web/`）必須嚴格維持以下視覺設計系統：
- **色彩系統**：
  - 畫布與卡片底色：純白 `#FFFFFF`（輔助區塊淺灰 `#F5F5F5`）
  - 主文字與邊框：純黑 `#000000`（次要說明文字 `#525252`）
  - 單一強調色：瑞士橘 `#EA580C`（用於進度條、焦點按鈕、強調框線與章節標籤）
  - 雙軌徽章：高對比幾何標籤——`PPT 簡報`採黑底白字（`bg-black text-white`）、`Book 原文書`採白底黑框粗字（`bg-white text-black border-2 border-black`）、`跨來源對照`採橘底白字（`bg-orange-600 text-white`）。
- **幾何與版面**：採用**零圓角直角網格（`rounded-none`）**與 **`2px` 實線黑框（`border-2 border-black`）**，不使用陰影與漸層，以大量留白與對齊線條建立投影片層級。
- **字體排版**：標題採特粗無襯線字體（`font-black tracking-tight`），頁碼、標籤與軌道路徑採大寫等寬字體（`font-mono uppercase tracking-wider`），程式碼區塊採純黑底搭配橘色／白色高亮。

---

## 5. Git 安全與任務完成回報格式

- **Git 安全**：不得執行破壞性 Git 指令（如 `reset --hard`、`checkout --` 覆蓋未提交修改），不得刪除 `raw/` 檔案。
- **每次完成自動同步（Ingest + Web Sync）後，請依以下格式回報**：
  1. **新收錄的 Raw 檔案**：列出本次從 `raw/ppt/`、`raw/book/` 新處理的檔案（若無未處理檔案則明確說明）。
  2. **Wiki 更新清單**：列出新增與更新的 `sources/`、`concepts/`、`comparisons/`、`index.md`、`log.md`。
  3. **網頁簡報同步與驗證結果**：說明 `index.html` 是否已透過 `python3 scripts/build_html.py` 同步更新（含收錄簡報數），若本機有 Node.js 環境則附上 `lint`、`tsc`、`build` 的執行結果與可瀏覽的簡報頁面清單。

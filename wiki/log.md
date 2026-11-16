# Wiki Log（操作紀錄日誌）

> 本檔案採只增不減（Append-only）方式記錄知識庫的每次演進。可使用 `grep "^## \[" wiki/log.md | tail -5` 快速檢視近期操作。

## [2026-11-16] init | 初始化課程簡報與原文書知識庫架構
- 建立：`AGENTS.md`、`README.md`、`wiki/index.md`、`wiki/log.md`、`wiki/overview.md`
- 建立資料夾：`raw/`（`ppt/`、`book/`、`papers/`、`articles/`、`assets/`）、`_templates/`、`wiki/`（`sources/ppt`、`sources/book`、`concepts/ppt`、`concepts/book`、`models/`、`benchmarks/`、`comparisons/`）
- 摘要：依循 Karpathy LLM Wiki 三層架構完成中文版規範與初始知識庫骨架建置。

## [2026-11-16] ingest | [Book] Operating System Concepts (10th Ed.) Ch.1–5
- 保存原始整理：`raw/book/2018-Silberschatz-OS-Concepts-10th-Ch1-5.md`（原 PDF 位於 `raw/book/`）
- 建立：[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]、[[concepts/book/OS-Architecture-and-System-Calls]]、[[concepts/book/Processes-and-IPC]]、[[concepts/book/Threads-and-Concurrency]]、[[concepts/book/CPU-Scheduling]]
- 更新：[[overview]]、[[index]]
- 摘要：完成《Operating System Concepts (10th Ed.)》Ch.1–5 的原始資料保存、來源摘要與四大作業系統核心概念頁建置。

## [2026-11-16] lint | 雙軌物理分離結構遷移與連結檢查
- 遷移：將既有 OS 教材原始檔、來源筆記與 4 份概念頁全數移至 `raw/book/`、`wiki/sources/book/` 與 `wiki/concepts/book/`，並移除重複的 `raw/books/` 資料夾。
- 更新：`AGENTS.md`、`_templates/`、`README.md`、`wiki/index.md`、`wiki/overview.md` 及各筆記內部雙向連結。
- 摘要：確保檔案結構與 `AGENTS.md` 雙軌物理分離規範完全一致。

## [2026-11-16] ingest | [PPT] 資料結構 Ch.3 Linked Lists & Ch.4 Stacks
- 原始檔案：`raw/ppt/DS_Ch3.pdf`、`raw/ppt/DS_Ch4.pdf`
- 建立：[[sources/ppt/DS_Ch3-Linked-Lists]]、[[sources/ppt/DS_Ch4-Stacks]]、[[concepts/ppt/Linear-and-Singly-Linked-Lists]]、[[concepts/ppt/Complex-Linked-Lists]]、[[concepts/ppt/Stacks-and-Applications]]
- 更新：[[overview]]、[[index]]
- 摘要：完成中央大學資管系《資料結構》Ch.3（Linked Lists）與 Ch.4（Stacks）課程簡報之來源摘要與三大概念頁建置。

---
title: 課程簡報與原文書知識庫全域總覽
type: overview
source_type: mixed
tags:
  - course-notes
  - textbooks
  - operating-systems
  - data-structures
  - overview
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]"
  - "[[sources/ppt/DS_Ch3-Linked-Lists]]"
  - "[[sources/ppt/DS_Ch4-Stacks]]"
status: growing
---

# 課程簡報與原文書知識庫全域總覽

> 本頁面是整個知識庫的最高層綜述（Synthesis），彙整來自 `raw/ppt/`（課程簡報）與 `raw/book/`（原文書）所累積的雙軌概念與知識網絡。

## 一、目前收錄主題與知識主軸

### 1. 資料結構（Data Structures — 課程簡報軌道 `ppt/`）
透過 [[sources/ppt/DS_Ch3-Linked-Lists|資料結構 Ch.3 Linked Lists]] 與 [[sources/ppt/DS_Ch4-Stacks|資料結構 Ch.4 Stacks]] 建立的線性結構與演算法脈絡：
- **線性串列與單向鏈結串列**：[[concepts/ppt/Linear-and-Singly-Linked-Lists]]（General vs. Restricted 分類、陣列與鏈結串列權衡、插入／刪除兩大簡化情境、`searchList` 雙指標回傳、走訪／銷毀、串接與 Array of Lists）。
- **進階鏈結串列結構**：[[concepts/ppt/Complex-Linked-Lists]]（環狀鏈結串列防無窮迴圈機制、雙向鏈結串列 `insertDbl`/`deleteDbl` 與課堂勘誤、多重鏈結串列多鍵值共享節點）。
- **堆疊（Stack）與四大應用**：[[concepts/ppt/Stacks-and-Applications]]（LIFO 特性與 Overflow/Underflow、Linked List vs. Array ADT 實作、資料反轉、括號解析、中序轉後序與求值、目標搜尋與八皇后回溯法）。

### 2. 作業系統（Operating Systems — 原文書軌道 `book/`）
透過 [[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5|Operating System Concepts (10th Ed.) Ch.1–5]] 建立的核心系統知識脈絡：
- **架構、特權保護與核心追蹤**：[[concepts/book/OS-Architecture-and-System-Calls]]（中斷、DMA、儲存階層、Dual-Mode 保護、混合式核心、BCC/eBPF 追蹤）。
- **行程隔離與通訊**：[[concepts/book/Processes-and-IPC]]（`fork`/`exec`、Shared Memory vs. Message Passing、Sockets/RPC）。
- **執行緒與平行化**：[[concepts/book/Threads-and-Concurrency]]（Amdahl's Law、1-to-1 模型、Thread Pools/Fork-Join/GCD/TBB、Linux `clone()` 與容器基礎）。
- **CPU 與多核／NUMA 排程**：[[concepts/book/CPU-Scheduling]]（搶占式排程、MLFQ、Processor Affinity、NUMA Scheduling Domains、Linux CFS 與即時排程）。

## 二、跨來源知識整合脈絡

- **抽象化與資料隱藏（Data Hiding）**：無論是作業系統以 System Call API 隔離硬體細節，或是資料結構將 `emptyList`、`stackCount`、`fullStack` 封裝為 ADT 介面，核心目的皆是讓呼叫端不依賴底層記憶體配置（陣列索引或指標），保留未來替換實作的彈性。
- **時間、空間與局部性（Locality）的工程權衡**：陣列具備實體連續記憶體與隨機存取／二元搜尋優勢，但插入刪除需搬移資料（這也是 OS Process/Stack 配置與 Data Structure 選擇陣列或鏈結串列的共同考量）；鏈結串列與雙向／多重鏈結則以額外指標空間換取 $O(1)$ 指標重接與多維走訪彈性。

## 三、待補充與後續整合方向

- `ppt/` 軌道目前已收錄 Ch.3（Linked Lists）與 Ch.4（Stacks），待後續補充 Ch.1–2（演算法分析、遞迴）與 Ch.5（Queues）等簡報。
- `book/` 軌道目前涵蓋《Operating System Concepts》第 1–5 章，尚未涵蓋同步與死結（Ch.6–8）、記憶體管理與虛擬記憶體（Ch.9–10）等章節。

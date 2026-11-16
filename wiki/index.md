# Wiki Index（知識庫全站目錄）

> 本檔案為知識庫的內容導向索引。每次執行 `ingest`、高價值 `query` 歸檔或 `lint` 後，Agent 必須同步更新此目錄。

## 全域總覽（Overview）
- [[overview|課程簡報與原文書知識庫全域總覽]] — 彙整目前知識庫涵蓋的課程簡報與原文書核心主題脈絡。（更新：2026-11-16｜來源數：3）

## 來源筆記（Sources）

### 課程簡報軌道（PPT）
- [[sources/ppt/DS_Ch3-Linked-Lists|資料結構 Ch.3 Linked Lists 課程簡報摘要]] — 涵蓋線性串列分類、單向／環狀／雙向／多重鏈結串列結構與十大核心演算法（Kuen-Liang Sue, IM/NCU）。（更新：2026-11-16｜來源數：1）
- [[sources/ppt/DS_Ch4-Stacks|資料結構 Ch.4 Stacks 課程簡報摘要]] — 涵蓋堆疊 LIFO 操作、Linked List 與 Array ADT 實作，以及反轉、解析、中序轉後序與回溯四大應用（Kuen-Liang Sue, IM/NCU）。（更新：2026-11-16｜來源數：1）

### 原文書軌道（Book）
- [[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5|Operating System Concepts (10th Ed.) Ch.1–5]] — 涵蓋 OS 導論、核心架構、行程與 IPC、執行緒與平行運算、CPU 排程的經典教材前五章摘要。（更新：2026-11-16｜來源數：1）

## 核心概念與技術（Concepts）

### 課程簡報軌道（PPT）
- [[concepts/ppt/Linear-and-Singly-Linked-Lists|線性串列與單向鏈結串列演算法]] — 整理 General/Restricted 分類、陣列與鏈結串列比較、`insertNode`/`deleteNode`/`searchList`/`getNext`/`destroyList` 與 Array of Lists。（更新：2026-11-16｜來源數：1）
- [[concepts/ppt/Complex-Linked-Lists|進階鏈結串列結構（環狀、雙向、多重鏈結）]] — 整理環狀串列搜尋終止條件、雙向串列 `insertDbl`/`deleteDbl` 與課堂勘誤、多重鏈結串列多序列走訪。（更新：2026-11-16｜來源數：1）
- [[concepts/ppt/Stacks-and-Applications|堆疊（Stack）資料結構、ADT 實作與四大應用]] — 整理 `Push`/`Pop`/`Stack Top`、Linked List 與 Array ADT 實作、十進位轉二進位、括號配對、Infix/Postfix 轉換求值與八皇后回溯。（更新：2026-11-16｜來源數：1）

### 原文書軌道（Book）
- [[concepts/book/OS-Architecture-and-System-Calls|作業系統架構、系統呼叫與核心除錯]] — 整理中斷/DMA、儲存階層、Dual-Mode、API/ABI、混合式核心（Darwin/Android/WSL）與 BCC/eBPF。（更新：2026-11-16｜來源數：1）
- [[concepts/book/Processes-and-IPC|行程管理與行程間通訊（IPC）]] — 整理行程記憶體配置、PCB (`task_struct`)、`fork`/`exec`、Shared Memory、Message Passing、Pipes 與 RPC。（更新：2026-11-16｜來源數：1）
- [[concepts/book/Threads-and-Concurrency|執行緒、平行運算與隱式多工]] — 整理 Concurrency vs. Parallelism、Amdahl's Law、多執行緒模型、Pthreads/Java/Windows 與隱式多工框架。（更新：2026-11-16｜來源數：1）
- [[concepts/book/CPU-Scheduling|CPU 排程演算法與多核／即時排程]] — 整理 FCFS/SJF/RR/MLFQ、多核與 NUMA 親和性、RM/EDF 即時排程，以及 Linux CFS/Windows/Solaris 實作。（更新：2026-11-16｜來源數：1）

## 模型與系統實體（Models）
*待建立。*

## 評測基準（Benchmarks）
*待建立。*

## 比較分析與問答沉澱（Comparisons）
*待建立。*

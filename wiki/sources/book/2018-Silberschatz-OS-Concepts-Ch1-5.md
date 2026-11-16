---
title: Operating System Concepts (10th Ed.) Ch.1–5 來源筆記
type: source
source_type: book
tags:
  - course-notes
  - book
  - operating-systems
  - source
created: 2026-11-16
updated: 2026-11-16
authors: "Abraham Silberschatz, Peter Baer Galvin, Greg Gagne"
published: 2018-01-01
raw_file: "raw/book/Ch1-5 Abraham-Silberschatz-Operating-System-Concepts-10th-2018 (1).pdf"
source_url: "raw/book/2018-Silberschatz-OS-Concepts-10th-Ch1-5.md"
status: growing
---

# Operating System Concepts (10th Ed.) Ch.1–5 來源筆記

- **來源軌道**：`Book（原文書）`
- **原始檔案**：`raw/book/Ch1-5 Abraham-Silberschatz-Operating-System-Concepts-10th-2018 (1).pdf`（文字整理：`raw/book/2018-Silberschatz-OS-Concepts-10th-Ch1-5.md`）
- **作者／出版**：Abraham Silberschatz, Peter Baer Galvin, Greg Gagne（Wiley, 10th Edition, 2018）

## 一、一句話核心結論

本教材第 1 至第 5 章完整建立了現代作業系統的核心抽象與實作脈絡：從硬體中斷與儲存階層出發，透過系統呼叫與混合式核心架構管理資源，並以行程（Process）、執行緒（Thread）與搶占式多核 CPU 排程最大化系統吞吐量與回應速度。

## 二、章節涵蓋範圍與核心問題

1. **Chapter 1（Introduction）**：作業系統作為「資源分配者」與「控制程式」的角色；硬體中斷、DMA 與多層級儲存架構；雙重模式（User/Kernel Mode）保護與虛擬化／分散式環境基礎。
2. **Chapter 2（Operating-System Structures）**：OS 服務介面（CLI/GUI/System Calls/API/ABI）、程式編譯連結與載入（ELF/PE/Mach-O）、核心架構演進（Monolithic、Microkernel、LKM、Hybrid），以及核心除錯與 BCC/eBPF 追蹤。
3. **Chapter 3（Processes）**：行程記憶體配置、狀態轉換與 PCB（Linux `task_struct`）、`fork()`/`exec()` 生命週期，以及行程間通訊（Shared Memory、Message Passing、Pipes、Sockets、RPC/Android Binder）。
4. **Chapter 4（Threads & Concurrency）**：執行緒與平行運算挑戰（Amdahl's Law）、多執行緒對應模型、顯式執行緒函式庫（Pthreads/Windows/Java）與隱式執行緒（Thread Pools、Fork-Join、OpenMP、GCD、TBB），以及 Linux `clone()` 統一任務模型。
5. **Chapter 5（CPU Scheduling）**：CPU–I/O Burst 循環、經典與多層級回饋排程演算法、多核／SMT／NUMA／異質多核（`big.LITTLE`）排程、即時系統排程（RM 與 EDF），以及 Linux CFS、Windows 與 Solaris 實作案例。

## 三、關鍵方法與實作細節整理

- **雙層保護與系統呼叫路徑**：應用程式透過 API（如 `libc` / Windows API）呼叫 System-Call Interface，觸發軟體中斷（Trap）將硬體 `mode bit` 從 User (`1`) 切換為 Kernel (`0`)，於核心執行特權指令後返回（詳見 [[concepts/book/OS-Architecture-and-System-Calls]]）。
- **混合式核心成為主流**：純 Microkernel 雖具備模組化與高容錯性，但受限於 User Space 訊息複製開銷；因此現代系統（Linux LKM、macOS Darwin、Windows NT/10）皆採取混合架構，將關鍵服務整合於單一位址空間並保留動態模組擴充能力（詳見 [[concepts/book/OS-Architecture-and-System-Calls]]）。
- **IPC 權衡**：Shared Memory 在建立後不需核心介入、傳輸速度最快，但需應用程式自行處理同步；Message Passing 適合少量資料與跨機分散式系統（詳見 [[concepts/book/Processes-and-IPC]]）。
- **隱式平行化趨勢**：面對數百至數千執行緒的現代多核環境，開發者傾向只定義「任務（Tasks）」，將執行緒池大小、Work Stealing 負載平衡與快取親和性交由 `ForkJoinPool`、OpenMP、GCD 或 TBB 處理（詳見 [[concepts/book/Threads-and-Concurrency]]）。
- **真實排程器對資源局部性的妥協**：Linux CFS 透過 `vruntime` 與紅黑樹維持公平性與 I/O 回應，同時藉由分層的 NUMA Scheduling Domains 限制跨節點遷移，平衡「負載均衡」與「快取／記憶體親和性（Processor Affinity）」（詳見 [[concepts/book/CPU-Scheduling]]）。

## 四、限制與教材範圍說明

- 本檔案僅包含第 1 至第 5 章（Overview 與 Process Management），尚未涵蓋第 6–8 章的同步與死結（Synchronization & Deadlocks）、第 9–10 章的虛擬記憶體（Virtual Memory），以及第 18 章的容器與虛擬機深入實作。
- 教材出版於 2018 年（如 Linux 4.x 核心、Windows 10、JDK 1.8），部分新世代排程器改進（如 Linux 6.6 引入的 EEVDF 取代 CFS）需於後續補充最新資料對照。

## 五、與知識庫的關聯
- **同軌核心概念頁（Book）**：
  - [[concepts/book/OS-Architecture-and-System-Calls|作業系統架構、系統呼叫與核心除錯]]
  - [[concepts/book/Processes-and-IPC|行程管理與行程間通訊（IPC）]]
  - [[concepts/book/Threads-and-Concurrency|執行緒、平行運算與隱式多工]]
  - [[concepts/book/CPU-Scheduling|CPU 排程演算法與多核／即時排程]]

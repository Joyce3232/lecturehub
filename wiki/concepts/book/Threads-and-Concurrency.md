---
title: 執行緒、平行運算與隱式多工
type: concept
source_type: book
tags:
  - course-notes
  - book
  - operating-systems
  - threads
  - concurrency
  - parallelism
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]"
status: growing
---

# 執行緒、平行運算與隱式多工

## 一、執行緒（Thread）概念與優勢

根據 [[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5|Operating System Concepts (Ch.4)]]，執行緒是 CPU 使用的基本單位：
- **獨立擁有的資源**：Thread ID、Program Counter (PC)、Register Set、Stack。
- **同行程內共享的資源**：Code Section、Data Section（全域變數）、Heap 與作業系統資源（開啟檔案、訊號）。
- **四大優勢**：**Responsiveness**（UI 或伺服器不因單一阻塞停擺）、**Resource Sharing**（預設共享記憶體，不需額外設定 IPC）、**Economy**（建立與 Context Switch 成本遠低於行程）、**Scalability**（可在多核架構上真正平行執行）。

---

## 二、多核平行運算與 Amdahl's Law

- **Concurrency vs. Parallelism**：**並行（Concurrency）** 指多個任務能交替取得進展（單核即可透過時間切片達成）；**平行（Parallelism）** 指多個任務在同一時刻真正同時執行（必須具備多核硬體）。
- **Data Parallelism vs. Task Parallelism**：Data Parallelism 將同一份資料切分給多個核心執行相同運算（如陣列分段加總）；Task Parallelism 則是將不同任務（執行緒）分配至各核心執行各自獨立的操作。
- **Amdahl's Law（阿姆達爾定律）**：若程式中有比例 $S$ 必須序列（Serial）執行，在 $N$ 個處理核心上的理論最大加速比為：
  $$\text{speedup} \le \frac{1}{S + \frac{1-S}{N}}$$
  當 $N \to \infty$ 時，加速比收斂於 $1/S$（例如 50% 序列的程式無論加多少核心，加速上限僅為 2 倍），說明序列瓶頸對多核擴展性具有決定性影響。

---

## 三、多執行緒模型與顯式 API

1. **三種使用者／核心執行緒對應模型**：
   - **Many-to-One**：多個 User Threads 對應 1 個 Kernel Thread。管理快，但任一執行緒呼叫阻塞式系統呼叫會卡住整個行程，且無法利用多核平行（如早期 Green Threads）。
   - **One-to-One**：每個 User Thread 對應 1 個 Kernel Thread（**Linux 與 Windows 皆採用此模型**）。支援多核平行與非阻塞切換，但建立大量執行緒會帶來核心資源負擔。
   - **Many-to-Many / Two-level**：將多個 User Threads 多工映射至較少或相等數量的 Kernel Threads（透過中介的 **LWP, Lightweight Process** 與 **Scheduler Activations / Upcalls** 動態調整）；雖彈性最高但實作複雜，現代系統多以 One-to-One 搭配上層隱式任務框架取代。
2. **三大顯式執行緒函式庫**：
   - **POSIX Pthreads**：規格標準（IEEE 1003.1c），常用 `pthread_create()`、`pthread_join()`、`pthread_exit()`（Linux/macOS 原生支援）。
   - **Windows Threads**：核心層級 API，使用 `CreateThread()`、`WaitForSingleObject()` / `WaitForMultipleObjects()`。
   - **Java Threads**：可繼承 `Thread` 或實作 `Runnable`（支援 Lambda），並透過 `java.util.concurrent` 的 `ExecutorService`、`Callable<V>` 與 `Future<V>` 讓執行緒回傳非同步運算結果。

---

## 四、隱式多工（Implicit Threading）

為解決多核時代管理數百至數千執行緒的複雜度，現代開發改由開發者標註「可平行執行的任務（Tasks）」，將執行緒建立、回收與排程交由編譯器或執行期函式庫管理：

| 技術／框架 | 適用平台／語言 | 核心機制 |
| :--- | :--- | :--- |
| **Thread Pools** | Windows (`QueueUserWorkItem`)、Java (`Executors`)、Android AIDL | 預先建立固定或動態數量的執行緒池，限制資源上限並省去重複建立／銷毀開銷 |
| **Fork-Join Framework** | Java (`ForkJoinPool`) | 專為遞迴分治演算法設計（`RecursiveTask` / `RecursiveAction`），內建 **Work Stealing** 演算法平衡各執行緒佇列負載 |
| **OpenMP** | C / C++ / Fortran | 透過編譯器指令（如 `#pragma omp parallel for`）自動將平行區塊或迴圈分配至多核執行緒 |
| **Grand Central Dispatch (GCD)** | Apple macOS / iOS (`libdispatch`) | 以 Serial（FIFO 依序）與 Concurrent（全域 4 級 QoS）Dispatch Queues 管理 C Blocks (`^{}`) 或 Swift Closures，動態伸縮 POSIX 執行緒池 |
| **Intel TBB** | C++ 跨平台 | 樣板函式庫（如 `parallel_for`），具備 **Cache-aware** 與負載平衡任務排程器，並提供執行緒安全容器 |

---

## 五、多執行緒設計議題與 Linux 統一任務模型

1. **`fork()` 與 `exec()` 語意**：多執行緒程式呼叫 `fork()` 時，若立即接續 `exec()`（替換整個行程），僅需複製呼叫者執行緒；否則需複製全部執行緒。
2. **訊號與取消（Signals & Cancellation）**：
   - 同步訊號（如除以零）送至觸發執行緒；非同步訊號可由特定或非遮罩執行緒接收（`pthread_kill()`，Windows 則使用 **APCs**）。
   - 執行緒終止強烈建議採用 **Deferred Cancellation**（透過 Cancellation Points 如 `pthread_testcancel()` 或 Java `interrupt()`/`isInterrupted()` 檢查並搭配 Cleanup Handler 釋放資源），避免 Asynchronous Cancellation 造成鎖或資源洩漏。
3. **Thread-Local Storage (TLS)**：跨函式呼叫但為單一執行緒私有的資料（如交易 ID），對應 Java `ThreadLocal<T>`、Pthreads `pthread_key_t`、GCC `__thread`。
4. **Windows vs. Linux 核心模型**：
   - Windows 明確區分行程與執行緒，核心空間維護 `ETHREAD` 與 `KTHREAD`，使用者空間維護 `TEB`。
   - **Linux 不區分 Process 與 Thread，統一稱為 Task**（皆對應一個 `struct task_struct`）。透過 `clone()` 系統呼叫傳入旗標（`CLONE_FS`、`CLONE_VM`、`CLONE_SIGHAND`、`CLONE_FILES`）決定子任務與父任務共享多少資源結構：全不共享即為 `fork()` 行程，全共享即為執行緒；此彈性機制亦是 **Linux Containers** 隔離實作的基礎。

## 六、關聯頁面
- **同軌來源出處**：[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]
- **同軌相關概念**：[[concepts/book/Processes-and-IPC]]、[[concepts/book/CPU-Scheduling]]

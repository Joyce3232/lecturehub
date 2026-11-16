---
title: CPU 排程演算法與多核／即時排程
type: concept
source_type: book
tags:
  - course-notes
  - book
  - operating-systems
  - scheduling
  - multicore
  - real-time
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]"
status: growing
---

# CPU 排程演算法與多核／即時排程

## 一、排程基礎與評估準則

根據 [[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5|Operating System Concepts (Ch.5)]]，現代作業系統排程的實際對象是 **Kernel-Level Threads**。

- **CPU–I/O Burst Cycle**：行程執行在 CPU Burst 與 I/O Wait 之間交替；實測顯示 CPU Burst 呈指數分布（大量短 Burst、少數長 Burst）。
- **Preemptive（搶占式）vs. Nonpreemptive（非搶占式）**：當排程僅在行程「主動等待 I/O」或「終止」時發生，稱為 Nonpreemptive；若允許於「中斷返回」或「I/O 完成喚醒」時切換 CPU，則為 Preemptive。現代 OS 核心本身亦多為搶占式（需以 Mutex 等機制保護核心共享資料）。
- **Dispatcher**：負責執行 Context Switch、切換至 User Mode 並跳轉回使用者程式位置；其耗時稱為 **Dispatch Latency**。
- **五大評估準則**：最大化 **CPU Utilization**（實務目標 40%–90%）與 **Throughput**；最小化 **Turnaround Time**、**Waiting Time** 與 **Response Time**（互動式系統尤重降低回應時間變異數）。

---

## 二、經典單核排程演算法比較

| 演算法 | 搶占性 | 核心策略與特性 | 主要優缺點 |
| :--- | :--- | :--- | :--- |
| **FCFS** | 非搶占 | 依請求順序以 FIFO 佇列服務 | 實作最簡，但長行程會阻塞後方短行程，造成 **Convoy Effect** |
| **SJF / SRTF** | 非搶占 / 搶占 | 依下一次 CPU Burst 長度由短到長排程（搶占版稱 SRTF） | 理論上具備**最小平均等待時間**；實務無法預知未來長度，需以指數平均 $\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n$ 預測 |
| **Round-Robin (RR)** | 搶占 | 每個行程最多執行一個 Time Quantum $q$（10–100 ms）後排回佇列尾端 | 公平且回應佳；$q$ 過大退化為 FCFS，過小 Context Switch 開銷大（經驗法則：80% CPU burst $< q$） |
| **Priority** | 兩者皆可 | 依靜態或動態優先權排程 | 可能導致低優先權行程 **Starvation（飢餓）**，需搭配 **Aging**（隨等待時間提升優先權）解決 |
| **Multilevel Queue** | 依佇列設計 | 依行程類型（即時、系統、互動、批次）分入固定佇列，各自套用演算法 | 排程開銷低，但行程無法跨佇列移動，彈性較差 |
| **Multilevel Feedback Queue (MLFQ)** | 搶占 | 允許行程依 CPU 使用行為在多層佇列間升降級（短 Burst 留高層、長 Burst 下沉、久候升級） | 兼顧互動回應、短任務優先與防飢餓，是最通用但參數調校最複雜的演算法 |

---

## 三、執行緒與多處理器排程（Multicore / NUMA / HMP）

1. **Contention Scope**：Many-to-One / Many-to-Many 模型由執行緒函式庫於行程內競爭 LWP，稱 **PCS**（`PTHREAD_SCOPE_PROCESS`）；One-to-One 系統（Linux、Windows、macOS）僅支援全系統核心執行緒競爭，稱 **SCS**（`PTHREAD_SCOPE_SYSTEM`）。
2. **多核與 SMT（Hyper-Threading / CMT）**：
   - 處理器等待主記憶體時會發生 **Memory Stall**（可佔高達 50% 時間）。硬體透過單核多硬體執行緒（SMT）在 Stall 時切換執行另一執行緒，形成兩層排程：OS 將軟體執行緒排入邏輯 CPU，核心硬體再決定執行哪個硬體執行緒。
3. **負載平衡 vs. 處理器親和性（Processor Affinity）**：
   - 現代 SMP 多採每核心私有 Run Queue，並透過 **Push Migration** 與 **Pull Migration** 平衡負載。
   - **Processor Affinity** 盡量讓執行緒留在同一核心以重用 **Warm Cache**（Soft Affinity vs. Hard Affinity 如 Linux `sched_setaffinity()`）。在 **NUMA** 架構下，跨節點遷移還會導致遠端記憶體存取延遲，因此負載平衡與親和性之間存在天然張力。
4. **異質多處理（HMP, Heterogeneous Multiprocessing）**：如 ARM **big.LITTLE** 架構，將高效能 `big` 核心與省電 `LITTLE` 核心結合，依任務互動性或省電需求分派核心。

---

## 四、即時系統排程（Real-Time Scheduling）

- **Soft vs. Hard Real-Time**：Soft 僅保證即時行程優先於一般行程；Hard 必須嚴格在 **Deadline** 前完成（逾時視同失敗），需控制 **Event Latency**（= Interrupt Latency + Dispatch Latency）有明確上界，並搭配 **Admission Control**。
- **Rate-Monotonic (RM)**：針對週期性任務（$0 \le t \le d \le p$）採靜態優先權，週期越短優先權越高。雖為靜態優先權演算法中的最佳解，但有最差 CPU 利用率上限 $N(2^{1/N} - 1)$（$N \to \infty$ 時約 **69%**）。
- **Earliest-Deadline-First (EDF)**：動態依截止時間指派優先權（越早越優先），不限週期性任務，理論 CPU 利用率可達 **100%**。
- **Proportional Share**：分配總份額 $T$ 中的 $N/T$ 比例，搭配 Admission Control 確保份額足夠。

---

## 五、真實作業系統排程器實作案例

1. **Linux CFS（Completely Fair Scheduler）**：
   - 取代早期 $O(1)$ 排程器以改善互動回應。Real-Time 任務（`SCHED_FIFO`、`SCHED_RR`）使用靜態優先權 $0 \sim 99$；一般任務使用 `nice` 值（$-20 \sim +19$）對應全域優先權 $100 \sim 139$。
   - 不使用固定時間切片，而是設定 **Targeted Latency** 並追蹤每個任務的虛擬執行時間 `vruntime`（高優先權衰減較慢，I/O-bound 任務因常阻塞而 `vruntime` 較小，自然優先搶占）。
   - 所有可執行任務依 `vruntime` 存入 **Red-Black Tree**，並快取最左節點 `rb_leftmost` 以 $O(1)$ 取得下一個執行任務。負載平衡則依 **Scheduling Domains**（L2 共用 → L3/NUMA 節點）由底層向上進行，系統忙碌時避免跨 NUMA 節點遷移。
2. **Windows Scheduling**：
   - 32 級搶占式優先權（Variable 1–15、Real-Time 16–31），結合 6 種 Process Priority Class 與 7 種 Relative Priority。
   - 特色規則：前景視窗程式 Time Quantum ×3；I/O 等待結束時動態提升優先權（鍵盤 I/O 提升幅度大於磁碟）；支援 **UMS（User-Mode Scheduling）** 與 **SMT Sets / Ideal Processor** 種子輪替分散負載。
3. **Solaris Scheduling**：
   - 6 種排程類別（TS, IA, RT, SYS, FSS, FP）映射至全域優先權 0–169（160–169 為中斷執行緒）。TS/IA 採用「優先權越高、Time Quantum 越短」的反向 Dispatch Table。

---

## 六、演算法評估方法

- **Deterministic Modeling**（固定工作負載精確計算，適合教學與比較範例）
- **Queueing Models**（排隊網路分析，**Little's Formula**：$n = \lambda \times W$，但受限於數學假設）
- **Simulations**（亂數分布或錄製真實系統 **Trace Files** 驅動模擬）
- **Implementation**（實際編寫進核心並於真實環境與 **Regression Testing** 驗證）

## 七、關聯頁面
- **同軌來源出處**：[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]
- **同軌相關概念**：[[concepts/book/Processes-and-IPC]]、[[concepts/book/Threads-and-Concurrency]]

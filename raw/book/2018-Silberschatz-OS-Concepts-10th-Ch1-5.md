---
title: Operating System Concepts (10th Edition) - Chapters 1–5
authors: Abraham Silberschatz, Peter Baer Galvin, Greg Gagne
publisher: John Wiley & Sons, Inc.
year: 2018
isbn: 978-1-119-32091-3
original_attachment: Ch1-5 Abraham-Silberschatz-Operating-System-Concepts-10th-2018 (1).pdf
pages: 329 (PDF)
---

# Operating System Concepts (10th Edition) — Chapters 1–5 Raw Source

> 本檔案為透過對話附件匯入之原始教材內容整理，供 `wiki/` 層萃取與引用。

## 書目資訊
- **書名**：Operating System Concepts (Tenth Edition)
- **作者**：Abraham Silberschatz (Yale University), Peter Baer Galvin (Cambridge Computer / Starfish Storage), Greg Gagne (Westminster College)
- **出版**：Wiley, 2018（LCCN 2017043464 / ISBN 9781119320913）
- **涵蓋章節**：Part One Overview (Ch. 1–2)、Part Two Process Management (Ch. 3–5)

---

## Chapter 1: Introduction (pp. 3–54)
- **1.1 What Operating Systems Do**：系統四大組成（Hardware, OS, Application Programs, User）；User View vs. System View（Resource Allocator, Control Program）；Kernel、Middleware 與 System Programs；Moore's Law。
- **1.2 Computer-System Organization**：CPU、Device Controllers、Common Bus、Shared Memory Controller；Interrupts（Interrupt Vector, Interrupt-Request Line, Maskable vs. Nonmaskable, Interrupt Chaining, Interrupt Priority Levels）；Storage Structure（Registers, Cache, Main Memory/DRAM, EEPROM/Firmware, Secondary/NVS: Mechanical HDD vs. Electrical NVM/Flash/SSD, Tertiary Storage）；I/O Structure 與 DMA（Direct Memory Access，每區塊一次中斷）。
- **1.3 Computer-System Architecture**：Single-Processor Systems；Multiprocessor Systems（SMP Symmetric Multiprocessing, Multicore L1/L2 cache, NUMA Non-Uniform Memory Access, Blade Servers）；Clustered Systems（High Availability, Graceful Degradation, Fault Tolerant, Asymmetric Hot-Standby vs. Symmetric Clustering, Parallel Clusters, DLM, SAN, Hadoop: HDFS/YARN/MapReduce）。
- **1.4 Operating-System Operations**：Bootstrap Program、System Daemons（Linux `systemd`）、Trap/Exception 與 System Call；Multiprogramming 與 Multitasking（Time Sharing, Virtual Memory）；Dual-Mode & Multimode Operation（`mode bit`: `0` Kernel / `1` User, Privileged Instructions, Intel 4 Protection Rings, ARMv8 7 Modes, VMM Mode）；Timer（Fixed / Variable Timer, Linux `HZ` 與 `jiffies`）。
- **1.5 Resource Management**：Process Management、Memory Management、File-System Management、Mass-Storage Management、Cache Management（Cache Coherency、Distributed Replicas）、I/O System Management（Buffering, Caching, Spooling, Device Drivers）。
- **1.6 Security and Protection**：Protection（內部資源存取控制）vs. Security（內外部攻擊防禦）；User ID / SID、Group ID、Privilege Escalation（UNIX `setuid`）。
- **1.7 Virtualization**：Emulation（如 Rosetta，跨 ISA 翻譯成本高）vs. Virtualization（同 ISA 原生執行、VMM / Hypervisor 如 VMware ESX, Citrix XenServer, VirtualBox）。
- **1.8 Distributed Systems**：LAN / WAN / MAN / PAN、TCP/IP、Network OS vs. Distributed OS。
- **1.9 Kernel Data Structures**：Singly/Doubly/Circularly Linked Lists（`<linux/list.h>`）、Stack (LIFO)、Queue (FIFO, Linux `kfifo`)、Trees（Binary Search Tree, Balanced BST / Red-Black Tree `<linux/rbtree.h>`）、Hash Functions & Maps、Bitmaps。
- **1.10 Computing Environments**：Traditional, Mobile (iOS/Android), Client-Server, Peer-to-Peer (Napster/Gnutella/Skype), Cloud Computing (Public/Private/Hybrid, SaaS/PaaS/IaaS, EC2), Real-Time Embedded Systems（Hard vs. Soft Real-Time, ASICs）。
- **1.11 Free and Open-Source OS**：Free Software (FSF, Richard Stallman, GPL, Copyleft) vs. Open-Source；GNU/Linux (Linus Torvalds)、BSD UNIX (FreeBSD, NetBSD, OpenBSD)、Solaris / Illumos、macOS Darwin (`xnu`)。

---

## Chapter 2: Operating-System Structures (pp. 55–102)
- **2.1 Operating-System Services**：使用者導向服務（UI: GUI/Touch/CLI, Program Execution, I/O Operations, File-System Manipulation, Communications, Error Detection）；系統效率導向服務（Resource Allocation, Logging/Accounting, Protection & Security）。
- **2.2 User and OS Interface**：Command Interpreters / Shells（C shell, bash, ksh；內建指令 vs. 外部系統程式如 `rm`）；GUI（Xerox Alto 1973, Mac Aqua, Windows, KDE/GNOME）；Touch-Screen（iOS Springboard）。
- **2.3 System Calls**：C/C++ 介面、API vs. System Call（Windows API `CreateProcess()` -> `NTCreateProcess()`, POSIX API `libc` `read()`, Java API）；Run-Time Environment (RTE) 與 System-Call Interface；參數傳遞三法（Registers, Memory Block/Table, Stack；Linux ≤5 用暫存器、>5 用區塊）；六大類 System Calls（Process Control, File Management, Device Management, Information Maintenance, Communications, Protection）；單工（Arduino Bootloader）vs. 多工（FreeBSD `fork()`/`exec()`/`exit()`）範例。
- **2.4 System Services**：System Utilities（File Management, Status Info, File Modification, Language Support, Loading/Execution, Communications, Background Services / Daemons）。
- **2.5 Linkers and Loaders**：Source -> Compiler -> Relocatable Object File -> Linker -> Executable File -> Loader (Relocation, `fork()` + `exec()`)；Dynamic Linking（Windows DLL, 共享記憶體節省）；可執行檔格式（UNIX/Linux ELF, Windows PE, macOS Mach-O）。
- **2.6 Why Applications Are OS-Specific**：跨平台三法（Interpreted: Python/Ruby; VM/RTE: Java JVM; Standard API + Recompile: POSIX）；差異來源（Binary Format, CPU ISA, System Calls）；ABI (Application Binary Interface) 定義架構層級呼叫慣例。
- **2.7 OS Design and Implementation**：User Goals vs. System Goals；Separation of Policy (What) and Mechanism (How)；高階語言實作（C/C++/Java, 易於移植與編譯器最佳化，僅瓶頸需調校）。
- **2.8 Operating-System Structure**：
  - Monolithic Structure（傳統 UNIX, Linux — 單一位址空間效能高但緊耦合）
  - Layered Approach（層級除錯容易但效能差、層級定義困難）
  - Microkernels（CMU Mach, QNX — 非必要服務移至 User Space 透過 Message Passing 通訊，高擴充性與可靠性但複製訊息開銷大）
  - Loadable Kernel Modules (LKMs)（Linux, macOS kexts, Windows — 執行期動態載入，兼顧模組化與效能）
  - Hybrid Systems：macOS/iOS（Darwin = Mach + BSD + I/O Kit + kexts 同處單一位址空間免除訊息複製，上層 Aqua/Springboard, Cocoa/Cocoa Touch, Core Frameworks）；Android（Linux Kernel + Binder IPC + Bionic libc + HAL + Native Libraries + ART AOT 編譯 `.dex` + Android Frameworks）；Windows 10（Hybrid + WSL Pico Processes 與 LXSS/LXCore 轉譯 Linux syscalls）。
- **2.9 Building and Booting an OS**：OS Generation（System Build vs. Precompiled Modules vs. Modular）；Linux 編譯流程（`make menuconfig` -> `make` -> `make modules` -> `make modules_install` -> `make install`）；System Boot（BIOS 多階段 Boot Block vs. UEFI；GRUB `/proc/cmdline`；`initramfs` -> `systemd`；Android LK Bootloader 保留 `initramfs`；Recovery / Single-User Mode）。
- **2.10 OS Debugging**：Failure Analysis（Log, Core Dump, Kernel Crash Dump 至無檔案系統磁區）；Performance Monitoring（Counters: `ps`, `top`, `vmstat`, `netstat`, `iostat`, `/proc`；Tracing: `strace`, `gdb`, `perf`, `tcpdump`）；BCC / eBPF（Python 前端 + C 編譯為 eBPF 位元組碼經 Verifier 驗證後動態插入核心，低開銷追蹤如 `disksnoop.py`, `opensnoop`）。

---

## Chapter 3: Processes (pp. 105–157)
- **3.1 Process Concept**：Process（主動實體）vs. Program（被動實體）；Memory Layout（Text, Data [initialized/uninitialized bss], Heap 向上長, Stack 向下長, `argc`/`argv`）；Process States（New, Ready, Running, Waiting, Terminated）；Process Control Block (PCB)（Linux `task_struct` 與雙向鏈結串列、`current` 指標）。
- **3.2 Process Scheduling**：Degree of Multiprogramming；I/O-bound vs. CPU-bound；Ready Queue & Wait Queues；Swapping；Context Switch（純開銷，依賴硬體暫存器組與記憶體管理複雜度）；Mobile Multitasking（iOS 演進與 Split-screen, Android Background Service）。
- **3.3 Operations on Processes**：Process Tree（`pid`, `systemd` pid=1, `ps -el`, `pstree`）；`fork()`（子行程回傳 0，父行程回傳子 `pid`）、`exec()`、`wait()`；Windows `CreateProcess()`（10 個參數）與 `WaitForSingleObject()`；Process Termination（`exit()`, Cascading Termination, Zombie Process 未被 `wait()`, Orphan Process 由 `init`/`systemd` 收養）；Android Process Importance Hierarchy（Foreground > Visible > Service > Background > Empty）。
- **3.4–3.6 Interprocess Communication (IPC)**：Independent vs. Cooperating Processes；Shared Memory（建立後不需核心介入、速度快、需自行同步，Bounded Buffer 循環陣列方案）vs. Message Passing（`send`/`receive`、適合少量資料與分散式系統，Naming: Direct Symmetric/Asymmetric vs. Indirect Mailboxes/Ports；Synchronization: Blocking/Synchronous vs. Nonblocking/Asynchronous，雙阻塞為 Rendezvous；Buffering: Zero/Bounded/Unbounded Capacity）。
- **3.7 Examples of IPC Systems**：
  - POSIX Shared Memory（`shm_open()`, `ftruncate()`, `mmap()`, `shm_unlink()`）
  - Mach Message Passing（Ports, Port Rights, `mach_msg()`, Virtual Memory 映射避免 intrasystem 複製）
  - Windows ALPC（Connection Ports & Communication Ports；≤256B 複製、較大用 Section Object 共享記憶體、超大用直接讀寫 API）
  - Pipes（Ordinary/Anonymous Pipes 單向且限父子行程 `pipe(fd)`；Named Pipes / UNIX FIFOs `mkfifo()` 半雙工限同機 vs. Windows `CreateNamedPipe()` 全雙工可跨機）
- **3.8 Communication in Client–Server Systems**：Sockets（IP + Port，Well-known ports <1024，Loopback `127.0.0.1`，TCP `Socket`/UDP `DatagramSocket`/Multicast）；RPC（Stubs, Parameter Marshaling & XDR 解決 Big/Little-Endian 差異, At-most-once 時間戳記 vs. Exactly-once ACK, Dynamic Binding via Matchmaker/Rendezvous）；Android RPC（Binder Framework + `Service`/`onBind()` + `Messenger` 或 AIDL 介面生成 Stub）。

---

## Chapter 4: Threads & Concurrency (pp. 159–198)
- **4.1 Overview**：Thread（Thread ID, PC, Register Set, Stack；共享 Code, Data, Files）；四大優勢（Responsiveness, Resource Sharing, Economy, Scalability）；Linux 核心執行緒 `kthreadd` (pid=2)。
- **4.2 Multicore Programming**：Concurrency（單核交錯執行）vs. Parallelism（多核同時執行）；五大挑戰（Identifying tasks, Balance, Data splitting, Data dependency, Testing & debugging）；**Amdahl's Law**：$\text{speedup} \le \frac{1}{S + \frac{1-S}{N}}$（當 $N \to \infty$，加速上限為 $1/S$）；Data Parallelism vs. Task Parallelism。
- **4.3 Multithreading Models**：Many-to-One（阻塞系統呼叫會卡住全行程，無法多核平行，如早年 Green threads）；One-to-One（Linux 與 Windows 採用，可多核平行但執行緒數量受限於核心開銷）；Many-to-Many 與 Two-level Model。
- **4.4 Thread Libraries**：Asynchronous vs. Synchronous Threading；POSIX Pthreads（`pthread_create`, `pthread_join`, `pthread_exit`）、Windows Threads（`CreateThread`, `WaitForSingleObject`, `WaitForMultipleObjects`）、Java Threads（`Thread`, `Runnable`, Lambda, `ExecutorService`, `Callable` & `Future`）。
- **4.5 Implicit Threading**：將執行緒管理交給編譯器／執行期函式庫，開發者只需標註 Tasks：
  - Thread Pools（限制上限、重用執行緒；Windows `QueueUserWorkItem`、Java `Executors` `newSingleThreadExecutor`/`newFixedThreadPool`/`newCachedThreadPool`、Android AIDL Thread Pool）
  - Fork-Join（Java `ForkJoinPool`, `ForkJoinTask` -> `RecursiveTask<V>` / `RecursiveAction`, Work Stealing 演算法）
  - OpenMP（`#pragma omp parallel`, `#pragma omp parallel for`）
  - Grand Central Dispatch (GCD)（Apple `libdispatch`，Serial/Private vs. Concurrent/Global Dispatch Queues，4 種 QoS 等級，C Blocks `^{}` / Swift Closures）
  - Intel Thread Building Blocks (TBB)（C++ 樣板函式庫 `parallel_for`，Cache-aware 與 Load Balancing）
- **4.6 Threading Issues**：`fork()`（複製全執行緒 vs. 僅呼叫者）與 `exec()`（替換整個行程）；Signal Handling（Synchronous vs. Asynchronous，UNIX `kill()` vs. `pthread_kill()`，Windows APCs）；Thread Cancellation（Asynchronous vs. Deferred Cancellation + Cancellation Points / `pthread_testcancel()` + Cleanup Handler；Java `interrupt()`/`isInterrupted()`）；Thread-Local Storage (TLS：`ThreadLocal<T>`, `pthread_key_t`, `[ThreadStatic]`, `__thread`)；Scheduler Activations（LWP Lightweight Process 與 Kernel Upcalls）。
- **4.7 OS Examples**：Windows Threads（`ETHREAD`, `KTHREAD` 於 Kernel Space；`TEB` 於 User Space）；Linux Threads（不區分 Process 與 Thread，皆稱 Task，`clone()` 旗標 `CLONE_FS`, `CLONE_VM`, `CLONE_SIGHAND`, `CLONE_FILES` 控制共享程度，亦為 Linux Containers 基礎）。

---

## Chapter 5: CPU Scheduling (pp. 199–254)
- **5.1 Basic Concepts**：CPU–I/O Burst Cycle（指數量測分布：大量短 CPU burst、少量長 CPU burst）；Preemptive vs. Nonpreemptive Scheduling（四大排程時機 1–4；Preemptive Kernel 需 Mutex 保護核心資料結構）；Dispatcher 與 Dispatch Latency。
- **5.2 Scheduling Criteria**：CPU Utilization、Throughput、Turnaround Time、Waiting Time、Response Time（互動系統重視降低 Response Time 變異數）。
- **5.3 Scheduling Algorithms**：
  - FCFS（FIFO，非搶占，易生 Convoy Effect）
  - SJF / SRTF（理論最佳平均等待時間，實務以指數平均 $\tau_{n+1} = \alpha t_n + (1-\alpha)\tau_n$ 預測下一段 CPU burst）
  - Round-Robin (RR)（Time Quantum $q$ 通常 10–100 ms，過大退化為 FCFS，過小 Context Switch 開銷過高；經驗法則：80% CPU burst 應短於 $q$）
  - Priority Scheduling（靜態/動態優先權，缺點 Starvation/Indefinite Blocking，解法 Aging）
  - Multilevel Queue（依行程類型分佇列，各佇列可用不同演算法，佇列間固定優先權或時間切割）
  - Multilevel Feedback Queue (MLFQ)（允許行程依 CPU burst 行為在佇列間升降級，兼顧 I/O-bound 回應與防止 Starvation，但參數調校最複雜）
- **5.4 Thread Scheduling**：PCS (Process-Contention Scope, `PTHREAD_SCOPE_PROCESS`) vs. SCS (System-Contention Scope, `PTHREAD_SCOPE_SYSTEM`，Linux/macOS/Windows 僅用 SCS)。
- **5.5 Multi-Processor Scheduling**：Asymmetric vs. Symmetric (SMP：共用佇列鎖競爭 vs. 每核私有佇列)；Multicore Memory Stall（最高可達 50% 時間等待記憶體）-> Hardware Threads / CMT / Hyper-Threading / SMT（Coarse-grained vs. Fine-grained，兩層排程）；Load Balancing（Push vs. Pull Migration）；Processor Affinity（Soft vs. Hard `sched_setaffinity()`，Warm Cache 與 NUMA 記憶體延遲權衡）；Heterogeneous Multiprocessing (HMP, ARM `big.LITTLE`)。
- **5.6 Real-Time CPU Scheduling**：Soft vs. Hard Real-Time；Event Latency = Interrupt Latency + Dispatch Latency（Conflict + Dispatch 階段）；Periodic Tasks（$0 \le t \le d \le p$）與 Admission Control；Rate-Monotonic (RM)（靜態優先權依週期反比，最差利用率上限 $N(2^{1/N}-1)$，趨近 $\ln 2 \approx 69\%$）；Earliest-Deadline-First (EDF)（動態優先權依截止時間，理論可達 100%）；Proportional Share；POSIX.1b（`SCHED_FIFO`, `SCHED_RR`, `SCHED_OTHER`）。
- **5.7 OS Examples**：
  - Linux CFS (Completely Fair Scheduler)：取代 $O(1)$ 排程器；Nice 值 $-20 \sim +19$ 對應全球優先權 $100 \sim 139$（Real-Time 為 $0 \sim 99$）；Targeted Latency 與 `vruntime`；Red-Black Tree（`rb_leftmost` 快取最小 `vruntime`）；NUMA-aware Scheduling Domains 階層式負載平衡。
  - Windows Scheduling：32 級搶占式優先權（Variable 1–15, Real-Time 16–31），6 種 Process Priority Class + 7 種 Relative Priority；前景程式 Time Quantum ×3；I/O 完成提升優先權；User-Mode Scheduling (UMS / ConcRT) 克服 Fiber 共享 TEB 缺陷；SMT Sets 與 Ideal Processor 種子輪替。
  - Solaris Scheduling：6 類別（TS, IA, RT, SYS, FSS, FP）映射至全域優先權 0–169（含 160–169 中斷執行緒）；TS/IA 採用反向關係之 Time Quantum 與 Dispatch Table。
- **5.8 Algorithm Evaluation**：Deterministic Modeling、Queueing Models（Little's Formula $n = \lambda \times W$）、Simulations（Random Distribution vs. Trace Files）、Implementation（Regression Testing 與調校）。

---
title: 行程管理與行程間通訊（IPC）
type: concept
source_type: book
tags:
  - course-notes
  - book
  - operating-systems
  - processes
  - ipc
  - rpc
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]"
status: growing
---

# 行程管理與行程間通訊（IPC）

## 一、行程（Process）的定義與記憶體配置

根據 [[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5|Operating System Concepts (Ch.3)]]，**Program** 是儲存於磁碟上的被動（Passive）可執行檔，而 **Process** 是載入記憶體執行中的主動（Active）實體。

一個行程在記憶體中的配置分為四個主要區段（另在 C 程式高記憶體區包含 `argc`/`argv`）：
1. **Text Section**：可執行程式碼（固定大小）。
2. **Data Section**：全域變數（細分為已初始化的 `data` 與未初始化的 `bss`，固定大小）。
3. **Heap Section**：執行期動態配置（如 `malloc`）的記憶體，由低位址向高位址動態增長。
4. **Stack Section**：函式呼叫時的暫存資料（Activation Record：參數、區域變數、返回位址），由高位址向低位址動態增長；作業系統須確保 Stack 與 Heap 不重疊。

### 行程狀態與 PCB（Process Control Block）
- **五種狀態**：`New` → `Ready` ↔ `Running`（單一核心同時只能有一個行程處於 Running）→ `Waiting`（等待 I/O 或事件）→ `Terminated`。
- **PCB（Task Control Block）**：儲存重啟行程所需的所有狀態（Process State、Program Counter、CPU Registers、排程參數、記憶體管理資訊、會計統計與 I/O 開啟檔案清單）。在 Linux 核心中，PCB 由 `<include/linux/sched.h>` 的 `struct task_struct` 實作，並以雙向鏈結串列串起所有活躍行程，由 `current` 指標指向當前執行中的行程。

---

## 二、行程排程佇列與上下文切換（Context Switch）

- **佇列流轉**：行程進入系統後置於 **Ready Queue**；等待 I/O 或子行程結束時移入對應的 **Wait Queue**。
- **Context Switch**：當 CPU 核心切換執行另一行程時，核心必須將舊行程的 CPU 暫存器、狀態與記憶體管理資訊存入其 PCB（State Save），並載入新行程的 PCB 狀態（State Restore）。**Context Switch 是純系統開銷（Pure Overhead）**，耗時數微秒，取決於記憶體速度、暫存器數量（若硬體提供多組暫存器組可僅切換指標）與位址空間保存複雜度。

---

## 三、行程建立、終止與特殊狀態

1. **UNIX/Linux 建立模型（`fork()` + `exec()`）**：
   - `fork()` 複製父行程位址空間建立子行程；子行程收到回傳值 `0`，父行程收到子行程的 `pid`。
   - 子行程常接著呼叫 `exec()`（如 `execlp()`）以新程式覆寫自身記憶體空間；父行程可呼叫 `wait()` 阻塞等待子行程結束，或與其並行執行。
   - **Windows 對比**：`CreateProcess()` 需傳入至少 10 個參數，且在建立當下即直接載入指定的新程式，不複製父行程位址空間；對應 `wait()` 的函式為 `WaitForSingleObject()`。
2. **終止、殭屍與孤兒行程**：
   - **Zombie Process（殭屍行程）**：子行程已呼叫 `exit()` 終止並釋放資源，但父行程尚未呼叫 `wait()` 讀取其結束狀態，因此仍佔用 Process Table 項目。
   - **Orphan Process（孤兒行程）**：父行程未呼叫 `wait()` 即提前終止，導致子行程失去父行程。傳統 UNIX 由 `init`（`pid = 1`）收養並定期 `wait()` 回收；現代 Linux 由 `systemd`（或指定繼承行程）處理。
3. **Android 行程重要性階層**：因行動裝置記憶體有限，系統回收資源時依序由低到高終止：Empty → Background → Service → Visible → Foreground Process。

---

## 四、行程間通訊（IPC：Interprocess Communication）

協作行程（Cooperating Processes）可透過兩種基本模型交換資料：

| 比較維度 | Shared Memory（共享記憶體） | Message Passing（訊息傳遞） |
| :--- | :--- | :--- |
| **核心介入時機** | 僅在「建立」共享區段時需系統呼叫，之後如同一般記憶體存取，**速度極快** | 每次 `send()` / `receive()` 皆透過系統呼叫由核心轉送 |
| **同步責任** | **應用程式自行負責**避免同時寫入衝突（如 Bounded Buffer 循環陣列） | 由作業系統／通訊鏈結處理，無須處理記憶體衝突 |
| **適用場景** | 同機大量資料高速交換（如 POSIX `shm_open` + `ftruncate` + `mmap`） | 少量資料交換、**跨機器分散式系統** |

### 訊息傳遞的設計維度
- **Naming（命名）**：Direct（直接指定對方行程 ID，模組性較差）vs. Indirect（透過共享 **Mailbox / Port**，支援多對多彈性綁定）。
- **Synchronization（同步）**：Blocking（Synchronous）vs. Nonblocking（Asynchronous）；當 `send()` 與 `receive()` 皆為 Blocking 時稱為 **Rendezvous**。
- **Buffering（緩衝）**：Zero Capacity（無緩衝，傳送端必阻塞）、Bounded Capacity（有限佇列，滿時阻塞）、Unbounded Capacity（無限佇列，傳送端永不阻塞）。

### 實務 IPC 與 Client–Server 機制
- **Mach Message Passing**：透過 **Port** 與 **Port Rights** 控制存取權限；為避免同機傳遞大量訊息的複製開銷，Mach 利用虛擬記憶體將傳送端位址空間直接映射給接收端。
- **Windows ALPC**：同機雙向通道，依訊息大小採三種策略：$\le 256\text{ bytes}$ 經由 Port 佇列複製；較大訊息使用共享記憶體 **Section Object**；超大資料則透過 API 直接讀寫客戶端位址空間。
- **Pipes**：
  - **Ordinary / Anonymous Pipes**：單向、僅限具父子關係之同機行程（UNIX `pipe(fd)`，`fd[0]` 讀、`fd[1]` 寫；Windows `CreatePipe()` 需顯式設定句柄繼承）。
  - **Named Pipes**：無須父子關係、可長期存在。UNIX **FIFOs**（`mkfifo()`）僅支援半雙工與同機位元組串流；Windows `CreateNamedPipe()` 支援全雙工、跨網路與訊息導向傳輸。
- **Sockets & RPC**：
  - **Sockets**：網路通訊端點（IP + Port，`<1024` 為 Well-known Ports，Loopback `127.0.0.1`），傳送無結構的位元組串流（TCP `Socket` / UDP `DatagramSocket`）。
  - **RPC（Remote Procedure Calls）**：將跨機訊息包裝為類似本地函式呼叫，透過 Client/Server **Stubs** 與 **Parameter Marshaling**（如 **XDR** 格式解決 Big-Endian 與 Little-Endian 差異）傳遞結構化參數；可透過時間戳記實現 *at-most-once*，加上 ACK 重傳實現 *exactly-once*，並由 Matchmaker（Rendezvous Daemon）進行動態 Port 綁定。
  - **Android Binder / RPC**：同機行程間亦廣泛使用 RPC，透過 `Service` 的 `onBind()` 與 **AIDL** 自動生成 Stub 處理參數序列化與跨行程呼叫。

## 五、關聯頁面
- **同軌來源出處**：[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]
- **同軌相關概念**：[[concepts/book/OS-Architecture-and-System-Calls]]、[[concepts/book/Threads-and-Concurrency]]、[[concepts/book/CPU-Scheduling]]

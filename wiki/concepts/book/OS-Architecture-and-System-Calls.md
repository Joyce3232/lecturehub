---
title: 作業系統架構、系統呼叫與核心除錯
type: concept
source_type: book
tags:
  - course-notes
  - book
  - operating-systems
  - architecture
  - system-calls
  - kernel
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]"
status: growing
---

# 作業系統架構、系統呼叫與核心除錯

## 一、硬體組織、中斷與儲存階層

根據 [[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5|Operating System Concepts (Ch.1–2)]]，作業系統作為硬體與應用程式之間的中介層，其運作建立在三個核心硬體機制上：

1. **中斷驅動（Interrupt-Driven I/O）與 DMA**：
   - 硬體透過系統匯流排發送訊號至 CPU 的 Interrupt-Request Line，CPU 透過 **Interrupt Vector**（中斷向量表）跳轉至對應的 Interrupt Service Routine (ISR) 並保存暫存器狀態。
   - 現代 CPU 區分 **Maskable**（可遮罩，供裝置請求）與 **Nonmaskable**（不可遮罩，如嚴重記憶體錯誤），並透過 **Interrupt Chaining** 與優先權分級處理多裝置事件。
   - 大量資料傳輸（如磁碟 I/O）採用 **DMA（Direct Memory Access）**，由裝置控制器直接將整個資料區塊搬移至主記憶體，每個區塊僅產生一次中斷，大幅降低 CPU 介入成本。
2. **儲存階層（Storage-Device Hierarchy）**：
   - 由快到慢、由小到大依序為：Registers → Cache (SRAM) → Main Memory (DRAM，揮發性) → Nonvolatile Memory (NVM，如 Flash/SSD) → Hard-Disk Drives (HDD，機械式) → Optical Disk / Magnetic Tapes（Tertiary Storage）。
   - **快取一致性（Cache Coherency）**：在多處理器系統中，同一資料可能同時存在於多個 CPU 的本地快取中，必須確保一處更新立即反映於其他快取（通常由硬體層處理）。
3. **雙重模式與多模式保護（Dual-Mode Operation）**：
   - 硬體提供 `mode bit` 區分 **Kernel Mode (`0`)** 與 **User Mode (`1`)**。唯有核心模式可執行 **Privileged Instructions**（如切換模式、I/O 控制、修改計時器與中斷管理）。
   - 若使用者程式在 User Mode 嘗試執行特權指令，硬體會將其視為非法並觸發 **Trap** 交由作業系統終止。現代架構更延伸出多層級模式（如 Intel 4 個 Protection Rings、ARMv8 7 種模式，以及支援虛擬化的 **VMM Mode**）。

---

## 二、系統呼叫（System Calls）、API 與 ABI

1. **API 與 System-Call Interface 的分層**：
   - 開發者通常不直接呼叫底層系統呼叫，而是透過高階 **API**（如 POSIX `libc`、Windows API、Java API）提升程式可攜性。
   - 當程式呼叫 API（例如 `open()` 或 `printf()`）時，**Run-Time Environment (RTE)** 中的 **System-Call Interface** 會攔截該呼叫，依系統呼叫編號查表並觸發 Trap 進入核心模式執行（例如 Windows `CreateProcess()` 對應核心 `NTCreateProcess()`）。
2. **參數傳遞的三種方式**：
   - 透過 CPU 暫存器直接傳遞（Linux 在參數 $\le 5$ 個時採用）。
   - 將參數存於記憶體區塊（Block/Table），僅把區塊位址透過暫存器傳入（Linux $> 5$ 個參數時採用）。
   - 推入 Stack 後由作業系統彈出（無數量與長度限制）。
3. **跨平台障礙與 ABI**：
   - 編譯後的執行檔具有作業系統與 CPU 相依性，原因包括：不同的可執行檔格式（Linux/UNIX 的 **ELF**、Windows 的 **PE**、macOS 的 **Mach-O**）、不同的 CPU 指令集（ISA），以及相異的系統呼叫慣例。
   - **ABI（Application Binary Interface）** 定義了特定架構與作業系統下的二進位介面標準（位址寬度、系統呼叫傳參方式、資料型別大小等），相當於架構層級的 API。

---

## 三、作業系統核心架構演進

| 架構類型 | 核心設計方式 | 代表系統 | 優點 | 缺點 |
| :--- | :--- | :--- | :--- | :--- |
| **Monolithic（單體式）** | 所有核心功能置於單一靜態二進位檔與單一位址空間 | 傳統 UNIX、Linux | 系統呼叫與核心內部通訊極快、開銷極低 | 緊耦合，修改與擴充難度高 |
| **Layered（分層式）** | 嚴格分層（Layer 0 為硬體，Layer $N$ 為 UI），每層僅能呼叫下層 | 網路協定堆疊 (TCP/IP) | 建構與除錯簡單（逐層驗證） | 請求需穿越多層導致效能差、層級職責難以切分 |
| **Microkernel（微核心）** | 僅保留最小行程／記憶體管理與通訊機制，其餘移至 User Space | CMU Mach、QNX Neutrino | 高度模組化、易移植；單一服務崩潰不影響核心 | User Space 服務間需透過 Message Passing 複製訊息與切換行程，效能開銷大 |
| **Loadable Kernel Modules (LKMs)** | 核心僅含基礎元件，驅動程式與檔案系統於開機或執行期動態載入 | Linux、Solaris、macOS (`kexts`) | 兼具單體式的高效能與模組化的動態彈性，免重編譯核心 | 模組仍於核心空間執行，錯誤可能影響核心穩定性 |
| **Hybrid（混合式）** | 結合單體式效能、微核心抽象與動態模組 | macOS/iOS (Darwin)、Windows 10、Android | 兼顧效能、安全性與系統擴充性 | 整體架構複雜度較高 |

### 代表性混合架構細節
- **macOS / iOS (Darwin)**：由 Mach 微核心與 BSD UNIX 核心共同組成，並整合 I/O Kit 與 `kexts`。為解決純 Mach 的訊息複製效能瓶頸，Darwin 將 Mach、BSD 與 I/O Kit 放入**單一位址空間**，使訊息傳遞不需複製資料；對外提供 Mach Traps 與 BSD (POSIX) 雙重系統呼叫介面。
- **Android**：以修改後的 Linux Kernel 為底層（加入電源管理與 **Binder** IPC），向上依序為 **Bionic** 精簡 C 函式庫（體積小且避開 glibc 的 GPL 授權）、**HAL（Hardware Abstraction Layer）**、Native Libraries（SQLite, SSL, WebKit）、**ART（Android RunTime）**（安裝時以 AOT 提前編譯 `.dex` 為原生機器碼以省電提速），以及 Java 應用框架。
- **Windows Subsystem for Linux (WSL)**：於 Windows 10 混合架構中透過 **Pico Processes** 執行原生 Linux ELF 二進位檔，並由核心服務 `LXCore` / `LXSS` 將 Linux 系統呼叫（如 `fork()`）即時轉譯或對應至 Windows 原生呼叫（如 `CreateProcess()`）。

---

## 四、系統啟動與核心動態追蹤（BCC / eBPF）

- **啟動流程（Booting）**：BIOS（多階段載入 Boot Block）或 UEFI（單一完整啟動管理員）→ Boot Loader（如 Linux **GRUB**）載入壓縮核心與暫時記憶體檔案系統 `initramfs` → 載入驅動並切換至真實 Root File System → 啟動初始行程 `systemd`（Android 則由 **LK** 載入並永久保留 `initramfs` 作為根檔案系統）。
- **核心追蹤與 BCC / eBPF**：傳統 `strace`/`perf`/`tcpdump` 或 `/proc` 計數器難以在不影響線上系統下同時觀測 User 與 Kernel 互動。Linux **eBPF** 允許將受限 C 語言編譯為位元組碼，經核心 **Verifier** 確認安全與不影響效能後，透過 Probes/Tracepoints 動態插入運行中的核心；**BCC** 提供 Python 前端包裝（如 `disksnoop.py`、`opensnoop`），實現低開銷的生產環境即時除錯。

## 五、關聯頁面
- **同軌來源出處**：[[sources/book/2018-Silberschatz-OS-Concepts-Ch1-5]]
- **同軌相關概念**：[[concepts/book/Processes-and-IPC]]、[[concepts/book/Threads-and-Concurrency]]

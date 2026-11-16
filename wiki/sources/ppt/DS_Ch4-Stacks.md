---
title: 資料結構 Ch.4 Stacks 課程簡報摘要
type: source
source_type: ppt
tags:
  - course-notes
  - ppt
  - data-structures
  - stack
  - source
created: 2026-11-16
updated: 2026-11-16
authors: "Kuen-Liang Sue (IM/NCU)"
published: 2026-11-16
raw_file: "raw/ppt/DS_Ch4.pdf"
source_url: ""
status: growing
---

# 資料結構 Ch.4 Stacks 課程簡報摘要

- **來源軌道**：`PPT（課程簡報）`
- **原始檔案**：`raw/ppt/DS_Ch4.pdf`（共 42 頁、84 張投影片）
- **授課教師／作者**：Kuen-Liang Sue（國立中央大學資訊管理學系 IM/NCU）

## 一、一句話核心結論

本簡報定義堆疊（Stack）為後進先出（LIFO）的受限線性串列，說明其鏈結串列與陣列兩種抽象資料型別（ADT）實作方式，並深入演練資料反轉、括號解析、中序轉後序與求值、以及回溯法（目標搜尋與八皇后問題）四大核心應用。

## 二、涵蓋範圍與核心問題

1. **Basic Stack Operations**：LIFO 特性與三大基本操作（`Push`、`Pop`、`Stack Top`）及溢位／下溢邊界條件（Overflow / Underflow）。
2. **Stack Linked List Implementation**：堆疊頭節點（`count`, `top`）與資料節點（`data`, `next`），以及八大基本操作（含 `emptyStack`、`fullStack`、`stackCount`、`destroyStack`）。
3. **Stack Applications**：四大應用分類——**Reversing Data**、**Parsing Data**、**Postponing Data Usage**、**Backtracking Steps**。
4. **Stack Abstract Data Type (ADT) Implementation**：以資料隱藏（Data Hiding）原則將堆疊封裝為可重用函式庫。
5. **Stack ADT - Array Implementation**：已知最大容量時的陣列實作結構（`stackAry`、`count`、`stackMax`、`top` 索引）。

## 三、重點整理與技術／理論細節

- **三大核心操作差異**：
  - `Push`：將資料放入頂端，需檢查是否空間不足（**Overflow**）。
  - `Pop`：移除頂端元素並回傳給呼叫端，空堆疊時發生 **Underflow**。
  - `Stack Top`：複製並回傳頂端元素**但不刪除**，空堆疊時同樣發生 **Underflow**。
- **資料隱藏（Data Hiding）設計**：雖然 `emptyStack`、`stackCount` 等操作僅包含單行判斷或回傳 `stack.count`，仍需獨立封裝為模組，因為呼叫端程式（User）不應直接存取堆疊內部結構。
- **中序轉後序（Infix to Postfix）優先權規則**：
  - 運算子優先權：Priority 2（`*`, `/`）> Priority 1（`+`, `-`）> Priority 0（`(`）。
  - 遇到運算元直接輸出；遇到 `(` 推入堆疊；遇到 `)` 連續彈出並輸出直到遇見 `(`；遇到一般運算子時，若堆疊非空且 `priority(token) <= priority(topToken)`，先彈出並輸出堆疊頂端運算子，再將新運算子推入。
- **後序式求值（Postfix Evaluation）**：堆疊內存放的是**運算元數值**（而非變數名稱）；讀到運算子時依序彈出 `operand2` 與 `operand1`，計算 `operand1 operator operand2` 後推回堆疊。
- **鏈結串列 vs. 陣列實作選擇**：若程式撰寫前即可計算出堆疊的最大元素數量，使用**陣列實作**更有效率（無需 `next` 指標欄位與動態記憶體配置，`top` 為陣列索引）。

## 四、關鍵圖表、公式或範例紀錄

- **Table 4-1（中序轉後序逐步追蹤）**：完整追蹤 `A * B - ( C + D ) + E` 轉換為 `A B * C D + - E +` 的 Input Buffer、Operator Stack 與 Output String 狀態。
- **Figure 4-13（後序求值追蹤）**：以 `2 4 6 + *` 為例演示運算元堆疊變化，得出結果 `20`。
- **Figure 4-14 & 4-15（目標搜尋回溯）**：展示分支點（如 `B12`、`B8`、`B9`、`B17`）如何透過堆疊記憶決策點並在死路時回溯至目標節點 `16`。
- **Figure 4-17（四皇后問題步驟圖）**：以 $4 \times 4$ 棋盤逐步示範皇后擺放與失敗回溯（Step 1–8），最終解為 `(1,2), (2,4), (3,1), (4,3)`。

## 五、限制、假設或未解疑問

- `inToPostFix`（Algorithm 4-12）假設輸入的中序運算式已先經過語法驗證（無括號不對稱或非法運算子）。
- 投影片提及 Section 4-4 有 C++ 實作範例，但未完整展開於本份 PPT 投影片內（`[待確認]` 需參閱對應教科書章節）。

## 六、與同軌知識庫的關聯
- **同軌概念頁**：
  - [[concepts/ppt/Stacks-and-Applications|堆疊（Stack）資料結構、ADT 實作與四大應用]]
- **同軌相關章節**：[[sources/ppt/DS_Ch3-Linked-Lists|資料結構 Ch.3 Linked Lists 課程簡報摘要]]

---
title: 堆疊（Stack）資料結構、ADT 實作與四大應用
type: concept
source_type: ppt
tags:
  - course-notes
  - ppt
  - data-structures
  - stack
  - algorithms
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/ppt/DS_Ch4-Stacks]]"
status: growing
---

# 堆疊（Stack）資料結構、ADT 實作與四大應用

> 本頁僅累積來自 **`ppt` 軌道（`raw/ppt/`）** 之知識內容；若需對照另一軌道的說法，請見文末「對應他軌參考」或 `wiki/comparisons/`。

## 一、定義與核心直覺

根據 [[sources/ppt/DS_Ch4-Stacks|資料結構 Ch.4 課程簡報]]，**堆疊（Stack）** 是一種受限的線性串列（Restricted Linear List），所有新增與刪除操作都僅限於同一端——**頂端（Top）**，因此具備 **LIFO（Last In, First Out，後進先出）** 特性。例如依序輸入 `{5, 10, 15, 20}`，取出順序必為 `{20, 15, 10, 5}`。

### 三大基本操作與邊界異常
- **Push**：將資料放入堆疊頂端；若空間已滿則發生 **Overflow**。
- **Pop**：移除堆疊頂端資料並回傳給呼叫端；若堆疊為空則發生 **Underflow**。
- **Stack Top**：複製並回傳頂端資料**但不刪除**（用來偷看即將被 Pop 的元素）；若堆疊為空同樣發生 **Underflow**。

---

## 二、運作機制與詳細說明

### 1. 鏈結串列實作（Stack Linked List Implementation）
將堆疊設計為抽象資料型別（ADT）可放入函式庫重複呼叫，並透過**資料隱藏（Data Hiding）**避免外部直接存取內部指標。
- **結構定義**：
  - `stack` 標頭結構：`count`（`<integer>`）、`top`（`<node pointer>`）。
  - `node` 資料節點：`data`（`<dataType>`）、`next`（`<node pointer>`）。
- **八大標準操作（Algorithm 4-1–4-8）**：
  - `createStack`：初始化 `stack.count = 0`、`stack.top = null`。
  - `pushStack`：檢查 `stack full`（記憶體配置失敗回傳 `false`），否則配置 `newPtr`，令 `newPtr->next = stack.top`、`stack.top = newPtr`、`stack.count++`。
  - `popStack`：檢查 `stack empty`（回傳 `false`），否則保存 `dltPtr = stack.top`、`dataOut = stack.top->data`、更新 `stack.top = stack.top->next`、`stack.count--` 並 `recycle(dltPtr)`。
  - `stackTop`：若非空則回傳 `stack.top->data`。
  - `emptyStack` / `fullStack` / `stackCount`：封裝狀態檢查，體現資料隱藏原則。
  - `destroyStack`：迴圈逐一釋放 `stack.top` 所指節點並重設 `stack.count = 0`。

### 2. 陣列實作（Stack ADT - Array Implementation）
- **適用時機**：若在撰寫程式前即可確定堆疊的**最大容量**，陣列實作比鏈結串列更有效率（省去 `next` 指標空間與動態記憶體配置開銷）。
- **結構差異（Algorithm 4-16）**：`stack` 結構包含 `stackAry`（指向陣列之指標）、`count`、`stackMax`（最大元素數），且 `top` 改為**陣列索引（`<index>`）**而非指標。

---

## 三、代表性範例、公式或實作重點

簡報將堆疊應用歸納為四大類別：

### 1. 資料反轉（Reversing Data）
- **數字串列反轉（`reverseNumber`，Alg 4-9）**：依序 Push 輸入整數至 `<EOF>` 或堆疊滿，再逐一 Pop 印出即可得反序結果。
- **十進位轉二進位（`decimalToBinary`，Alg 4-10）**：不斷取 `number % 2` 並 Push 進堆疊、`number = number / 2`，最後全部 Pop 印出，解決餘數由低位到高位產生導致順序顛倒的問題。

### 2. 語法解析（Parsing Data）
- **括號配對檢查（`parseParens`，Alg 4-11）**：讀入字元，遇到左括號 `(` 就 Push；遇到右括號 `)` 時若堆疊為空代表「右括號多餘（Closing parenthesis not matched）」，否則 Pop 配對；全部讀完後若堆疊非空代表「左括號未閉合（Opening parenthesis not matched）」。

### 3. 延遲資料使用（Postponing Data Usage）
- **中序轉後序（`inToPostFix`，Alg 4-12）**：運算式分為前序（Prefix：`+ a b`）、中序（Infix：`a + b`）與後序（Postfix：`a b +`）。後序與前序皆**不需括號**且只有唯一求值規則。
  - 運算子優先權：Priority 2（`*`, `/`）> Priority 1（`+`, `-`）> Priority 0（`(`）。
  - 演算法規則：遇運算元直接輸出；遇 `(` 推入；遇 `)` 彈出輸出直到 `(`；遇運算子時若 `priority(token) <= priority(topToken)` 則持續彈出輸出，再將 `token` 推入；輸入結束後清空堆疊。
  - 追蹤範例（Table 4-1）：`A * B - ( C + D ) + E` → `A B * C D + - E +`。
- **後序式求值（`postFixEvaluate`，Alg 4-13）**：將**運算元數值**推入堆疊；遇到運算子時依序彈出 `operand2` 與 `operand1`，計算 `operand1 operator operand2` 後推回堆疊（如 `2 4 6 + *` → `2 * (4 + 6) = 20`）。

### 4. 回溯法（Backtracking Steps）
- **目標搜尋（`seekGoal`，Alg 4-14）**：走訪圖形時將經過節點與所有分支點（Branch Points）推入堆疊，當遇到死路時即可 Pop 退回上一個決策點繼續嘗試。
- **八皇后問題（`queens8`，Alg 4-15）**：逐列（Row）嘗試放置皇后並將座標 `[row, col]` 推入堆疊；若該列所有欄位皆受威脅（`col >= boardSize`），則從堆疊 Pop 出上一列皇后的位置，嘗試其下一欄（如 Figure 4-17 之 $4 \times 4$ 棋盤逐步解）。

---

## 四、常見考點／應用場景與限制

- **手算中序轉後序技巧**：先依優先權補齊所有括號 → 將每個運算子移至其對應右括號的右側 → 移除所有括號。
- **後序求值彈出順序**：第一個彈出的是右運算元 `operand2`，第二個彈出的是左運算元 `operand1`，對於減法 `-` 與除法 `/` 順序至關重要。
- **溢位／下溢防呆**：動態鏈結串列實作仍需透過 `fullStack` 檢查動態記憶體是否耗盡；陣列實作則需對照 `stackMax` 判斷 Overflow。

---

## 五、關聯頁面
- **同軌來源出處**：[[sources/ppt/DS_Ch4-Stacks]]
- **同軌相關概念**：[[concepts/ppt/Linear-and-Singly-Linked-Lists]]、[[concepts/ppt/Complex-Linked-Lists]]

---
title: 線性串列與單向鏈結串列演算法
type: concept
source_type: ppt
tags:
  - course-notes
  - ppt
  - data-structures
  - linked-list
  - algorithms
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/ppt/DS_Ch3-Linked-Lists]]"
status: growing
---

# 線性串列與單向鏈結串列演算法

> 本頁僅累積來自 **`ppt` 軌道（`raw/ppt/`）** 之知識內容；若需對照另一軌道的說法，請見文末「對應他軌參考」或 `wiki/comparisons/`。

## 一、定義與核心直覺

根據 [[sources/ppt/DS_Ch3-Linked-Lists|資料結構 Ch.3 課程簡報]]，**線性串列（Linear List）** 是最基礎的循序資料集合，分為兩大類：
- **一般串列（General List）**：可在任意位置插入與刪除資料，無操作位置限制，細分為：
  - **無序／隨機串列（Unordered / Random List）**：資料無特定排序。
  - **有序串列（Ordered List）**：資料依 **鍵值（Key）** 排列；Key 是結構中用來識別或控制資料使用的一個或多個欄位。
- **受限串列（Restricted List）**：僅能在結構兩端新增或刪除資料，包含 **FIFO（Queue，佇列）** 與 **LIFO（Stack，堆疊）**（詳見 [[concepts/ppt/Stacks-and-Applications]]）。

### 陣列 vs. 鏈結串列
| 比較維度 | 陣列（Array） | 單向鏈結串列（Singly Linked List） |
| :--- | :--- | :--- |
| **記憶體配置** | 實體連續記憶體 | 節點無實體連續關係，透過指標串聯 |
| **插入與刪除** | 效率差（須搬移後續元素） | **效率高**（僅需更改指標，無須搬移資料） |
| **搜尋與存取** | 支援隨機存取與二元搜尋（Binary Search） | **無法使用二元搜尋**，僅能循序搜尋（Sequential Search） |

---

## 二、運作機制與詳細說明

### 節點與標頭結構（Self-Referential Structures）
- **資料節點（Data Node）**：屬於**自我參照結構**，包含 `data`（含 `key` 與其他欄位）與 `link`（指向同型別下一個節點的指標，最後一個節點為 `null`）。
- **標頭結構（Head Node Structure）**：儲存整條串列的詮釋資料（Metadata），包含 `count`（節點數）、`head`（指向第一個邏輯節點的 `pHead`）、走訪用的 `pos`（目前位置指標），以及選配的 `rear` / `pLast`（指向最後一個節點以提升搜尋與附加效率）。

### 插入與刪除的簡化邏輯
- **插入節點（`insertNode`，Algorithm 3-2）**：
  1. 配置記憶體 `allocate(pNew)`，若記憶體耗盡（Overflow）則回傳 `false`；設定 `pNew->data = dataIn`。
  2. 將四種插入情境（空串列、最前、中間、最後）簡化為兩類：
     - `pPre == null`（空串列或插在第一節點前）：`pNew->link = list.head; list.head = pNew;`（**順序不可顛倒**，必須先接上後繼者再改 `head`）。
     - `pPre != null`（插在中間或最後）：`pNew->link = pPre->link; pPre->link = pNew;`。
  3. 最後執行 `list.count = list.count + 1`。
- **刪除節點（`deleteNode`，Algorithm 3-3）**：
  1. 取出資料 `dataOut = pLoc->data`。
  2. 四種刪除情境（唯一節點、第一節點、中間、最後）簡化為兩類：
     - `pPre == null`（刪除第一或唯一節點）：`list.head = pLoc->link;`。
     - `pPre != null`（刪除中間或最後節點）：`pPre->link = pLoc->link;`。
  3. 統一執行 `list.count = list.count - 1` 與 `recycle(pLoc)` 釋放動態記憶體。

---

## 三、代表性範例、公式或實作重點

### 有序串列搜尋（`searchList`，Algorithm 3-4）
從 `pPre = null`、`pLoc = list.head` 出發，當 `pLoc != null && target > pLoc->data.key` 時同步後移 `pPre = pLoc; pLoc = pLoc->link;`。Table 3-1 整理五種回傳狀態：

| 條件 | `pPre` | `pLoc` | 回傳值 |
| :--- | :--- | :--- | :--- |
| `target < first node` | `null` | `first node` | `false` |
| `target == first node` | `null` | `first node` | `true` |
| `first < target < last` | 小於 target 的最大節點 | 大於 target 的最小節點 | `false` |
| `target == middle / last` | 目標節點的前驅者 | 目標節點 | `true` |
| `target > last node` | `last node` | `null` | `false` |

### 走訪與銷毀（`getNext` & `destroyList`）
- **走訪（`getNext`，Algorithm 3-9）**：利用 `list.pos` 記錄目前位置；`fromWhere == 0` 時從 `list.head` 開始（須防範空串列 `list.count == 0`），否則移動至 `list.pos->link`（須檢查是否已達結尾 `list.pos->link == null`）。
- **銷毀（`destroyList`，Algorithm 3-10）**：當串列不再使用時，迴圈逐一將 `list.head` 移往下一節點並 `recycle(dltPtr)`，直到 `list.count == 0` 且重設 `list.pos = null`。

### 串列應用：串接與二維陣列表示
- **串接兩條串列（`append`，Algorithm 3-18）**：若 `list1.count == 0` 則 `list1.head = list2.head`；否則走訪至 `list1` 最後一個節點（`pLoc->link == null`），令 `pLoc->link = list2.head`，並更新 `list1.count += list2.count`。
- **Array of Lists（Algorithm 3-19–3-21）**：以一維陣列儲存多個串列的 Metadata `(count, pos, head)`，每個陣列元素對應二維表格的一列（Row），而該串列的節點則代表各欄（Column）。

---

## 四、常見考點／應用場景與限制

- **四大操作與限制**：Insertion、Deletion、Retrieval 適用於所有線性串列，但 **List Traversal 不適用於受限串列**（Queue/Stack 只能存取端點，且部分情境下 Retrieval 會移除資料）。
- **測試計畫（Testing Insert & Delete Logic）**：驗證插入與刪除邏輯時，課堂強調必須分別測試 4 種邊界案例：空串列（null list）、第一筆資料前／第一筆資料、兩筆資料之間、以及最後一筆資料之後／最後一筆資料。
- **非鍵值搜尋（Unordered List Search）**：若依非鍵值欄位搜尋，可能有多筆資料符合條件，解法是回傳所有符合條件元素的串列。
- **資料隱藏（Data Hiding）**：`emptyList`、`fullList`（嘗試 `allocate` 測試是否溢位後立即 `recycle`）與 `listCount` 雖邏輯簡單，仍應封裝為獨立介面，避免呼叫端直接相依於內部結構。

---

## 五、關聯頁面
- **同軌來源出處**：[[sources/ppt/DS_Ch3-Linked-Lists]]
- **同軌相關概念**：[[concepts/ppt/Complex-Linked-Lists]]、[[concepts/ppt/Stacks-and-Applications]]

---
title: 資料結構 Ch.3 Linked Lists 課程簡報摘要
type: source
source_type: ppt
tags:
  - course-notes
  - ppt
  - data-structures
  - linked-list
  - source
created: 2026-11-16
updated: 2026-11-16
authors: "Kuen-Liang Sue (IM/NCU)"
published: 2026-11-16
raw_file: "raw/ppt/DS_Ch3.pdf"
source_url: ""
status: growing
---

# 資料結構 Ch.3 Linked Lists 課程簡報摘要

- **來源軌道**：`PPT（課程簡報）`
- **原始檔案**：`raw/ppt/DS_Ch3.pdf`（共 58 頁、115 張投影片）
- **授課教師／作者**：Kuen-Liang Sue（國立中央大學資訊管理學系 IM/NCU）

## 一、一句話核心結論

本簡報系統性介紹線性串列（Linear List）與鏈結串列（Linked List）的資料結構設計，透過自我參照結構（Self-referential Structure）與指標操作解決陣列插入／刪除需搬移資料的瓶頸，並完整推導單向、環狀、雙向與多重鏈結串列的十大基礎演算法與應用。

## 二、涵蓋範圍與核心問題

1. **3-1 Linear List Concepts**：General（Unordered/Random vs. Ordered）與 Restricted（FIFO Queue vs. LIFO Stack）線性串列分類，以及 Insertion、Deletion、Retrieval、Traversal 四大操作。
2. **3-2 Linked List Concepts**：節點（Node）的自我參照結構、`pHead` 與 Head Node Metadata（`count`、`head`、`pos`、`rear`/`pLast`）。
3. **3-3 Linked List Algorithms**：十大核心演算法（`createList`、`insertNode`、`deleteNode`、`searchList`、`retrieveNode`、`emptyList`、`fullList`、`listCount`、`getNext`、`destroyList`）。
4. **3-4 Processing a Linked List**：整合選單系統 `buildLinkedList` 與高階模組（`addNode`、`removeNode`、`printList`）及邊界測試規劃。
5. **3-5 List Applications**：串列串接（Append Lists）與鏈結串列陣列（Array of Lists，表示二維結構）。
6. **3-6 Complex Linked List Structures**：環狀鏈結串列（Circularly Linked List）、雙向鏈結串列（Doubly Linked List）與多重鏈結串列（Multilinked List）。

## 三、重點整理與技術／理論細節

- **陣列 vs. 鏈結串列權衡**：陣列易於建立且支援二元搜尋（Binary Search），但插入與刪除需搬移後續元素；鏈結串列不要求實體連續記憶體，插入／刪除僅需修改指標（$O(1)$ 指標重接），但**無法使用二元搜尋**，僅能使用循序搜尋（Sequential Search）。
- **插入與刪除的簡化歸納（課堂核心考點）**：
  - **插入（`insertNode`）**：四種情境（空串列、最前、中間、最後）可歸納為兩大類：`pPre == null`（空串列或最前）與 `pPre != null`（中間或最後）。指標賦值順序**不可顛倒**：必須先讓 `pNew->link` 指向後繼者，再更新前驅者（或 `list.head`）指向 `pNew`。
  - **刪除（`deleteNode`）**：四種情境（唯一節點、第一節點、中間、最後）亦可歸納為兩大類：`pPre == null`（更新 `list.head = pLoc->link`）與 `pPre != null`（更新 `pPre->link = pLoc->link`），最後統一執行 `list.count - 1` 與 `recycle(pLoc)`。
- **有序搜尋回傳雙指標（`searchList`）**：同時回傳 `pPre`（前驅節點）與 `pLoc`（目標或第一個大於目標之節點），使 `addNode` 與 `removeNode` 可直接複用搜尋結果進行插入或刪除。若 Head 維護 `rear` 指標，可加速判斷 `target > last node`。
- **雙向鏈結串列課堂勘誤（Slide 102–103）**：簡報特別標註 Algorithm 3-22（`insertDbl`）修正：第 4.9 行 `pPre->fore = pNew` 應移至 4.4.3 行，且第 4.6 行判斷條件應改為 `if (pSucc null)`。

## 四、關鍵圖表、公式或範例紀錄

- **Table 3-1（有序串列搜尋結果對照）**：依 `target` 與節點鍵值關係（`< first`、`== first`、`first < target < last`、`== middle/last`、`> last`）對應不同的 `(pPre, pLoc, Return)` 組合。
- **Figure 3-18（系統模組架構圖）**：呈現 3 個高階模組（`createList`、`LinkedList`、`destroyList`）與 10 個底層演算法的呼叫階層。
- **Table 3-2 & Figure 3-25（美國前十任總統多重鏈結串列）**：單一實體節點同時維護 `President link` 與 `Spouse link`，在不複製資料的前提下支援多鍵值順序走訪。

## 五、限制、假設或未解疑問

- 簡報採用虛擬碼（Pseudocode）與 C 語言指標語法（`->`）描述動態記憶體配置（`allocate` / `recycle`），實作時需對應語言的記憶體管理機制（如 C 的 `malloc`/`free`）。
- 投影片未列出各演算法的形式化時間複雜度大 $O$ 推導表，僅以操作邏輯與指標效率說明（如維護 `rear` 指標可提升效能）。

## 六、與同軌知識庫的關聯
- **同軌概念頁**：
  - [[concepts/ppt/Linear-and-Singly-Linked-Lists|線性串列與單向鏈結串列演算法]]
  - [[concepts/ppt/Complex-Linked-Lists|進階鏈結串列結構（環狀、雙向、多重鏈結）]]
- **同軌相關章節**：[[sources/ppt/DS_Ch4-Stacks|資料結構 Ch.4 Stacks 課程簡報摘要]]

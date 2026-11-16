---
title: 進階鏈結串列結構（環狀、雙向、多重鏈結）
type: concept
source_type: ppt
tags:
  - course-notes
  - ppt
  - data-structures
  - linked-list
  - doubly-linked-list
created: 2026-11-16
updated: 2026-11-16
sources:
  - "[[sources/ppt/DS_Ch3-Linked-Lists]]"
status: growing
---

# 進階鏈結串列結構（環狀、雙向、多重鏈結）

> 本頁僅累積來自 **`ppt` 軌道（`raw/ppt/`）** 之知識內容；若需對照另一軌道的說法，請見文末「對應他軌參考」或 `wiki/comparisons/`。

## 一、定義與核心直覺

根據 [[sources/ppt/DS_Ch3-Linked-Lists|資料結構 Ch.3 課程簡報（Section 3-6）]]，為克服單向鏈結串列只能單向走訪與單一排序的限制，衍生出三種進階鏈結串列結構：
1. **環狀鏈結串列（Circularly Linked List）**：最後一個節點的 `link` 指標指回第一個節點，形成封閉迴圈。
2. **雙向鏈結串列（Doubly Linked List）**：每個節點同時擁有指向前驅者的 `back`（Backward）指標與指向後繼者的 `fore`（Forward）指標。
3. **多重鏈結串列（Multilinked List）**：同一份實體資料節點擁有多組獨立的鏈結欄位，可在不複製資料的情況下依多種邏輯鍵值順序處理同一批資料。

---

## 二、運作機制與詳細說明

### 1. 環狀鏈結串列（Circularly Linked List）
- **標頭與尾指標**：Header 通常維護 `count`、`pos`、`rear` 與 `head/link`。當**插入或刪除最後一個節點**時，必須同步更新兩件事：(1) Header 的 `rear` 指標；(2) 最後一個節點的 `link` 指回第一節點。
- **從中間開始搜尋的風險與解法**：由於環狀結構在機率上從開頭或中間搜尋無差異，但若目標不存在，指標會陷入無窮迴圈。解法是**記錄起始節點位址 `startAddress`**，將迴圈終止條件設為：`target != pLoc->data.key AND pLoc->link != startAddress`。

### 2. 雙向鏈結串列（Doubly Linked List）
- **雙向指標與 Metadata**：標頭結構包含 `count`、`head` 與 `rear`（`rear` 非絕對必要，但能讓許多演算法更有效率）。若將最後節點的 `fore` 指回第一節點、且第一節點的 `back` 指向最後節點，則構成 **Doubly Linked Circularly Linked List**。
- **插入邏輯（`insertDbl`，Algorithm 3-22）**：
  - 回傳值定義：`0`（動態記憶體溢位）、`1`（成功）、`2`（鍵值重複）。
  - 插入空串列或第一節點前（`pPre == null`）：設定 `pNew->back = null`、`pNew->fore = list.head`、`list.head = pNew`。
  - 插入中間或結尾（`pPre != null`）：設定 `pNew->fore = pPre->fore`、`pNew->back = pPre`、`pPre->fore = pNew`。
  - 若插在結尾（`pSucc == null`）則更新 `list.rear = pNew`；否則更新後繼者 `pSucc->back = pNew`。
- **刪除邏輯（`deleteDbl`，Algorithm 3-23）**：
  - 若 `pDlt == null` 直接中止（Abort）；遞減 `list.count`。
  - 處理前驅者：若 `pDlt->back != null`，令 `pPred->fore = pDlt->fore`；否則刪除的是第一節點，更新 `list.head = pDlt->fore`。
  - 處理後繼者：若 `pDlt->fore != null`，令 `pSucc->back = pDlt->back`；否則刪除的是最後節點，更新 `list.rear = pDlt->back`。
  - 最後 `recycle(pDlt)` 回收記憶體。

### 3. 多重鏈結串列（Multilinked List）
- **結構設計**：每筆邏輯序列各自建立一組指標（可為單向、雙向或環狀），共用同一份資料節點記憶體。
- **插入步驟（`buildMultilinked`）**：將記憶體配置與指標串接分離——先由 `buildNode` 配置一次實體節點並將 `count` 加一，再分別透過各自的搜尋與插入模組（如 `insertPres` 與 `insertSpouse`）接上不同序列的指標。

---

## 三、代表性範例、公式或實作重點

### 簡報課堂勘誤：Algorithm 3-22 (`insertDbl`) 修正
簡報第 102–103 頁明確指出課本虛擬碼有兩處必須修正之錯誤：
1. 原第 4.9 行 `pPre->fore = pNew` 應上移至 **4.4.3 行**（即 `else` 區塊中接好 `pNew->fore` 與 `pNew->back` 之後立刻執行）。
2. 原第 4.6 行判斷條件 `if (pPre->fore null)` 應修正為 **`if (pSucc null)`**，才能正確判斷是否插入於串列尾端並更新 `list.rear`。

### 多重鏈結串列範例：美國總統資料表（Table 3-2 / Figure 3-25）
在同一組總統資料節點（如 `Washington, 1789, Custis`、`Adams, J, 1797, Smith`、`Jefferson, 1801, Skelton`）中，同時維護 **President link** 與 **Spouse link**（以及對應的 `pres rear`、`sp rear`），即可在不重複儲存資料的情況下，依總統姓名或配偶姓名兩種順序走訪。

---

## 四、常見考點／應用場景與限制

- **指標更新順序（雙向鏈結）**：在中間插入新節點時，務必先用 `pNew->back` 與 `pNew->fore` 記住前後節點，或保留 `pSucc` 指標，再改寫 `pPre->fore` 與 `pSucc->back`，避免指標斷鏈。
- **空間換取時間與彈性**：雙向鏈結串列每個節點多一個指標空間，但刪除已知指標 `pDlt` 時不需從頭搜尋前驅者；多重鏈結串列則以多組指標空間換取「免資料複製的多維排序」。

---

## 五、關聯頁面
- **同軌來源出處**：[[sources/ppt/DS_Ch3-Linked-Lists]]
- **同軌相關概念**：[[concepts/ppt/Linear-and-Singly-Linked-Lists]]、[[concepts/ppt/Stacks-and-Applications]]

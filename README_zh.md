# v0-mcp

[English](README.md) | [中文](README_zh.md)

Vercel v0 MCP 服務器 for Claude Code - 通過模型上下文協議 (MCP) 使用 AI 生成精美的 UI 組件。

> ✨ **協作開發**: 此專案透過 Claude Code 和 Gemini CLI 使用 Vibe Coding 方法論的創新協作完成 - 展示了 AI 輔助開發流程的強大力量。

## 🎯 功能特點

- **生成 UI 組件**: 從自然語言描述創建 React 組件
- **圖像轉 UI**: 將設計圖轉換為可用的 React 代碼
- **對話式迭代**: 通過對話逐步完善組件
- **多模型支持**: 支持 v0-1.5-md、v0-1.5-lg 和 v0-1.0-md
- **TypeScript 支持**: 使用 Zod 模式驗證的完整類型安全
- **流式支持**: 實時生成進度顯示

## 🚀 快速開始

```bash
# 1. 克隆項目並進入目錄
git clone <repository-url> && cd v0-mcp

# 2. 安裝依賴
npm install

# 3. 創建 .env 文件並添加你的 v0 API 密鑰
npm run setup
# 編輯 .env 文件並填入你的 V0_API_KEY

# 4. 構建專案
npm run build

# 5. 添加到 Claude Code（確保你在專案根目錄中）
claude mcp add v0-mcp --env V0_API_KEY=$(grep V0_API_KEY .env | cut -d '=' -f2) -- node $(pwd)/dist/main.js

# 6. 開始在 Claude Code 中使用！
# 試試：「嘿 v0-mcp，創建一個帶有電子郵件和密碼字段的登錄表單」
```

## 🛠 安裝

### 1. 克隆或下載
```bash
git clone <repository-url>
cd v0-mcp
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 設置環境
```bash
npm run setup
# 編輯 .env 文件，填入你的 v0 API 密鑰
```

### 4. 構建專案
```bash
npm run build
```

## ⚙️ 配置

### 🔑 獲取你的 v0 API 密鑰

在配置 v0-mcp 之前，你需要一個 v0 API 密鑰：

1. **訪問 [v0 Model API 文檔](https://vercel.com/docs/v0/model-api)**
2. **登錄你的 Vercel 帳戶**
3. **導航到 API Keys 部分**
4. **生成新的 API 密鑰**
5. **複製並安全保存你的密鑰**

### Claude Code 集成

📖 **快速設置指南 - 選擇最適合你的方法**

#### 方法 1: CLI 配置（推薦）

1. **使用 Claude Code CLI 添加 v0-mcp：**
   ```bash
   # 首先導航到你的 v0-mcp 目錄
   cd /path/to/your/v0-mcp
   
   # 使用當前目錄添加 MCP 服務器
   claude mcp add v0-mcp -- node $(pwd)/dist/main.js
   ```

2. **設置你的 v0 API 密鑰：**

   **選項 A: 在 CLI 設置時添加密鑰**
   ```bash
   # 添加服務器時包含 API 密鑰（在 v0-mcp 目錄中運行）
   claude mcp add v0-mcp --env V0_API_KEY=your_v0_api_key_here -- node $(pwd)/dist/main.js
   ```

   **選項 B: 設置後編輯 `.claude.json` 文件**
   
   運行 `claude mcp add` 命令後，編輯生成的 `.claude.json` 文件：
   ```json
   {
     "mcpServers": {
       "v0-mcp": {
         "type": "stdio",
         "command": "node",
         "args": ["/absolute/path/to/your/v0-mcp/dist/main.js"],
         "env": {
           "V0_API_KEY": "your_v0_api_key_here"
         }
       }
     }
   }
   ```
   
   **選項 C: 系統環境變量（最安全）**
   ```bash
   # 添加到你的 shell 配置文件（.bashrc、.zshrc 等）
   echo 'export V0_API_KEY="your_v0_api_key_here"' >> ~/.zshrc
   
   # 重新加載 shell 配置
   source ~/.zshrc
   ```

3. **驗證設置：**
   ```bash
   claude mcp list
   node scripts/verify-claude-code-setup.js
   ```
   
   ✅ **預期輸出：**
   ```
   正在驗證 v0 API 連接...
   ✓ 在 Claude 配置中找到 v0-mcp 服務器
   ✓ API 密鑰已配置
   ✓ 成功連接到 v0 API
   設置完成！你現在可以在 Claude Code 中使用 v0-mcp。
   ```

#### 方法 2: 手動配置（進階）

1. **創建或編輯 Claude Code 配置文件：**
   - **macOS/Linux**: `~/.claude.json`
   - **Windows**: `%USERPROFILE%\.claude.json`

2. **添加 v0-mcp 服務器配置：**

```json
{
  "mcpServers": {
    "v0-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/v0-mcp/dist/main.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

3. **重啟 Claude Code** 使更改生效。

#### 驗證

配置後，你應該在 Claude Code 中看到可用的 v0-mcp 工具：

- ✅ `v0_generate_ui` - 從文本生成 UI 組件
- ✅ `v0_generate_from_image` - 從圖像參考生成 UI  
- ✅ `v0_chat_complete` - 迭代式 UI 開發聊天
- ✅ `v0_setup_check` - 驗證 API 連接

### 🔗 為什麼使用 MCP（模型上下文協議）？

**MCP 優勢：**
- **無縫集成**: 工具在 Claude 中原生顯示，無需 API 調用複雜性
- **增強上下文**: Claude 理解你的 v0 工作流程並提供更好的協助
- **即時可用**: 工具在你的編碼會話中始終可訪問
- **類型安全**: 內建完整的參數驗證和錯誤處理
- **持久狀態**: 在工具調用過程中維護對話上下文

**工作原理：**
當你在 Claude 中提及 v0-mcp 或 UI 生成時，工具會自動變為可用。Claude 可以根據你的請求智能選擇正確的工具，使開發過程感覺自然且集成。

### Claude Desktop 集成

添加到你的 `claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "v0-mcp": {
      "command": "node",
      "args": ["/path/to/v0-mcp/dist/main.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

### Cursor 集成

添加到你的 Cursor MCP 配置：

```json
{
  "mcpServers": {
    "v0-mcp": {
      "command": "node",
      "args": ["/path/to/v0-mcp/dist/main.js"],
      "env": {
        "V0_API_KEY": "your_v0_api_key_here"
      }
    }
  }
}
```

## 🔧 可用工具

### `v0_generate_ui`
從文本描述生成 UI 組件。

**參數：**
- `prompt`（必需）：UI 組件的描述
- `model`：要使用的 v0 模型（默認：v0-1.5-md）
- `stream`：啟用流式響應（默認：false）
- `context`：可選的現有代碼上下文

### `v0_generate_from_image`
從圖像參考生成 UI 組件。

**參數：**
- `imageUrl`（必需）：參考圖像的 URL
- `prompt`：額外的指令
- `model`：要使用的 v0 模型（默認：v0-1.5-md）

### `v0_chat_complete`
基於對話上下文的聊天式 UI 開發。

**參數：**
- `messages`（必需）：對話消息數組
- `model`：要使用的 v0 模型（默認：v0-1.5-md）
- `stream`：啟用流式響應（默認：false）

### `v0_setup_check`
驗證 v0 API 配置和連接。

## 🔑 環境變量

| 變量 | 必需 | 默認值 | 描述 |
|----------|----------|---------|-------------|
| `V0_API_KEY` | ✅ | - | 你的 v0 API 密鑰 |
| `V0_BASE_URL` | ❌ | `https://api.v0.dev/v1` | v0 API 基礎 URL |
| `V0_DEFAULT_MODEL` | ❌ | `v0-1.5-md` | 默認使用的模型 |
| `V0_TIMEOUT` | ❌ | `60000` | API 超時時間（毫秒） |
| `MCP_SERVER_NAME` | ❌ | `v0-mcp` | MCP 服務器名稱 |
| `LOG_LEVEL` | ❌ | `info` | 日誌級別 |

## 🚀 使用示例

### 在 Claude Code 中

配置完成後，你可以通過多種方式使用 v0-mcp：

#### 直接使用 v0-mcp
只需在請求中提及 v0-mcp，Claude 會自動選擇合適的工具：
```
嘿 v0-mcp，創建一個現代的登錄表單，包含電子郵件和密碼字段
```

```
v0-mcp：生成一個帶有圖表和 KPI 卡片的儀表板組件
```

```
@v0-mcp 將這個線框圖轉換為 React 組件：[圖片 URL]
```

#### 使用特定工具

##### 生成登錄表單
```
使用 v0_generate_ui 創建一個現代的登錄表單，包含電子郵件、密碼字段和帶圓角的藍色提交按鈕。
```

##### 將設計轉換為代碼
```
使用 v0_generate_from_image 處理這個 Figma 設計 URL：https://example.com/design.png
```

##### 迭代開發
```
使用 v0_chat_complete 改進之前的登錄表單，添加"記住我"複選框和"忘記密碼"鏈接。
```

##### 檢查 API 設置
```
使用 v0_setup_check 驗證你的 v0 API 連接和配置。
```

### 進階使用示例

#### 創建儀表板組件
```
使用 v0_generate_ui 並使用以下提示：
"創建一個現代的儀表板組件，包含側邊欄導航、帶用戶配置文件下拉菜單的標題，以及用於卡片網格佈局的主內容區域。包含顯示 KPI 圖表的指標卡片。使用 shadcn/ui 組件和 Tailwind CSS。"
```

#### 從線框圖構建
```
使用 v0_generate_from_image 處理你的線框圖 URL 並添加：
"將此線框圖轉換為功能完整的 React 組件。添加適當的間距、現代樣式，並使其對移動設備響應。"
```

#### 迭代改進
```
使用 v0_chat_complete 並提供對話歷史：
[
  {"role": "user", "content": "創建一個定價表組件"},
  {"role": "assistant", "content": "[之前的定價表代碼]"},
  {"role": "user", "content": "添加熱門計劃高亮和年度/月度切換"}
]
```

## 🧪 開發

```bash
# 帶熱重載的開發模式
npm run dev

# 類型檢查
npm run lint

# 運行測試
npm test

# 帶覆蓋率的測試
npm run test:coverage

# CI 模式測試
npm run test:ci

# 清理構建產物
npm run clean

# 測試配置
npm run test:config

# 測試基本功能
npm run test:basic

# 驗證 Claude Code 設置
npm run verify:claude-code
```

## 🛡️ 增強功能

### 結構化日誌
- **基於 Winston 的日誌記錄**，使用 JSON 格式
- API 調用和工具使用的**上下文信息**
- 帶堆棧跟踪和元數據的**錯誤跟踪**
- 通過 `LOG_LEVEL` 環境變量**可配置的日誌級別**

### 高級錯誤處理
- **分類錯誤類型**（API、網絡、超時、速率限制等）
- 針對暫時性錯誤的**指數退避重試邏輯**
- 帶有可操作指導的**用戶友好錯誤消息**
- 用於調試的**全面錯誤元數據**

### 測試基礎設施
- **Jest 測試框架**，支持 TypeScript
- 所有核心組件的**全面單元測試**
- 帶可配置閾值的**測試覆蓋率報告**
- 外部依賴的**模擬實現**

### 提高可靠性
- 使用 Zod 模式的**輸入驗證**
- 所有故障模式的**優雅錯誤處理**
- 帶請求計時的**性能監控**
- API 連接的**健康檢查**

## 💖 支持此專案

如果你覺得這個專案有幫助，請考慮支持它：

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee)](https://coff.ee/hellolucky)

你的支持有助於維護和改進 v0-mcp！

## 📄 許可證

MIT
# 社交工程測試追蹤系統

這是一個用於公司內部安全意識訓練的社交工程測試工具。透過 LINE LIFF 追蹤點擊者身份，並顯示安全警告訊息。

## 功能特色

- ✅ 使用 LIFF 獲取 LINE 用戶資訊
- ✅ 即時追蹤點擊記錄
- ✅ **MongoDB 資料庫永久保存資料**（不會因重新部署而遺失）
- ✅ 精美的警告頁面
- ✅ 管理後台查看統計
- ✅ 批量刪除點擊記錄
- ✅ 匯出 CSV 報告
- ✅ 響應式設計

## 部署步驟

### 1. 創建 LINE Developers 帳號和 LIFF 應用

1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 登入你的 LINE 帳號
3. 建立新的 Provider（如果還沒有）
4. 建立新的 Channel（選擇 LINE Login）
5. 在 Channel 設定中，找到「LIFF」分頁
6. 點擊「Add」建立新的 LIFF app：
   - **LIFF app name**: 社交工程測試
   - **Size**: Full
   - **Endpoint URL**: `https://你的網域/index.html`（先填入暫時的，部署後再改）
   - **Scope**: 勾選 `profile`
   - **Bot link feature**: 選擇 `Off`
7. 建立後會得到一個 **LIFF ID**（格式：1234567890-abcdefgh）

### 2. 部署到免費平台（推薦使用 Render 或 Railway）

#### 選項 A: 使用 Render.com（免費）

1. 註冊 [Render.com](https://render.com/) 帳號
2. 點擊「New +」→「Web Service」
3. 連接你的 GitHub repository 或直接上傳程式碼
4. 設定：
   - **Name**: social-engineering-tracker
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. 點擊「Create Web Service」
6. 部署完成後，你會得到一個網址，例如：`https://social-engineering-tracker.onrender.com`

#### 選項 B: 使用 Railway.app（免費）

1. 註冊 [Railway.app](https://railway.app/) 帳號
2. 點擊「New Project」→「Deploy from GitHub repo」
3. 選擇你的 repository
4. Railway 會自動偵測 Node.js 專案並部署
5. 部署完成後，點擊「Settings」→「Generate Domain」
6. 你會得到一個網址，例如：`https://xxx.up.railway.app`

#### 選項 C: 使用 Vercel（需要稍微調整設定）

1. 安裝 Vercel CLI：`npm install -g vercel`
2. 在專案目錄執行：`vercel`
3. 按照指示完成部署

### 3. 設定 MongoDB Atlas 資料庫（重要！）

**為什麼需要資料庫？**
- 使用檔案系統儲存資料，每次重新部署都會清空
- MongoDB Atlas 免費方案可永久保存資料

**詳細設定步驟請參閱：[MONGODB_SETUP.md](./MONGODB_SETUP.md)**

快速步驟：
1. 註冊 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)（免費）
2. 建立免費 M0 集群
3. 建立資料庫使用者和密碼
4. 設定網路存取（Allow Access from Anywhere）
5. 取得連線字串
6. 在 Render 的 Environment 設定環境變數 `MONGODB_URI`

### 4. 更新 LIFF 設定

1. 回到 LINE Developers Console
2. 找到你剛才建立的 LIFF app
3. 點擊「Edit」
4. 將 **Endpoint URL** 更新為你的部署網址，例如：
   - `https://social-engineering-tracker.onrender.com/index.html`
5. 儲存變更

### 5. 更新程式碼中的 LIFF ID

1. 開啟 `public/index.html`
2. 找到第 107 行：
   ```javascript
   const LIFF_ID = 'YOUR_LIFF_ID_HERE';
   ```
3. 將 `YOUR_LIFF_ID_HERE` 替換成你的 LIFF ID
4. 重新部署（如果使用 Git 部署，commit 並 push 即可自動部署）

### 6. 開始測試

1. 開啟你的 LIFF URL，例如：
   - `https://liff.line.me/你的LIFF_ID`
2. 或者在 LINE Developers Console 的 LIFF 頁面點擊「Open」測試
3. 管理後台網址：`https://你的網域/admin.html`

## 在公司 LINE 群組使用

1. 取得 LIFF 網址：`https://liff.line.me/你的LIFF_ID`
2. 在公司 LINE 群組中分享此連結
3. 建議使用吸引人的文案，例如：
   - "📢 重要通知：請所有同仁點擊確認資料"
   - "🎁 公司福利更新，請點擊查看"
   - "⚠️ 系統升級通知，請確認"
4. 查看管理後台監控點擊情況

## 本機測試

```bash
# 安裝依賴
npm install

# 啟動服務
npm start

# 開啟瀏覽器
# LIFF 頁面: http://localhost:3000/index.html
# 管理後台: http://localhost:3000/admin.html
```

**注意**：本機測試時 LIFF 功能可能無法正常運作，建議部署後測試。

## 資料說明

- 所有點擊記錄儲存在 **MongoDB Atlas 雲端資料庫**
- **資料永久保存**，不會因重新部署或伺服器重啟而遺失
- 包含以下資訊：
  - LINE 用戶 ID
  - 顯示名稱
  - 頭像 URL
  - 點擊時間
  - User Agent
  - 建立時間（自動記錄）

### 資料庫優勢

✅ **永久保存** - 資料不會因重新部署而清空
✅ **免費使用** - MongoDB Atlas M0 方案永久免費
✅ **高可靠性** - 雲端備份，不怕資料遺失
✅ **易於管理** - 可透過 MongoDB Atlas 網頁介面查看資料

## 安全注意事項

⚠️ **重要提醒**：

1. 此工具僅供授權的安全意識訓練使用
2. 使用前請確保：
   - 已獲得公司管理層授權
   - 符合公司內部資訊安全政策
   - 遵守當地法律法規
3. 建議在測試後：
   - 向參與者說明測試目的
   - 提供安全意識教育
   - 保護收集到的資料安全

## 常見問題

### Q: LIFF 無法獲取用戶資訊？
A: 確認以下設定：
- LIFF ID 是否正確
- Endpoint URL 是否正確
- Scope 是否包含 `profile`
- 是否在 LINE 內建瀏覽器中開啟

### Q: 部署後無法記錄資料？
A: 檢查：
- API URL 設定是否正確
- 伺服器是否正常運行
- 網路請求是否有 CORS 錯誤

### Q: 如何自訂警告訊息？
A: 編輯 `public/index.html` 的內容即可

## 授權

MIT License - 僅供教育和授權的安全測試使用

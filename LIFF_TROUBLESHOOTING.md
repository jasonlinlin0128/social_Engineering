# LIFF 問題診斷指南

## 🔍 用戶顯示 "unknown" 或 "未知用戶" 的原因

如果在測試時發現用戶資訊顯示為 "unknown" 或 "未知用戶"，請按照以下步驟排查：

### 1️⃣ 檢查是否在 LINE 內建瀏覽器中開啟

**問題：** LIFF 只能在 LINE 應用程式的內建瀏覽器中正常運作

**解決方法：**
- ✅ **正確方式**：在 LINE 聊天室中點擊連結開啟
- ❌ **錯誤方式**：直接在 Chrome、Safari 等一般瀏覽器中開啟

**測試方法：**
1. 將 `https://liff.line.me/你的LIFF_ID` 連結傳送到「與自己的聊天」
2. 在 LINE 中點擊連結開啟
3. 查看 Console 日誌（需要遠端除錯）

### 2️⃣ 檢查 LIFF 設定

前往 [LINE Developers Console](https://developers.line.biz/console/) 檢查：

#### A. Endpoint URL 設定
```
❌ 錯誤: http://localhost:3000/index.html
❌ 錯誤: https://你的網域/
✅ 正確: https://你的網域/index.html
```

#### B. Scope 設定
- 必須勾選 `profile` 權限
- 如果沒勾選，使用者資訊會無法獲取

#### C. LIFF ID 確認
- 確認 `public/index.html` 第 167 行的 LIFF ID 正確
- LIFF ID 格式：`1234567890-abcdefgh`
- 不要包含 `https://liff.line.me/` 前綴

### 3️⃣ 檢查 Console 日誌

我已經在程式碼中加入詳細的 Console 日誌，請檢查：

**如何查看 Console 日誌：**

#### 在 Android 手機上：
1. 在電腦上打開 Chrome
2. 手機用 USB 連接電腦
3. 在 Chrome 輸入 `chrome://inspect`
4. 選擇你的裝置和 LINE 內建瀏覽器
5. 查看 Console 輸出

#### 在 iPhone 上：
1. 在 iPhone 上啟用「設定 > Safari > 進階 > 網頁檢閱器」
2. 在 Mac 上打開 Safari
3. 選擇「開發 > [你的 iPhone] > [LINE 內建瀏覽器]」
4. 查看 Console 輸出

**正常的 Console 輸出應該是：**
```
開始初始化 LIFF...
LIFF ID: 你的LIFF_ID
是否在 LINE 中: true
LIFF 初始化成功
登入狀態: true
正在獲取用戶資料...
用戶資料: {userId: "U1234...", displayName: "張三", pictureUrl: "..."}
正在記錄點擊...
追蹤結果: {success: true, message: "記錄成功"}
```

**如果出現錯誤：**
```
LIFF 錯誤詳情: Error: ...
錯誤訊息: LIFF ID is not valid
```

### 4️⃣ 常見錯誤訊息及解決方法

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| `LIFF ID is not valid` | LIFF ID 格式錯誤或不存在 | 檢查 LIFF ID 是否正確複製 |
| `Not in LINE client` | 不在 LINE 內建瀏覽器中 | 在 LINE 中開啟連結 |
| `Endpoint URL mismatch` | Endpoint URL 與實際網址不符 | 更新 LINE Developers Console 設定 |
| `Permission denied` | 未勾選 profile 權限 | 在 LIFF 設定中勾選 profile scope |

### 5️⃣ 重新授權 LIFF

如果之前測試時拒絕了權限授予：

1. 在 LINE 中，前往「設定 > 隱私設定 > 提供使用資料的服務」
2. 找到你的 LIFF 應用程式
3. 刪除授權
4. 重新點擊 LIFF 連結，會再次要求授權

### 6️⃣ 驗證部署狀態

**檢查後端是否正常運作：**
```bash
curl https://你的網域/api/stats
```

應該返回：
```json
{
  "success": true,
  "stats": {
    "totalClicks": 0,
    "uniqueUsers": 0,
    "lastClick": null
  }
}
```

### 7️⃣ 測試步驟建議

**Step 1: 本機測試（會顯示 unknown）**
```bash
npm install
npm start
# 開啟 http://localhost:3000/index.html
# 預期結果：會顯示 unknown（因為不在 LINE 中）
```

**Step 2: 部署後測試（應該正常）**
1. 部署到 Render 或其他平台
2. 更新 LINE Developers Console 的 Endpoint URL
3. 在 LINE 中發送 `https://liff.line.me/你的LIFF_ID`
4. 點擊連結開啟
5. 應該會看到你的名稱和頭像

### 8️⃣ 快速診斷檢查表

在報告問題前，請確認：

- [ ] LIFF ID 已正確填入 `public/index.html` 第 167 行
- [ ] Endpoint URL 已在 LINE Developers Console 更新為部署後的網址
- [ ] Scope 已勾選 `profile`
- [ ] 在 LINE 應用程式中點擊連結（不是一般瀏覽器）
- [ ] 後端 API 正常運作（訪問 `/api/stats` 有回應）
- [ ] 已部署到公開的 HTTPS 網址（不是 localhost）

### 9️⃣ 如果仍然無法解決

**收集以下資訊：**

1. Console 的完整錯誤訊息
2. 你的 LIFF ID（前 4 碼）
3. Endpoint URL
4. 使用的裝置（Android/iOS）
5. LINE 應用程式版本

**可能的解決方案：**

1. **重新建立 LIFF 應用程式**
   - 在 LINE Developers Console 建立新的 LIFF app
   - 使用新的 LIFF ID

2. **檢查 Channel 類型**
   - LIFF 必須建立在 "LINE Login" Channel 下
   - 不能建立在 "Messaging API" Channel 下

3. **等待生效**
   - LIFF 設定變更後可能需要 5-10 分鐘生效
   - 嘗試清除 LINE 快取或重新啟動 LINE

## 🎯 成功案例的完整設定

### LINE Developers Console 設定
```
Channel Type: LINE Login
LIFF app name: 社交工程測試
Size: Full
Endpoint URL: https://your-app.onrender.com/index.html
Scope: ✅ profile
Bot link feature: Off
```

### public/index.html 設定
```javascript
const LIFF_ID = '1234567890-abcdefgh';  // 你的實際 LIFF ID
const API_URL = window.location.origin;  // 不需要修改
```

### 測試方式
```
1. 部署後的網址：https://your-app.onrender.com
2. LIFF 網址：https://liff.line.me/1234567890-abcdefgh
3. 在 LINE 中傳送 LIFF 網址到「與自己的聊天」
4. 點擊連結開啟
5. 看到你的名稱和頭像 ✅
```

## 📝 補充說明

### 為什麼在瀏覽器測試會顯示 unknown？
LIFF 需要 LINE 的登入狀態和權限才能獲取用戶資訊。在一般瀏覽器中：
- 無法執行 `liff.getProfile()`
- 會進入錯誤處理流程
- 顯示 "未知用戶"

這是**正常行為**，不代表系統有問題。

### 手機和電腦都顯示 unknown？
如果在 LINE 中開啟仍顯示 unknown：
1. 99% 的情況是 LIFF 設定問題
2. 請重新檢查上述所有步驟
3. 特別注意 Endpoint URL 和 Scope 設定

### 需要注意的網址格式
```
✅ 正確: https://app.onrender.com/index.html
❌ 錯誤: https://app.onrender.com/index.html/
❌ 錯誤: https://app.onrender.com
❌ 錯誤: http://app.onrender.com/index.html (不是 https)
```

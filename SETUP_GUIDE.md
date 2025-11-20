# 快速設定指南

## 🚀 快速開始（5 分鐘內完成）

### 步驟 1: 建立 LINE LIFF 應用

1. 前往 https://developers.line.biz/console/
2. 登入 → 建立 Provider → 建立 Channel（選擇 LINE Login）
3. 進入 Channel → 點擊「LIFF」分頁 → 「Add」
4. 填寫設定：
   ```
   LIFF app name: 社交工程測試
   Size: Full
   Endpoint URL: https://暫時填寫.com/index.html (稍後會更新)
   Scope: 勾選 profile
   Bot link feature: Off
   ```
5. **記下你的 LIFF ID**（格式：1234567890-abcdefgh）

### 步驟 2: 部署到免費平台

#### 推薦：使用 Render.com（最簡單）

1. 前往 https://render.com/ 並註冊
2. 點擊「New +」→「Web Service」
3. 選擇「Build and deploy from a Git repository」
4. 連接你的 GitHub 或手動上傳
   - 如果沒有 GitHub：選擇「Public Git repository」然後上傳程式碼
5. 設定：
   ```
   Name: social-engineering-tracker
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```
6. 點擊「Create Web Service」
7. 等待部署完成（約 2-3 分鐘）
8. **複製你的網址**（例如：https://xxx.onrender.com）

### 步驟 3: 更新 LIFF 設定

1. 回到 LINE Developers Console
2. 找到你的 LIFF app → 點擊「Edit」
3. 更新 **Endpoint URL**：
   ```
   https://你的網址.onrender.com/index.html
   ```
4. 儲存

### 步驟 4: 更新程式碼

1. 開啟 `public/index.html`
2. 找到第 107 行，修改：
   ```javascript
   const LIFF_ID = '你的LIFF_ID';  // 貼上步驟1的LIFF ID
   ```
3. 重新部署（Git push 或重新上傳）

### 步驟 5: 測試

1. 開啟 LIFF 網址：
   ```
   https://liff.line.me/你的LIFF_ID
   ```
2. 在 LINE 中點擊連結測試
3. 開啟管理後台查看記錄：
   ```
   https://你的網址.onrender.com/admin.html
   ```

## 📱 在公司 LINE 群組使用

### 分享連結

將以下網址分享到 LINE 群組：
```
https://liff.line.me/你的LIFF_ID
```

### 建議的社交工程情境

**情境 1：緊急通知**
```
⚠️ 重要通知
公司系統將於今晚進行升級，請所有同仁點擊確認收到此訊息：
https://liff.line.me/你的LIFF_ID
```

**情境 2：福利資訊**
```
🎁 好消息！
人資部門公告最新員工福利方案，請點擊查看詳情：
https://liff.line.me/你的LIFF_ID
```

**情境 3：問卷調查**
```
📊 員工滿意度調查
請協助填寫 2 分鐘問卷（截止今日下午 5 點）：
https://liff.line.me/你的LIFF_ID
```

**情境 4：資安測試（直接說明）**
```
🔒 資安意識測試
這是一個社交工程測試，請點擊以下連結：
https://liff.line.me/你的LIFF_ID
測試後會立即告知您結果
```

## 🎯 使用建議

### 測試前

1. ✅ 確保已獲得公司管理層授權
2. ✅ 通知資訊安全部門
3. ✅ 準備後續教育訓練內容

### 測試中

1. 📊 即時監控管理後台
2. ⏱️ 記錄點擊時間分布
3. 📈 分析點擊率

### 測試後

1. 📧 向參與者發送測試結果說明
2. 🎓 舉辦安全意識教育訓練
3. 📝 撰寫測試報告
4. 🗑️ 記得清除敏感資料

## 🔧 進階設定

### 自訂警告訊息

編輯 `public/index.html` 第 89-93 行：

```html
<div class="message">
  這是一次社交工程測試。<br>
  你的點擊行為已被記錄。
</div>
```

### 修改安全提醒

編輯 `public/index.html` 第 96-104 行的清單內容。

### 新增更多追蹤資訊

編輯 `server.js` 第 28-35 行，可以新增更多欄位：

```javascript
const clickRecord = {
  userId: userId || 'Unknown',
  displayName: displayName || '未知用戶',
  pictureUrl: pictureUrl || '',
  timestamp: timestamp || new Date().toISOString(),
  userAgent: userAgent || '',
  clickTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
  // 新增欄位
  ipAddress: req.ip,  // IP 位址
  referer: req.headers.referer || ''  // 來源
};
```

## 📊 資料匯出

### 匯出 CSV

1. 開啟管理後台
2. 點擊「📥 匯出 CSV」按鈕
3. 檔案會自動下載

### 直接存取 JSON

資料儲存在 `clicks.json`，可直接讀取：

```bash
cat clicks.json
```

## 🐛 常見問題排除

### 問題 1：無法獲取用戶資訊

**解決方法：**
- 確認 LIFF ID 正確
- 確認在 LINE 內建瀏覽器開啟（不是一般瀏覽器）
- 檢查 Scope 是否包含 `profile`

### 問題 2：點擊無法記錄

**解決方法：**
- 檢查 `public/index.html` 的 API_URL 設定
- 確認後端服務正常運行
- 查看瀏覽器 Console 是否有錯誤

### 問題 3：部署後無法存取

**解決方法：**
- 確認防火牆設定
- 檢查部署平台的 logs
- 確認 PORT 環境變數正確

### 問題 4：LIFF 初始化失敗

**解決方法：**
```javascript
// 檢查 LIFF ID 格式是否正確
// 正確格式：1234567890-abcdefgh
// 不要包含 https://liff.line.me/ 前綴
```

## 🔒 安全提醒

- ⚠️ 此工具收集用戶資料，請妥善保管
- ⚠️ 使用完畢後請清除記錄
- ⚠️ 不要將管理後台網址公開
- ⚠️ 建議為管理後台增加密碼保護
- ⚠️ 遵守當地隱私保護法規

## 📞 技術支援

如有問題，請檢查：
1. README.md - 完整說明文件
2. LINE Developers 文件：https://developers.line.biz/en/docs/liff/
3. Render 文件：https://render.com/docs

## 🎓 延伸學習

測試完成後，建議向員工教育以下主題：
- 如何辨識釣魚連結
- 社交工程常見手法
- 資訊安全最佳實踐
- 密碼安全管理
- 多因素驗證的重要性

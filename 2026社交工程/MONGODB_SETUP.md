# MongoDB Atlas 設定指南

## 為什麼要改用資料庫？

之前使用檔案系統（`clicks.json`）儲存資料，**每次重新部署都會清空**。
改用 MongoDB Atlas 資料庫後，資料將永久保存，不會因為：
- ✅ 重新部署
- ✅ 伺服器重啟
- ✅ 程式碼更新

而遺失資料！

---

## 📋 步驟 1：註冊 MongoDB Atlas（完全免費）

1. 前往 https://www.mongodb.com/cloud/atlas/register
2. 使用 Google 帳號或 Email 註冊
3. 選擇方案：**M0 Free**（永久免費，512MB 儲存空間）
4. 選擇雲端供應商：**AWS** 或 **Google Cloud**
5. 選擇區域：選擇離台灣最近的 **Singapore (ap-southeast-1)** 或 **Tokyo (ap-northeast-1)**
6. 集群名稱：保持預設 `Cluster0` 即可
7. 點擊「Create」建立集群（需要等待 3-5 分鐘）

---

## 🔐 步驟 2：建立資料庫使用者

1. 在左側選單點擊 **Database Access**
2. 點擊 **Add New Database User**
3. 選擇 **Password** 驗證方式
4. 設定：
   - Username: `admin`（或任何你喜歡的名稱）
   - Password: 點擊「Autogenerate Secure Password」產生強密碼
   - **重要：複製並儲存這個密碼！待會需要用到**
5. Database User Privileges: 選擇 **Read and write to any database**
6. 點擊 **Add User**

---

## 🌐 步驟 3：設定網路存取（允許所有 IP）

1. 在左側選單點擊 **Network Access**
2. 點擊 **Add IP Address**
3. 點擊 **Allow Access from Anywhere**
4. IP Address 會自動填入 `0.0.0.0/0`
5. 點擊 **Confirm**

> 這樣設定是為了讓 Render 伺服器可以連線到資料庫

---

## 🔗 步驟 4：取得連線字串（Connection String）

1. 回到左側選單的 **Database**
2. 找到你的 Cluster（Cluster0），點擊 **Connect**
3. 選擇 **Connect your application**
4. Driver: 選擇 **Node.js**，Version: 選擇最新版本
5. 複製連線字串，格式如下：

```
mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **重要：將 `<password>` 替換成步驟 2 的密碼**

最終連線字串範例：
```
mongodb+srv://admin:MySecurePassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

---

## ☁️ 步驟 5：在 Render 設定環境變數

1. 登入 https://dashboard.render.com/
2. 找到你的服務 `social-engineering-tracker`
3. 點擊左側選單的 **Environment**
4. 點擊 **Add Environment Variable**
5. 填入：
   - **Key**: `MONGODB_URI`
   - **Value**: 貼上步驟 4 的連線字串（已替換密碼）
6. 點擊 **Save Changes**

---

## 🚀 步驟 6：重新部署

### 方法 1：推送程式碼觸發自動部署

```bash
cd "C:\社交工程"
git add .
git commit -m "升級為 MongoDB 資料庫，永久保存資料"
git push origin master
```

Render 會自動偵測到更新並重新部署。

### 方法 2：手動觸發部署

1. 在 Render Dashboard 中
2. 點擊 **Manual Deploy** → **Deploy latest commit**
3. 等待部署完成（約 2-3 分鐘）

---

## ✅ 步驟 7：驗證是否成功

### 檢查部署日誌

1. 在 Render Dashboard 點擊 **Logs**
2. 查看是否出現：`✅ MongoDB 連線成功`
3. 如果看到這個訊息，代表資料庫連線成功！

### 測試功能

1. 在 LINE 群組分享連結，請同事點擊
2. 開啟管理後台：`https://social-engineering-tracker.onrender.com/admin.html`
3. 確認點擊記錄有正常顯示

---

## 🎉 完成！資料將永久保存

現在你的點擊記錄會儲存在 MongoDB Atlas 雲端資料庫中：

✅ **重新部署** → 資料不會消失
✅ **伺服器重啟** → 資料不會消失
✅ **過了一年** → 資料還在

除非：
- 你在管理後台手動刪除
- 你刪除 MongoDB Atlas 帳號

---

## ❓ 常見問題

### Q1: 免費方案有使用限制嗎？

A: MongoDB Atlas M0 免費方案提供：
- 512MB 儲存空間（約可儲存數萬筆點擊記錄）
- 無時間限制，永久免費
- 足夠用於社交工程測試

### Q2: 如果忘記密碼怎麼辦？

A:
1. 前往 MongoDB Atlas → Database Access
2. 找到你的使用者，點擊 **Edit**
3. 點擊 **Edit Password** → 產生新密碼
4. 更新 Render 的 `MONGODB_URI` 環境變數
5. 重新部署

### Q3: 連線失敗怎麼辦？

A: 檢查清單：
- [ ] Network Access 是否設定為 `0.0.0.0/0`
- [ ] 連線字串中的 `<password>` 是否已替換
- [ ] 密碼中如果有特殊字元（如 `@`、`#`），需要 URL 編碼
- [ ] Render 環境變數 `MONGODB_URI` 是否正確設定

### Q4: 如何查看資料庫中的資料？

A:
1. MongoDB Atlas → Database → Collections
2. 點擊 **Browse Collections**
3. 選擇資料庫 `social-engineering` → Collection `clicks`
4. 可以直接查看、編輯、刪除記錄

---

## 🔒 安全提醒

- ❌ 不要將連線字串（包含密碼）提交到 Git
- ✅ 連線字串只存在 Render 的環境變數中
- ✅ `.env` 檔案已經在 `.gitignore` 中，不會被提交

---

## 📊 資料遷移（可選）

如果你之前有舊的 `clicks.json` 資料想要匯入：

1. 將 `clicks.json` 的內容複製
2. 使用 MongoDB Atlas 的 **Insert Document** 功能
3. 或者寫一個簡單的遷移腳本

需要協助可以告訴我！

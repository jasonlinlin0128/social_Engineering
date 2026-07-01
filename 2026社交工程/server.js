const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Neon Postgres：Vercel「Storage → Neon」一鍵整合會自動設好 DATABASE_URL
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const sql = connectionString ? neon(connectionString) : null;

// 確保資料表存在（每個 instance 冷啟動只跑一次）
let schemaReady;
function ensureSchema() {
  if (!sql)
    throw new Error(
      "DATABASE_URL 未設定（請在 Vercel Storage 連結 Neon 資料庫）",
    );
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS clicks (
      id           SERIAL PRIMARY KEY,
      user_id      TEXT NOT NULL DEFAULT 'Unknown',
      display_name TEXT NOT NULL DEFAULT '未知用戶',
      picture_url  TEXT NOT NULL DEFAULT '',
      user_agent   TEXT NOT NULL DEFAULT '',
      click_time   TEXT NOT NULL DEFAULT '',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  return schemaReady;
}

function taipeiNow() {
  return new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
}

// 管理員驗證：保護後台讀取/刪除端點；/api/track 保持公開，同仁點擊才記得到
function requireAdmin(req, res, next) {
  if (!process.env.ADMIN_TOKEN) {
    return res
      .status(401)
      .json({ success: false, message: "後台尚未設定 ADMIN_TOKEN" });
  }
  if (req.headers["x-admin-token"] !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: "密碼錯誤" });
  }
  next();
}

// API: 記錄點擊
app.post("/api/track", async (req, res) => {
  try {
    await ensureSchema();
    const { userId, displayName, pictureUrl, userAgent } = req.body;
    await sql`
      INSERT INTO clicks (user_id, display_name, picture_url, user_agent, click_time)
      VALUES (${userId || "Unknown"}, ${displayName || "未知用戶"}, ${pictureUrl || ""}, ${userAgent || ""}, ${taipeiNow()})
    `;
    res.json({ success: true, message: "記錄成功" });
  } catch (error) {
    console.error("記錄錯誤:", error);
    res.status(500).json({ success: false, message: "記錄失敗" });
  }
});

// LINE webhook：一次性擷取群組 groupId（把 OA 加進群、在群裡發一則訊息，這裡會 log 出 source）
// ponytail: 未驗證 X-Line-Signature，只為抓 groupId 的臨時用途；長期當正式 bot 再補簽章驗證
app.post("/api/line-webhook", (req, res) => {
  const events = (req.body && req.body.events) || [];
  events.forEach((e) =>
    console.log("LINE_WEBHOOK_SOURCE:", JSON.stringify(e.source || {})),
  );
  res.status(200).end();
});

// API: 獲取所有點擊記錄（欄位別名對齊前端，admin.html 不用改）
app.get("/api/clicks", requireAdmin, async (req, res) => {
  try {
    await ensureSchema();
    const data = await sql`
      SELECT id AS "_id", user_id AS "userId", display_name AS "displayName",
             picture_url AS "pictureUrl", user_agent AS "userAgent",
             click_time AS "clickTime", created_at AS "createdAt"
      FROM clicks
      ORDER BY created_at ASC
    `;
    res.json({ success: true, data });
  } catch (error) {
    console.error("讀取錯誤:", error);
    res.status(500).json({ success: false, message: "讀取失敗" });
  }
});

// API: 清除所有記錄
app.delete("/api/clicks", requireAdmin, async (req, res) => {
  try {
    await ensureSchema();
    await sql`DELETE FROM clicks`;
    res.json({ success: true, message: "已清除所有記錄" });
  } catch (error) {
    console.error("清除錯誤:", error);
    res.status(500).json({ success: false, message: "清除失敗" });
  }
});

// API: 批量刪除記錄
app.post("/api/clicks/bulk-delete", requireAdmin, async (req, res) => {
  try {
    await ensureSchema();
    const { deleteIds } = req.body;
    if (!Array.isArray(deleteIds)) {
      return res.status(400).json({ success: false, message: "資料格式錯誤" });
    }
    const ids = deleteIds.map(Number).filter(Number.isInteger);
    if (ids.length) {
      await sql`DELETE FROM clicks WHERE id = ANY(${ids}::int[])`;
    }
    res.json({ success: true, message: "已成功刪除選中項目" });
  } catch (error) {
    console.error("批量刪除錯誤:", error);
    res.status(500).json({ success: false, message: "批量刪除失敗" });
  }
});

// API: 獲取統計資訊
app.get("/api/stats", requireAdmin, async (req, res) => {
  try {
    await ensureSchema();
    const rows = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(DISTINCT user_id)::int AS unique_users,
        (SELECT click_time FROM clicks ORDER BY created_at DESC LIMIT 1) AS last_click
      FROM clicks
    `;
    const r = rows[0] || {};
    res.json({
      success: true,
      stats: {
        totalClicks: r.total || 0,
        uniqueUsers: r.unique_users || 0,
        lastClick: r.last_click || null,
      },
    });
  } catch (error) {
    console.error("統計錯誤:", error);
    res.status(500).json({ success: false, message: "統計失敗" });
  }
});

// 本機 / 直接執行才 listen；Vercel（serverless）會 import 這個 app
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
    console.log(`管理後台: http://localhost:${PORT}/admin.html`);
    console.log(`LIFF 頁面: http://localhost:${PORT}/index.html`);
  });
}

module.exports = app;

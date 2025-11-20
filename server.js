const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 資料儲存檔案
const DATA_FILE = path.join(__dirname, 'clicks.json');

// 初始化資料檔案
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// API: 記錄點擊
app.post('/api/track', (req, res) => {
  try {
    const { userId, displayName, pictureUrl, timestamp, userAgent } = req.body;

    // 讀取現有資料
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

    // 新增點擊記錄
    const clickRecord = {
      userId: userId || 'Unknown',
      displayName: displayName || '未知用戶',
      pictureUrl: pictureUrl || '',
      timestamp: timestamp || new Date().toISOString(),
      userAgent: userAgent || '',
      clickTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    };

    data.push(clickRecord);

    // 儲存資料
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ success: true, message: '記錄成功' });
  } catch (error) {
    console.error('記錄錯誤:', error);
    res.status(500).json({ success: false, message: '記錄失敗' });
  }
});

// API: 獲取所有點擊記錄
app.get('/api/clicks', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json({ success: true, data });
  } catch (error) {
    console.error('讀取錯誤:', error);
    res.status(500).json({ success: false, message: '讀取失敗' });
  }
});

// API: 清除所有記錄
app.delete('/api/clicks', (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    res.json({ success: true, message: '已清除所有記錄' });
  } catch (error) {
    console.error('清除錯誤:', error);
    res.status(500).json({ success: false, message: '清除失敗' });
  }
});

// API: 獲取統計資訊
app.get('/api/stats', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const stats = {
      totalClicks: data.length,
      uniqueUsers: new Set(data.map(d => d.userId)).size,
      lastClick: data.length > 0 ? data[data.length - 1].clickTime : null
    };
    res.json({ success: true, stats });
  } catch (error) {
    console.error('統計錯誤:', error);
    res.status(500).json({ success: false, message: '統計失敗' });
  }
});

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log(`管理後台: http://localhost:${PORT}/admin.html`);
  console.log(`LIFF 頁面: http://localhost:${PORT}/index.html`);
});

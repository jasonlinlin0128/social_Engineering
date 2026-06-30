const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB 連線
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/social-engineering';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB 連線成功'))
.catch(err => console.error('❌ MongoDB 連線失敗:', err));

// 定義 Click Schema
const clickSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'Unknown'
  },
  displayName: {
    type: String,
    default: '未知用戶'
  },
  pictureUrl: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    default: ''
  },
  clickTime: {
    type: String,
    default: () => new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
  }
}, {
  timestamps: true // 自動加入 createdAt 和 updatedAt
});

// 建立 Model
const Click = mongoose.model('Click', clickSchema);

// API: 記錄點擊
app.post('/api/track', async (req, res) => {
  try {
    const { userId, displayName, pictureUrl, timestamp, userAgent } = req.body;

    // 建立點擊記錄
    const clickRecord = new Click({
      userId: userId || 'Unknown',
      displayName: displayName || '未知用戶',
      pictureUrl: pictureUrl || '',
      timestamp: timestamp || new Date(),
      userAgent: userAgent || '',
      clickTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
    });

    // 儲存到資料庫
    await clickRecord.save();

    res.json({ success: true, message: '記錄成功' });
  } catch (error) {
    console.error('記錄錯誤:', error);
    res.status(500).json({ success: false, message: '記錄失敗' });
  }
});

// API: 獲取所有點擊記錄
app.get('/api/clicks', async (req, res) => {
  try {
    // 從資料庫讀取所有記錄，依時間排序
    const data = await Click.find().sort({ timestamp: 1 });
    res.json({ success: true, data });
  } catch (error) {
    console.error('讀取錯誤:', error);
    res.status(500).json({ success: false, message: '讀取失敗' });
  }
});

// API: 清除所有記錄
app.delete('/api/clicks', async (req, res) => {
  try {
    // 刪除所有記錄
    await Click.deleteMany({});
    res.json({ success: true, message: '已清除所有記錄' });
  } catch (error) {
    console.error('清除錯誤:', error);
    res.status(500).json({ success: false, message: '清除失敗' });
  }
});

// API: 批量刪除記錄
app.post('/api/clicks/bulk-delete', async (req, res) => {
  try {
    const { deleteIds } = req.body;

    if (!Array.isArray(deleteIds)) {
      return res.status(400).json({ success: false, message: '資料格式錯誤' });
    }

    // 根據 ID 批量刪除
    await Click.deleteMany({ _id: { $in: deleteIds } });

    res.json({ success: true, message: '已成功刪除選中項目' });
  } catch (error) {
    console.error('批量刪除錯誤:', error);
    res.status(500).json({ success: false, message: '批量刪除失敗' });
  }
});

// API: 獲取統計資訊
app.get('/api/stats', async (req, res) => {
  try {
    const totalClicks = await Click.countDocuments();
    const uniqueUsers = await Click.distinct('userId');
    const lastClickDoc = await Click.findOne().sort({ timestamp: -1 });

    const stats = {
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      lastClick: lastClickDoc ? lastClickDoc.clickTime : null
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

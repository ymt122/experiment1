const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');

const app = express();

// 環境変数の設定
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3001';

// セキュリティ強化
app.use(helmet());

// CORS設定
app.use(cors({
  origin: ALLOWED_ORIGIN
}));

app.use(express.json());

// ルートエンドポイント
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.send('Hello World!');
});

// データ保存用のエンドポイント
app.post('/api/save-data', (req, res) => {
  console.log('Received data:', req.body);
  const { data } = req.body;
  const filename = `data_${Date.now()}.csv`;
  const filepath = path.join(__dirname, 'data', filename);

  // データディレクトリが存在しない場合は作成
  try {
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    }
  } catch (err) {
    console.error('Error creating directory:', err);
    return res.status(500).json({ error: 'Failed to create data directory' });
  }

  fs.writeFile(filepath, data, (err) => {
    if (err) {
      console.error('Error saving file:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.json({ message: 'Data saved successfully' });
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origin: ${ALLOWED_ORIGIN}`);
});
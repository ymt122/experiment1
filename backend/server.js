const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS設定
app.use(cors({
  origin: 'http://localhost:3001' // フロントエンドのURLを指定
}));
app.use(express.json());

// ルートエンドポイントの追加
app.get('/', (req, res) => {
  console.log('GET / request received'); // ログを追加
  res.send('Hello World!');
});

// データ保存用のエンドポイントの追加
app.post('/api/save-data', (req, res) => {
  console.log('Received data:', req.body); // デバッグ用ログ
  const { data } = req.body;
  const filename = `data_${Date.now()}.csv`;
  const filepath = path.join(__dirname, 'data', filename);

  // データディレクトリが存在しない場合は作成
  if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
  }

  fs.writeFile(filepath, data, (err) => {
    if (err) {
      console.error('Error saving file:', err); // エラーメッセージを表示
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.json({ message: 'Data saved successfully' });
  });
});

// ポート番号の設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

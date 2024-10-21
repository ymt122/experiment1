const cors = require('cors');
const helmet = require('helmet');

// CORSミドルウェアの設定
const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3001'
});

// Helmetミドルウェアの設定
const helmetMiddleware = helmet();

module.exports = (req, res) => {
  // ミドルウェアの適用
  corsMiddleware(req, res, () => {
    helmetMiddleware(req, res, () => {
      if (req.method === 'POST') {
        console.log('Received data:', req.body);
        // ここでデータベースへの保存処理を行う（実装が必要）
        res.status(200).json({ message: 'Data received successfully' });
      } else {
        res.status(405).json({ error: 'Method Not Allowed' });
      }
    });
  });
};
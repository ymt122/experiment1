const cors = require('cors');
const helmet = require('helmet');

// CORSミドルウェアの設定
const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN || '*', // 開発中は'*'を使用し、本番環境では具体的なオリジンを指定
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Helmetミドルウェアの設定
const helmetMiddleware = helmet();

module.exports = (req, res) => {
  // ミドルウェアの適用
  corsMiddleware(req, res, () => {
    helmetMiddleware(req, res, () => {
      if (req.method === 'OPTIONS') {
        // プリフライトリクエストの処理
        res.status(200).end();
        return;
      }
      res.status(200).send('Hello World!');
    });
  });
};
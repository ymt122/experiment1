const cors = require('cors');
const config = require('../config');

// CORSミドルウェアの設定
const corsMiddleware = cors({
    origin: config.allowedOrigin || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    // プリフライトリクエストの処理
    res.status(200).end();
    return;
  }
  res.status(200).send('Hello World!');
};

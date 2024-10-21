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
      res.status(200).send('Hello World!');
    });
  });
};
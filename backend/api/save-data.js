const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// デバッグログの追加
console.log('Node ENV:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('ALLOWED_ORIGIN:', process.env.ALLOWED_ORIGIN);

// 開発環境でのみ.envファイルを読み込む
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '../../.env' });
  console.log('Loaded .env file');
}

// Mongooseの接続オプション
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  // デバッグモードを有効化
  debug: true
};

// MongoDBへの接続をPromiseで処理
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => {
    console.log('Successfully connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
  });

const db = mongoose.connection;

// より詳細なエラーハンドリング
db.on('error', (error) => {
  console.error('MongoDB connection error:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  });
});

db.once('open', function() {
  console.log('MongoDB connection established successfully');
});

// データモデルの定義
const DataSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
});

// 既存のモデルがある場合は再利用、ない場合は新規作成
const Data = mongoose.models.Data || mongoose.model('Data', DataSchema);

// CORSミドルウェアの設定
const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helmetミドルウェアの設定
const helmetMiddleware = helmet();

module.exports = async (req, res) => {
  try {
    // リクエストの詳細をログ
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    
    corsMiddleware(req, res, () => {
      helmetMiddleware(req, res, async () => {
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }
        
        if (req.method === 'POST') {
          try {
            console.log('Received request body:', req.body);
            
            const { content } = req.body;
            if (!content) {
              console.log('Content missing in request');
              return res.status(400).json({ error: 'Content is required' });
            }

            console.log('Creating new data document');
            const newData = new Data({ content });
            
            console.log('Attempting to save document');
            await newData.save();
            
            console.log('Document saved successfully');
            res.status(200).json({ 
              message: 'Data saved successfully', 
              id: newData._id,
              content: newData.content 
            });
          } catch (error) {
            console.error('Error processing request:', {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
            res.status(500).json({ 
              error: 'Internal server error', 
              message: error.message,
              type: error.name
            });
          }
        } else {
          res.status(405).json({ error: 'Method Not Allowed' });
        }
      });
    });
  } catch (error) {
    console.error('Top level error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'An unexpected error occurred'
    });
  }
};
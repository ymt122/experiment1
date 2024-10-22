const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// デバッグログの設定
const DEBUG = true;
const log = (message, data = '') => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data);
  }
};

log('Starting save-data.js');
log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN
});

// Mongooseのグローバル設定
mongoose.set('strictQuery', false);

// MongoDBへの接続を管理する関数
let isConnected = false;
const connectDB = async () => {
  if (isConnected) {
    log('Using existing MongoDB connection');
    return;
  }

  try {
    log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    });
    
    isConnected = true;
    log('Successfully connected to MongoDB');
  } catch (error) {
    log('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// データモデルの定義
const DataSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
}, {
  strictQuery: false
});

// モデルの作成（既存の場合は再利用）
const Data = mongoose.models.Data || mongoose.model('Data', DataSchema);

// CORSの設定
const corsOptions = {
  origin: 'https://experiment1-2.vercel.app', // リクエストを許可する特定のオリジン
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

const corsMiddleware = cors(corsOptions);
const helmetMiddleware = helmet();

module.exports = async (req, res) => {
  log('Received request:', {
    method: req.method,
    headers: req.headers
  });

  try {
    // CORS & Helmetの適用
    await new Promise((resolve) => corsMiddleware(req, res, resolve));
    await new Promise((resolve) => helmetMiddleware(req, res, resolve));

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    log('Request body:', req.body);

    // データの検証
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content is required'
      });
    }

    // MongoDBへの接続
    await connectDB();

    // データの保存
    log('Creating new document');
    const newData = new Data({ content });
    const savedData = await newData.save();
    
    log('Document saved successfully:', savedData);

    return res.status(200).json({
      message: 'Data saved successfully',
      data: {
        id: savedData._id,
        content: savedData.content,
        createdAt: savedData.createdAt
      }
    });

  } catch (error) {
    log('Error occurred:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // エラーレスポンスの返却
    return res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An error occurred while processing your request',
      type: error.name
    });
  }
};

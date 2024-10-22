// 環境変数のログ出力を開発環境のみに制限
if (process.env.NODE_ENV !== 'production') {
  console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    PRODUCTION_MONGODB_URI: process.env.PRODUCTION_MONGODB_URI ? 'Set' : 'Not set',
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
    PRODUCTION_ALLOWED_ORIGIN: process.env.PRODUCTION_ALLOWED_ORIGIN
  });
}

const express = require('express');
const config = require('../config');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const healthCheck = require('./health');
const saveData = require('./save-data');

console.log('Config:', JSON.stringify(config, null, 2));

const app = express();

// ミドルウェアの設定
app.use(cors(config.corsOptions));
app.use(helmet());
app.use(express.json());

// MongoDBへの接続関数
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // エラーをスローして、呼び出し元で処理できるようにする
    throw error;
  }
};

// 接続関数の呼び出しと接続完了の待機
const initializeApp = async () => {
  try {
    await connectToMongoDB();
    console.log('Application initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // エラーをスローして、Vercelの再試行メカニズムを活用
    throw error;
  }
};

// 接続状態の監視
mongoose.connection.on('disconnected', () => {
  console.log('Lost MongoDB connection. Reconnecting...');
  connectToMongoDB();
});

// ルートの設定
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  healthCheck(req, res);
});

app.post('/api/save-data', (req, res) => {
  console.log('Save data endpoint hit');
  saveData(req, res);
});

app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).json({ message: 'Welcome to the API' });
});

// アプリケーションの初期化
initializeApp().catch(error => {
  console.error('Failed to initialize application:', error);
  process.exit(1);
});

// Serverless Functionのエントリーポイント
module.exports = async (req, res) => {
  console.log('Received request:', req.method, req.url);
  try {
    // アプリケーションが初期化されていない場合のみ初期化
    if (mongoose.connection.readyState !== 1) {
      await initializeApp();
    }
    // Expressアプリケーションを正しく呼び出す
    app(req, res);
  } catch (error) {
    console.error('Error in Serverless Function:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

// エラーハンドリングミドルウェアを追加
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

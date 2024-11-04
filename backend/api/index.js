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
const { MongoClient } = require('mongodb');
const config = require('../../experiment1/src/lib/config');
const cors = require('cors');
const helmet = require('helmet');
const healthCheck = require('./health');
const saveData = require('./save-data');

console.log('Config:', JSON.stringify(config, null, 2));

const app = express();

// ミドルウェアの設定
app.use(cors(config.corsOptions));
app.use(helmet());
app.use(express.json());

// MongoDBの接続テスト
const testMongoConnection = async () => {
  console.log('Testing MongoDB connection...');
  const client = new MongoClient(config.mongodbUri);
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    await client.close();
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

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

// Serverless Functionのエントリーポイント
module.exports = async (req, res) => {
  console.log('Serverless Function entry point reached');
  console.log('Received request:', req.method, req.url);
  
  try {
    // 初期接続テスト
    await testMongoConnection();
    
    console.log('Calling Express application...');
    return new Promise((resolve, reject) => {
      app(req, res, (err) => {
        if (err) {
          console.error('Express application error:', err);
          reject(err);
        }
        resolve();
      });
    });
  } catch (error) {
    console.error('Error in Serverless Function:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message, 
      stack: config.isDevelopment ? error.stack : undefined 
    });
  }
};

// エラーハンドリングミドルウェアを追加
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message, 
    stack: config.isDevelopment ? err.stack : undefined 
  });
});
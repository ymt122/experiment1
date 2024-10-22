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
  console.log('Attempting to connect to MongoDB...');
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
  }
};

// 接続関数の呼び出しと接続完了の待機
const initializeApp = async () => {
  console.log('Initializing application...');
  try {
    await connectToMongoDB();
    console.log('Application initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
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

// Serverless Functionのエントリーポイント
module.exports = async (req, res) => {
  console.log('Serverless Function entry point reached');
  console.log('Received request:', req.method, req.url);
  try {
    console.log('Checking MongoDB connection state...');
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected. Initializing application...');
      await initializeApp();
    }
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    
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
    res.status(500).json({ error: 'Internal Server Error', message: error.message, stack: error.stack });
  }
};

// エラーハンドリングミドルウェアを追加
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message, stack: err.stack });
});

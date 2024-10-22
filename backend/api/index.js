console.log('Environment variables:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    PRODUCTION_MONGODB_URI: process.env.PRODUCTION_MONGODB_URI ? 'Set' : 'Not set',
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
    PRODUCTION_ALLOWED_ORIGIN: process.env.PRODUCTION_ALLOWED_ORIGIN
  });
  console.log('Config:', JSON.stringify(config, null, 2)); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const config = require('../config');
const healthCheck = require('./health');
const saveData = require('./save-data');

// Express アプリケーションの初期化
const app = express();

// ミドルウェアの設定
app.use(cors(config.corsOptions));
app.use(helmet());
app.use(express.json());

// MongoDBへの接続関数
const connectToMongoDB = async () => {
  if (mongoose.connection.readyState !== 1) {
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
      throw error;
    }
  }
};

// ルートの設定
app.get('/api/health', healthCheck);
app.post('/api/save-data', saveData);

// Serverless Function のエントリーポイント
module.exports = async (req, res) => {
  try {
    await connectToMongoDB();
    app(req, res);
  } catch (error) {
    console.error('Error in Serverless Function:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const express = require('express');
const config = require('./config');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');

const app = express();

// CORSミドルウェアの設定
app.use(cors(config.corsOptions));

// Helmetミドルウェアの設定
app.use(helmet());

// JSONボディパーサーの設定
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
    // 接続エラーの詳細をログに出力
    console.error('Connection details:', {
      uri: config.mongodbUri.replace(/\/\/.*@/, '//****:****@'), // パスワードを隠す
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000
      }
    });
    // アプリケーションを終了するか、再接続を試みる
    process.exit(1);
  }
};

// 接続関数の呼び出し
connectToMongoDB();

// 接続状態の監視
mongoose.connection.on('disconnected', () => {
  console.log('Lost MongoDB connection. Reconnecting...');
  connectToMongoDB();
});

// ここに他のルートやミドルウェアを追加

module.exports = app;

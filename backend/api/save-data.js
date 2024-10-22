const mongoose = require('mongoose');
const config = require('../config');

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
  MONGODB_URI: config.mongodbUri ? 'Set' : 'Not set',
  ALLOWED_ORIGIN: config.allowedOrigin
});

// データモデルの定義
const DataSchema = new mongoose.Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
}, {
  strictQuery: false
});

// モデルの作成（既存の場合は再利用）
const Data = mongoose.models.Data || mongoose.model('Data', DataSchema);

module.exports = async (req, res) => {
  log('Received request:', {
    method: req.method,
    headers: req.headers
  });

  try {
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

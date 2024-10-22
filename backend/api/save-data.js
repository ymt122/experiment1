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
  NODE_ENV: config.nodeEnv,
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
      log('Successfully connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
};

module.exports = async (req, res) => {
  try {
    await connectToMongoDB();

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Content is required'
      });
    }

    const newData = new Data({ content });
    const savedData = await newData.save();
    
    return res.status(200).json({
      message: 'Data saved successfully',
      data: {
        id: savedData._id,
        content: savedData.content,
        createdAt: savedData.createdAt
      }
    });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({
      error: 'Error',
      message: config.isDevelopment ? error.message : 'An error occurred while processing your request'
    });
  }
};

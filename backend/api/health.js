const mongoose = require('mongoose');
const config = require('../config');

module.exports = async (req, res) => {
  try {
    // MongoDBの接続状態を確認
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB is not connected');
    }

    // 簡単なクエリを実行してデータベースの応答を確認
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'healthy',
      message: 'Application is running and connected to MongoDB',
      environment: config.nodeEnv,
      mongodbStatus: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Application is running but there are issues',
      environment: config.nodeEnv,
      mongodbStatus: 'disconnected',
      error: config.isDevelopment ? error.message : 'Internal Server Error'
    });
  }
};

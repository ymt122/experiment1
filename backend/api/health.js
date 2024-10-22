const mongoose = require('mongoose');
const config = require('../config');

const connectToMongoDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(config.mongodbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      });
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
};

module.exports = async (req, res) => {
  try {
    await connectToMongoDB();
    
    // データベース接続のテスト
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: 'healthy',
      message: 'Application is running and connected to MongoDB',
      environment: config.nodeEnv,
      mongodbStatus: 'connected',
      mongodbUri: config.mongodbUri.replace(/\/\/.*@/, '//****:****@') // URIの機密情報を隠す
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Application is running but there are issues with MongoDB connection',
      environment: config.nodeEnv,
      mongodbStatus: 'disconnected',
      error: config.isDevelopment ? error.message : 'Internal Server Error',
      mongodbUri: config.mongodbUri.replace(/\/\/.*@/, '//****:****@') // URIの機密情報を隠す
    });
  }
};

require('dotenv').config(); // .envファイルを読み込む

console.log('Raw environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  PRODUCTION_MONGODB_URI: process.env.PRODUCTION_MONGODB_URI,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  PRODUCTION_ALLOWED_ORIGIN: process.env.PRODUCTION_ALLOWED_ORIGIN
});

const getAllowedOrigins = () => {
  const origins = process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_ALLOWED_ORIGIN
    : process.env.ALLOWED_ORIGIN;
  return origins ? origins.split(',') : [];
};

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_MONGODB_URI 
    : process.env.MONGODB_URI,
  allowedOrigin: process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_ALLOWED_ORIGIN
    : process.env.ALLOWED_ORIGIN,
  corsOptions: {
    origin: getAllowedOrigins(),
    methods: ['GET', 'POST', 'OPTIONS'], // GETメソッドを追加
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  isDevelopment: process.env.NODE_ENV === 'development'
};

module.exports = config;

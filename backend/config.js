require('dotenv').config(); // .envファイルを読み込む

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_MONGODB_URI 
    : process.env.MONGODB_URI,
  allowedOrigin: process.env.NODE_ENV === 'production'
    ? process.env.PRODUCTION_ALLOWED_ORIGIN
    : process.env.ALLOWED_ORIGIN,
  corsOptions: {
    origin: (process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_ALLOWED_ORIGIN 
      : process.env.ALLOWED_ORIGIN).split(','),
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  isDevelopment: process.env.NODE_ENV === 'development'
};

module.exports = config;

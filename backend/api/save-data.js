const { MongoClient } = require('mongodb');
const cors = require('cors');
const helmet = require('helmet');

// CORSミドルウェアの設定
const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Helmetミドルウェアの設定
const helmetMiddleware = helmet();

module.exports = async (req, res) => {
  console.log('Starting save-data handler');
  
  try {
    // CORSとHelmetの適用
    await new Promise((resolve) => corsMiddleware(req, res, resolve));
    await new Promise((resolve) => helmetMiddleware(req, res, resolve));

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log('Connecting to MongoDB...');
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db('experiment1');
    const collection = db.collection('data');

    const { content } = req.body;
    if (!content) {
      await client.close();
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await collection.insertOne({
      content,
      createdAt: new Date()
    });

    await client.close();
    console.log('Data saved successfully');
    
    return res.status(200).json({
      message: 'Data saved successfully',
      id: result.insertedId
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
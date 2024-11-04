import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { config } from '@/lib/config';

const checkMongoConnection = async () => {
  const client = new MongoClient(config.mongodbUri);
  try {
    await client.connect();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  } finally {
    await client.close();
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await checkMongoConnection();
    
    res.status(200).json({
      status: 'healthy',
      message: 'Application is running and connected to MongoDB',
      environment: config.nodeEnv,
      mongodbStatus: 'connected',
      mongodbUri: config.mongodbUri.replace(/\/\/.*@/, '//****:****@')
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Application is running but there are issues with MongoDB connection',
      environment: config.nodeEnv,
      mongodbStatus: 'disconnected',
      error: config.isDevelopment ? error.message : 'Internal Server Error',
      mongodbUri: config.mongodbUri.replace(/\/\/.*@/, '//****:****@')
    });
  }
} 
import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}

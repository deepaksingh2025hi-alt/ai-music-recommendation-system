import mongoose from 'mongoose';
import { config } from './env.js';

export let isConnectedToMongo = false;

export const connectDB = async (): Promise<boolean> => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnectedToMongo = true;
    console.log(` MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error: any) {
    isConnectedToMongo = false;
    console.warn(` MongoDB not connected (${error.message}). Using local JSON/Memory storage fallback.`);
    return false;
  }
};


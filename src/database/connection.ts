import mongoose from 'mongoose';
import { config } from '../config/index';
import { logger } from '../logger/index';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    logger.info(`💾 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error('❌ Database connection error: ', error);
    process.exit(1);
  }
};

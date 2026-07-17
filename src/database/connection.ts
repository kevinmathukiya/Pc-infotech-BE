import mongoose from 'mongoose';
import { config } from '../config/index';
import { logger } from '../logger/index';

export const connectDatabase = async (retries = 5, delay = 5000): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(config.MONGO_URI);
      logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${retries} failed:`, error);
      if (attempt === retries) {
        logger.error('Max database connection retries reached. Exiting...');
        process.exit(1);
      }
      logger.info(`Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};


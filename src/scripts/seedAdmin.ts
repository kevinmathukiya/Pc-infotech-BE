import mongoose from 'mongoose';
import { Admin } from '../modules/auth/auth.model';
import { config } from '../config/index';
import { logger } from '../logger/index';

const seedAdmin = async () => {
  try {
    logger.info('🚀 Connecting to MongoDB for seeding...');
    await mongoose.connect(config.MONGO_URI);
    logger.info('💾 MongoDB Connected. Checking Admin account...');

    const adminExists = await Admin.findOne({ email: config.ADMIN_EMAIL.toLowerCase() });

    if (adminExists) {
      logger.info(`ℹ️ Admin account already exists with email: ${config.ADMIN_EMAIL}`);
      process.exit(0);
    }

    const newAdmin = new Admin({
      name: 'PC INFOTECH Admin',
      email: config.ADMIN_EMAIL,
      password: config.ADMIN_PASSWORD,
    });

    await newAdmin.save();
    logger.info(`✅ Admin account seeded successfully!`);
    logger.info(`📧 Email: ${config.ADMIN_EMAIL}`);
    logger.info(`🔑 Password: ${config.ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error seeding Admin account:', error);
    process.exit(1);
  }
};

seedAdmin();

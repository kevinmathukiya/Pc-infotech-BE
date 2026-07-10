import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess((val) => Number(val), z.number().default(5000)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  ADMIN_EMAIL: z.string().email('Invalid admin email format'),
  ADMIN_PASSWORD: z.string().min(6, 'Admin password must be at least 6 characters'),
  WHATSAPP_NUMBER: z.string().min(1, 'WHATSAPP_NUMBER is required'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional().default(587)),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('"PC INFOTECH Support" <no-reply@pcinfotech.com>'),
  EMAIL_HOST: z.string().optional().default(''),
  EMAIL_PORT: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional().default(587)),
  EMAIL_USER: z.string().optional().default(''),
  EMAIL_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().optional().default('"PC INFOTECH Support" <no-reply@pcinfotech.com>'),
  CORS_ORIGIN: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;

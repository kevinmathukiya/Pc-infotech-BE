import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/appError';
import { HttpStatus } from './constants/httpStatusCodes';
import { apiLimiter, authLimiter, formLimiter } from './middleware/rateLimiter';

// Module Routes
import authRoutes from './modules/auth/auth.route';
import categoryRoutes from './modules/category/category.route';
import productRoutes from './modules/product/product.route';
import sparePartRoutes from './modules/sparePart/sparePart.route';
import userRoutes from './modules/user/user.route';
import serviceRoutes from './modules/service/service.route';
import branchRoutes from './modules/branch/branch.route';
import serviceRequestRoutes from './modules/serviceRequest/serviceRequest.route';
import blogRoutes from './modules/blog/blog.route';
import testimonialRoutes from './modules/testimonial/testimonial.route';
import cmsRoutes from './modules/cms/cms.route';
import contactRoutes from './modules/contact/contact.route';
import { feedbackRoutes } from './modules/feedback/feedback.route';
import { careerRoutes } from './modules/career/career.route';
import { jobApplicationRoutes } from './modules/jobApplication/jobApplication.route';

const app: Application = express();

// ─── Security & CORS Middleware ───────────────────────────────────────────────
if (config.NODE_ENV !== 'development') {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
}

const allowedOrigins = config.CORS_ORIGIN
  ? config.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Postman, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Apply general API rate limiter globally
app.use(apiLimiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── API Routes ───────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

// Auth and User routes are rate limited with authLimiter
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/users`, authLimiter, userRoutes);

// Public form submissions are rate limited inside their respective routers
app.use(`${API_PREFIX}/service-requests`, serviceRequestRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);

// Other resource routes
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/spare-parts`, sparePartRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/branches`, branchRoutes);
app.use(`${API_PREFIX}/blogs`, blogRoutes);
app.use(`${API_PREFIX}/testimonials`, testimonialRoutes);
app.use(`${API_PREFIX}/cms`, cmsRoutes);
app.use(`${API_PREFIX}/feedbacks`, feedbackRoutes);
app.use(`${API_PREFIX}/careers`, careerRoutes);
app.use(`${API_PREFIX}/job-applications`, jobApplicationRoutes);

// ─── Swagger Docs ────────────────────────────────────────────────────────────
const swaggerPath = path.join(__dirname, 'swagger', 'swagger.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
const healthHandler = (_req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: dbConnected,
    message: dbConnected ? '🟢 PC INFOTECH API is running and database is connected.' : '🔴 Database is disconnected.',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
};

app.get('/health', healthHandler);
app.get(`${API_PREFIX}/health`, healthHandler);

// ─── 404 Catch-All ───────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, HttpStatus.NOT_FOUND));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

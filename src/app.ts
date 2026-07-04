import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

import { config } from './config/index';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/appError';
import { HttpStatus } from './constants/httpStatusCodes';

// Module Routes
import authRoutes from './modules/auth/auth.route';
import brandRoutes from './modules/brand/brand.route';
import categoryRoutes from './modules/category/category.route';
import productRoutes from './modules/product/product.route';
import serviceRoutes from './modules/service/service.route';
import branchRoutes from './modules/branch/branch.route';
import serviceRequestRoutes from './modules/serviceRequest/serviceRequest.route';
import blogRoutes from './modules/blog/blog.route';
import testimonialRoutes from './modules/testimonial/testimonial.route';
import cmsRoutes from './modules/cms/cms.route';
import contactRoutes from './modules/contact/contact.route';

const app: Application = express();

// ─── Security & CORS Middleware ───────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  })
);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── API Routes ───────────────────────────────────────────────────────────────
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/brands`, brandRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/services`, serviceRoutes);
app.use(`${API_PREFIX}/branches`, branchRoutes);
app.use(`${API_PREFIX}/service-requests`, serviceRequestRoutes);
app.use(`${API_PREFIX}/blogs`, blogRoutes);
app.use(`${API_PREFIX}/testimonials`, testimonialRoutes);
app.use(`${API_PREFIX}/cms`, cmsRoutes);
app.use(`${API_PREFIX}/contact`, contactRoutes);

// ─── Swagger Docs ────────────────────────────────────────────────────────────
const swaggerPath = path.join(__dirname, 'swagger', 'swagger.json');
if (fs.existsSync(swaggerPath)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    success: true,
    message: '🟢 PC INFOTECH API is running.',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// ─── 404 Catch-All ───────────────────────────────────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server.`, HttpStatus.NOT_FOUND));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

export default app;

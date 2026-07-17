import http from 'http';
import app from './app';
import { config } from './config/index';
import { connectDatabase } from './database/connection';
import { logger } from './logger/index';

const startServer = async () => {
  // Connect to MongoDB before starting HTTP listener
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(config.PORT, () => {
    logger.info(`PC INFOTECH API Server running in ${config.NODE_ENV} mode`);
    logger.info(`Base URL:    http://localhost:${config.PORT}/api/v1`);
    logger.info(`Swagger UI:  http://localhost:${config.PORT}/api-docs`);
    logger.info(`Health:      http://localhost:${config.PORT}/health`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ─── Unhandled Rejection / Uncaught Exception ───────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();

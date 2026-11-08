import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { errorHandler } from './middlewares/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'Cross-Platform Blueprint API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routers
  app.use('/api', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

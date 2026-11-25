import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { errorHandler, notFound } from './middleware/errorHandler.ts';
import adminRoutes from './routes/adminRoutes.ts';
import applicationRoutes from './routes/applicationRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import companyRoutes from './routes/companyRoutes.ts';
import jobRoutes from './routes/jobRoutes.ts';
import notificationRoutes from './routes/notificationRoutes.ts';
import publicRoutes from './routes/publicRoutes.ts';
import savedJobRoutes from './routes/savedJobRoutes.ts';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please slow down and try again.' },
  });
  app.use('/api', apiLimiter);

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/companies', companyRoutes);
  app.use('/api/saved-jobs', savedJobRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/public', publicRoutes);

  // Return 404 JSON only for unmatched /api/* endpoints; SPA routes are handled by Vite/static fallback
  app.use('/api', notFound);
  app.use(errorHandler);

  return app;
}

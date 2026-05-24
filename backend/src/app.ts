import express from 'express';
import cors from 'cors';

import { attachAuth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { formsRouter } from './routes/forms';
import { responsesRouter } from './routes/responses';

export function createApp() {
  const app = express();

  // Default allows both localhost and 127.0.0.1 so browser login works
  // regardless of which URL the Next dev server is opened with.
  const origins = (
    process.env.CORS_ORIGIN ??
    'http://localhost:3000,http://127.0.0.1:3000'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: origins,
      credentials: false,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  // Attach the JWT (if present) on every request; individual routes decide
  // whether that token is required or not.
  app.use(attachAuth);

  app.use('/api/auth', authRouter);
  app.use('/api/forms', formsRouter);
  app.use('/api/responses', responsesRouter);

  app.use(errorHandler);
  return app;
}

import type { ErrorRequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  console.error('[api]', err);
  res.status(500).json({
    message: err?.message ?? 'Internal Server Error',
  });
};

export const notFoundHandler: ErrorRequestHandler = (_err, _req, res) => {
  res.status(404).json({ message: 'Not found' });
};

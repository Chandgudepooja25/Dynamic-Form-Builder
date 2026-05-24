import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken, type JwtPayload } from '../utils/token';

/**
 * Request shape augmented with the (optional) decoded JWT.
 * Routes that need the user should reach for `req.auth`.
 */
export interface AuthedRequest extends Request {
  auth?: JwtPayload;
}

/** Populates `req.auth` if a valid Bearer token is present, otherwise no-op. */
export const attachAuth: RequestHandler = (req: AuthedRequest, _res, next) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length).trim();
    if (token) {
      const payload = verifyToken(token);
      if (payload) req.auth = payload;
    }
  }
  next();
};

/** Aborts with 401 unless the request has a verified JWT. */
export const requireAuth: RequestHandler = (req: AuthedRequest, _res, next) => {
  if (!req.auth) return next(new ApiError('Authentication required', 401));
  next();
};

/** Aborts with 401/403 unless the JWT represents an admin. */
export const requireAdmin: RequestHandler = (req: AuthedRequest, _res, next) => {
  if (!req.auth) return next(new ApiError('Authentication required', 401));
  if (req.auth.role !== 'admin') {
    return next(new ApiError('Administrator access required', 403));
  }
  next();
};

export type { Response, NextFunction };

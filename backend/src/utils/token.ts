import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AuthUser } from '../../../shared/types';

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
}

export function signToken(user: AuthUser): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
  return jwt.sign({ ...user }, getSecret(), { algorithm: 'HS256', expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Emails listed in `ADMIN_EMAILS` (comma-separated) are promoted to `admin`
 * during registration. This is the ONLY path by which a signup flow can
 * mint an admin — the client-supplied `role` is always ignored.
 */
export function isAdminEmail(email: string): boolean {
  const raw = process.env.ADMIN_EMAILS ?? '';
  if (!raw.trim()) return false;
  const normalized = email.trim().toLowerCase();
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(normalized);
}

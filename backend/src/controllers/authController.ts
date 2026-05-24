import type { Response, NextFunction } from 'express';
import * as usersRepo from '../repos/usersRepo';
import { hashPassword, verifyPassword } from '../utils/password';
import { ApiError } from '../utils/ApiError';
import { isAdminEmail, signToken } from '../utils/token';
import type { AuthedRequest } from '../middleware/auth';

export async function register(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, email, password, role: requestedRole } = req.body ?? {};
    if (!name || !email || !password) {
      throw new ApiError('name, email and password are required', 400);
    }

    const normalizedEmail = String(email).toLowerCase();
    const existing = await usersRepo.findUserByEmail(normalizedEmail);
    if (existing) throw new ApiError('Email already registered', 409);

    const role: 'admin' | 'user' =
      requestedRole === 'admin' || requestedRole === 'user'
        ? requestedRole
        : isAdminEmail(normalizedEmail)
          ? 'admin'
          : 'user';

    const passwordHash = await hashPassword(password);
    const row = await usersRepo.createUser({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
    });

    const json = usersRepo.userToApi(row);
    const token = signToken({
      id: json.id,
      name: json.name,
      email: json.email,
      role: json.role,
    });
    res.status(201).json({ user: json, token });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body ?? {};
    const user = await usersRepo.findUserByEmail(
      String(email || '').toLowerCase()
    );
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      throw new ApiError('Invalid credentials', 401);
    }
    const json = usersRepo.userToApi(user);
    const token = signToken({
      id: json.id,
      name: json.name,
      email: json.email,
      role: json.role,
    });
    res.json({ user: json, token });
  } catch (err) {
    next(err);
  }
}

export function me(req: AuthedRequest, res: Response) {
  res.json(req.auth ?? null);
}

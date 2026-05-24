import { Router } from 'express';
import * as authController from '../controllers/authController';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authController.me);

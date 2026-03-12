import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// /api/auth/register
router.post('/register', authController.register);

// /api/auth/login
router.post('/login', authController.login);
router.post('/login-pin', authController.loginPin);
router.post('/logout', authController.logout);

export default router;

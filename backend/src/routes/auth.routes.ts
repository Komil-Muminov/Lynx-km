import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

// /api/auth/register
router.post('/register', authController.register);

// /api/auth/login
router.post('/login', authController.login);

export default router;

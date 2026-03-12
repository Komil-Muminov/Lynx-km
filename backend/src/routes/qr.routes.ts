import { Router } from 'express';
import * as qrController from '../controllers/qr.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

// Генерация QR (доступно Админу и Менеджеру)
router.get(
  '/:restaurantId', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.MANAGER), 
  qrController.getTableQRs
);

export default router;

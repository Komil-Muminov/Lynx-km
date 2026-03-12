import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

// Управление персоналом (доступно Админу и Менеджеру заведения)
router.get(
  '/restaurant/:restaurantId', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.MANAGER), 
  userController.getStaff
);

router.post(
  '/staff', 
  protect, 
  authorize(EUserRole.ADMIN, EUserRole.MANAGER), 
  userController.addStaff
);

router.patch(
  '/:id', 
  protect, 
  authorize(EUserRole.ADMIN, EUserRole.MANAGER), 
  userController.updateStaff
);

router.patch(
  '/shift', 
  protect, 
  userController.toggleShift
);

router.post(
  '/set-pin', 
  protect, 
  userController.setPin
);

router.get(
  '/shifts/:restaurantId', 
  protect, 
  authorize(EUserRole.ADMIN, EUserRole.MANAGER), 
  userController.getShiftHistory
);

router.delete(
  '/:id', 
  protect, 
  authorize(EUserRole.ADMIN, EUserRole.MANAGER), 
  userController.removeStaff
);

export default router;

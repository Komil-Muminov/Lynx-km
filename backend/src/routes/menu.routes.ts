import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

// /api/menu/:restaurantId
router.get('/:restaurantId', menuController.getMenu);

router.put(
  '/:restaurantId', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN), 
  menuController.updateMenu
);

router.post(
  '/:restaurantId/items', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN), 
  menuController.addItem
);

export default router;

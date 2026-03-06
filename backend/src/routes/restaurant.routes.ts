import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

// /api/restaurants
router.post(
  '/', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN), 
  restaurantController.createRestaurant
);

router.get(
  '/', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN), 
  restaurantController.getAllRestaurants
);

router.get('/:id', restaurantController.getRestaurant);

router.put(
  '/:id', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN), 
  restaurantController.updateRestaurant
);

export default router;

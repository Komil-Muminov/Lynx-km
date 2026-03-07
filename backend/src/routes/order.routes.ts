import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

// /api/orders
router.post('/', orderController.createOrder); // Гость создает заказ

router.get(
  '/restaurant/:restaurantId', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.WAITER, EUserRole.CHEF, EUserRole.CASHIER), 
  orderController.getActiveOrders
);

router.put(
  '/:orderId/status', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.CHEF, EUserRole.WAITER, EUserRole.CASHIER), 
  orderController.updateOrderStatus
);

// /api/orders/stats/restaurant/:restaurantId
router.get(
  '/stats/restaurant/:restaurantId',
  protect,
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN),
  orderController.getManagerStats
);

// /api/orders/history/:restaurantId
router.get(
  '/history/:restaurantId',
  protect,
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN),
  orderController.getOrderHistory
);

// /api/orders/stats/platform
router.get(
  '/stats/platform', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN), 
  orderController.getPlatformStats
);

export default router;

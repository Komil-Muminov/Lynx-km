import { Router } from 'express';
import * as callController from '../controllers/call.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

// /api/calls
router.post('/', callController.createCall); // Гость

router.get(
  '/restaurant/:restaurantId', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.WAITER), 
  callController.getActiveCalls
);

router.put(
  '/:callId/resolve', 
  protect, 
  authorize(EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.WAITER), 
  callController.resolveCall
);

export default router;

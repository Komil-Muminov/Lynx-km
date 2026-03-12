import { Router } from 'express';
import { getDashboardAnalytics, getStaffKPI } from '../controllers/analyticsController';
import { protect, authorize } from '../middleware/auth.middleware';
import { EUserRole } from '../models/model';

const router = Router();

router.use(protect);
router.use(authorize(EUserRole.ADMIN, EUserRole.MANAGER, EUserRole.SUPER_ADMIN));

router.get('/dashboard', getDashboardAnalytics);
router.get('/staff-kpi', getStaffKPI);

export default router;

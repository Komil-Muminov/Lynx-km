import { Router } from 'express';
import * as financeController from '../controllers/finance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { EUserRole } from '../models/model.js';

const router = Router();

// Все роуты защищены
router.use(protect);

// Получение ожидаемой выручки (для кассира перед закрытием)
router.get('/expected', authorize(EUserRole.CASHIER, EUserRole.MANAGER, EUserRole.ADMIN), financeController.getCurrentExpected);

// Закрытие дня (только кассир или менеджер)
router.post('/close', authorize(EUserRole.CASHIER, EUserRole.MANAGER), financeController.closeDay);

// История отчетов (только менеджер или админ)
router.get('/reports', authorize(EUserRole.MANAGER, EUserRole.ADMIN), financeController.getFinancialReports);

export default router;

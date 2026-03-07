import { Router } from 'express';
import { scanTable } from '../controllers/scan.controller';

const router = Router();

// GET /api/scan?restaurantId=...&tableId=...
// Публичный роут — вызывается при сканировании QR
router.get('/', scanTable);

export default router;

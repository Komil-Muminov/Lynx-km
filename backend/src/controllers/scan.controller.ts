import { Request, Response } from 'express';
import { Restaurant } from '../models/model';

/**
 * Публичный "scan" endpoint — вызывается фронтом при старте приложения,
 * когда сканируется QR-код стола.
 *
 * GET /api/scan?restaurantId=...&tableId=...
 *
 * Возвращает минимальный набор данных для запуска гостевой сессии:
 * - Инфо о ресторане (название, логотип)
 * - Подтверждение, что restaurantId и tableId валидны
 */
export const scanTable = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableId } = req.query;

    if (!restaurantId || !tableId) {
      return res.status(400).json({
        message: 'Отсутствуют обязательные параметры: restaurantId и tableId'
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Заведение не найдено' });
    }

    // Возвращаем только нужные гостю данные
    res.json({
      restaurantId: restaurant._id,
      tableId: String(tableId),
      restaurantName: restaurant.name,
      restaurantType: restaurant.type,
      logoUrl: restaurant.logoUrl,
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ message: 'Ошибка сервера при сканировании' });
  }
};

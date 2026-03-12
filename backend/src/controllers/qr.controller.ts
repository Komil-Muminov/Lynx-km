import { Request, Response } from 'express';
import { Restaurant } from '../models/model';

/**
 * Получение списка QR-кодов для всех столов ресторана
 */
export const getTableQRs = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Ресторан не найден' });
    }

    // В будущем тут можно генерировать реальные PNG через qrcode library
    // Сейчас возвращаем структуру данных для фронтенда
    const tables = [];
    for (let i = 1; i <= restaurant.tableCount; i++) {
      tables.push({
        tableId: i.toString(),
        // Ссылка формата: lynx://order?r=ID&t=N
        // Или web-fallback если нужно
        url: `https://km-lynx.app/scan?restaurantId=${restaurantId}&tableId=${i}`
      });
    }

    res.json({
      restaurantName: restaurant.name,
      tables
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при генерации QR-кодов' });
  }
};

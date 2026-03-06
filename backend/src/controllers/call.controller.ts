import { Request, Response } from 'express';
import { StaffCall } from '../models/call.model';
import { EUserRole } from '../models/model';

/**
 * Гость вызывает персонал
 */
export const createCall = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableId, type } = req.body;

    const newCall = new StaffCall({
      restaurantId,
      tableId,
      type,
    });

    await newCall.save();
    
    // В реальном приложении здесь будет Socket.IO эмит для моментального уведомления официанта
    
    res.status(201).json(newCall);
  } catch (error) {
    console.error('Create call error:', error);
    res.status(500).json({ message: 'Ошибка при вызове персонала' });
  }
};

/**
 * Официант получает активные вызовы для своего заведения
 */
export const getActiveCalls = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    // Проверка прав (упрощенно)
    if (req.user?.role !== EUserRole.SUPER_ADMIN && req.user?.restaurantId?.toString() !== restaurantId) {
       return res.status(403).json({ message: 'Нет доступа' });
    }

    const calls = await StaffCall.find({ restaurantId, status: 'pending' }).sort({ createdAt: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении вызовов' });
  }
};

/**
 * Официант закрывает вызов (помечает решенным)
 */
export const resolveCall = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    
    const call = await StaffCall.findByIdAndUpdate(callId, { status: 'resolved' }, { new: true });
    if (!call) return res.status(404).json({ message: 'Вызов не найден' });
    
    res.json(call);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении вызова' });
  }
};

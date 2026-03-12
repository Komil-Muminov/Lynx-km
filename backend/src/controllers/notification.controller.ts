import { Request, Response } from 'express';
import { Notification } from '../models/model';

/**
 * Получение уведомлений текущего пользователя
 */
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении уведомлений' });
  }
};

/**
 * Отметить уведомление как прочитанное
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: 'Уведомление прочитано' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении уведомления' });
  }
};

/**
 * Создание уведомления (внутренняя функция)
 */
export const createNotification = async (userId: string, message: string, type: 'order_ready' | 'call_waiter' | 'system') => {
  try {
    const notification = new Notification({
      userId,
      message,
      type
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

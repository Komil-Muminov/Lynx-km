import { Request, Response } from 'express';
import { Order, Commission, EUserRole } from '../models/model';

/**
 * Создание нового заказа (Гость)
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableId, items, totalAmount } = req.body;

    const newOrder = new Order({
      restaurantId,
      tableId,
      items,
      totalAmount,
      commissionAmount: 1, // Твой 1 дирам
      status: 'pending'
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
};

/**
 * Смена статуса заказа (Повар / Официант / Кассир)
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // 'pending' | 'cooking' | 'ready' | 'paid' | 'cancelled'

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Заказ не найден' });
    }

    // Проверка прав (упрощенно: сотрудник этого заведения)
    if (req.user?.role !== EUserRole.SUPER_ADMIN && req.user?.restaurantId?.toString() !== order.restaurantId.toString()) {
      return res.status(403).json({ message: 'Нет доступа к этому заказу' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // ГЛАВНАЯ ЛОГИКА: Если заказ оплачен, фиксируем комиссию 1 дирам
    if (status === 'paid' && oldStatus !== 'paid') {
      const commission = new Commission({
        orderId: order._id,
        restaurantId: order.restaurantId,
        amount: order.commissionAmount,
        status: 'pending' // Статус выплаты комиссии тебе
      });
      await commission.save();
    }

    res.json(order);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статуса' });
  }
};

/**
 * Список активных заказов для заведения (Для персонала)
 */
export const getActiveOrders = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ 
      restaurantId, 
      status: { $ne: 'paid' } 
    }).sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении заказов' });
  }
};

/**
 * Глобальная статистика комиссий (Только для Супер-Админа - Комила)
 */
export const getPlatformStats = async (req: Request, res: Response) => {
  try {
    const totalCommissions = await Commission.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalOrders = await Order.countDocuments({ status: 'paid' });
    
    res.json({
      totalEarnings: totalCommissions[0]?.total || 0,
      paidOrdersCount: totalOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
};

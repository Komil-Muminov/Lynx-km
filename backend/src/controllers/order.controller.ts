import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, Commission, EUserRole } from '../models/model';

/**
 * Создание нового заказа (Гость)
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableId, items, totalAmount } = req.body;

    // Ищем черновик, чтобы превратить его в реальный заказ
    let order = await Order.findOne({ 
      restaurantId, 
      tableId, 
      status: 'draft' 
    });

    if (order) {
      order.items = items;
      order.totalAmount = totalAmount;
      order.status = 'pending';
      await order.save();
    } else {
      order = new Order({
        restaurantId,
        tableId,
        items,
        totalAmount,
        commissionAmount: 1,
        status: 'pending'
      });
      await order.save();
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Ошибка при создании заказа' });
  }
};

/**
 * Синхронизация корзины (Гость выбирает блюда)
 */
export const syncCart = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableId, items, totalAmount } = req.body;

    // Ищем существующий черновик для этого стола
    let order = await Order.findOne({ 
      restaurantId, 
      tableId, 
      status: 'draft' 
    });

    if (order) {
      order.items = items;
      order.totalAmount = totalAmount;
      await order.save();
    } else {
      order = new Order({
        restaurantId,
        tableId,
        items,
        totalAmount,
        status: 'draft'
      });
      await order.save();
    }

    res.json(order);
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({ message: 'Ошибка при синхронизации корзины' });
  }
};

/**
 * Смена статуса заказа (Повар / Официант / Кассир)
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, discount, tips } = req.body; // 'pending' | 'cooking' | 'ready' | 'paid' | 'cancelled'

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
    
    // Если передана скидка или чаевые, сохраняем (обычно при status='paid')
    if (discount !== undefined) order.discount = discount;
    if (tips !== undefined) order.tips = tips;

    await order.save();

    // ГЛАВНАЯ ЛОГИКА: Если заказ оплачен, фиксируем комиссию 1 сомони
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
      status: { $in: ['draft', 'pending', 'cooking', 'ready'] } 
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
/**
 * Статистика для менеджера конкретного заведения
 */
export const getManagerStats = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;

    // Начало сегодняшнего дня
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const stats = await Order.aggregate([
      { 
        $match: { 
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: 'paid',
          createdAt: { $gte: startOfDay }
        } 
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: '$totalAmount' },
          todayOrdersCount: { $sum: 1 },
          todayCommission: { $sum: '$commissionAmount' }
        }
      }
    ]);

    const result = stats[0] || {
      todayRevenue: 0,
      todayOrdersCount: 0,
      todayCommission: 0
    };

    // Добавим средний чек
    const averageBill = result.todayOrdersCount > 0 
      ? Math.round(result.todayRevenue / result.todayOrdersCount) 
      : 0;

    res.json({
      ...result,
      averageBill
    });
  } catch (error) {
    console.error('Get manager stats error:', error);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
};

/**
 * История чеков для менеджера конкретного заведения
 */
export const getOrderHistory = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    
    // Получаем последние 50 оплаченных заказов
    const history = await Order.find({
      restaurantId,
      status: 'paid'
    })
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(history);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ message: 'Ошибка при получении истории заказов' });
  }
};

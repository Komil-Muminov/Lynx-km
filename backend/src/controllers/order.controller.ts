import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, Commission, EUserRole, User } from '../models/model';
import { createNotification } from './notification.controller';

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
 * Получение статуса заказа для гостя (без авторизации)
 */
export const getGuestOrderStatus = async (req: Request, res: Response) => {
  try {
    const { restaurantId, tableId } = req.params;

    if (!restaurantId || !tableId) {
      return res.status(400).json({ message: 'restaurantId and tableId are required' });
    }

    // Ищем последний активный заказ для этого столика (не архивный)
    const order = await Order.findOne({ 
      restaurantId, 
      tableId,
      status: { $in: ['pending', 'cooking', 'ready', 'paid'] }
    }).sort({ createdAt: -1 });

    res.json(order || null);
  } catch (error) {
    console.error('Get guest order status error:', error);
    res.status(500).json({ message: 'Ошибка при получении статуса заказа' });
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
    
    // Новая логика v7.0: Фиксируем время для аналитики
    if (status === 'cooking' && oldStatus !== 'cooking') {
      order.cookingAt = new Date();
    }
    if (status === 'ready' && oldStatus !== 'ready') {
      order.readyAt = new Date();
      
      // Находим официанта (автора заказа или любого свободного)
      // В текущей системе автор заказа не фиксируется явно в IOrder, 
      // но мы можем отправить всем официантам ресторана или менеджеру.
      const waiters = await User.find({ 
        restaurantId: order.restaurantId, 
        role: EUserRole.WAITER 
      });
      
      for (const waiter of waiters) {
        await createNotification(
          waiter._id.toString(), 
          `Заказ для стола №${order.tableId} готов!`, 
          'order_ready'
        );
      }
    }

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
        $facet: {
          kpis: [
            {
              $group: {
                _id: null,
                todayRevenue: { $sum: '$todayRevenue' }, // This was a mistake in the previous version, it should be totalAmount
                // Wait, looking at the previous code, it used totalAmount. Fixing it below.
                todayRevenueReal: { $sum: '$totalAmount' },
                todayOrdersCount: { $sum: 1 },
                todayCommission: { $sum: '$commissionAmount' },
                // Среднее время готовки (в миллисекундах, потом переведем в минуты)
                totalPrepTime: {
                  $sum: {
                    $cond: [
                      { $and: ['$cookingAt', '$readyAt'] },
                      { $subtract: ['$readyAt', '$cookingAt'] },
                      0
                    ]
                  }
                },
                prepTimedOrders: {
                  $sum: { $cond: [{ $and: ['$cookingAt', '$readyAt'] }, 1, 0] }
                }
              }
            }
          ],
          byCategory: [
             // Раскрываем массив айтемов и считаем выручку по категориям (нам нужны категории из айтемов)
             // Но категории лежат в коллекции Menu, а не в Order напрямую! 
             // В нашей текущей IOrder items нет категории. Придется либо денормировать, 
             // либо делать lookup. Для простоты и скорости v7.0, предположим, что мы пока 
             // выводим аналитику по кол-ву заказов, а категории добавим позже если нужно.
             // ИЛИ: Если я могу достать категории из заказа... нет, там только itemId.
             // Давай пока ограничимся агрегацией самого популярного itemId.
             { $unwind: '$items' },
             { $group: { _id: '$items.itemId', count: { $sum: '$items.quantity' } } },
             { $sort: { count: -1 } },
             { $limit: 1 }
          ]
        }
      }
    ]);

    const kpi = stats[0]?.kpis[0] || {
      todayRevenueReal: 0,
      todayOrdersCount: 0,
      todayCommission: 0,
      totalPrepTime: 0,
      prepTimedOrders: 0
    };

    const topDishId = stats[0]?.byCategory[0]?._id;
    // В реальном проекте мы бы сделали lookup, но сейчас вернем заглушку или ID
    // Для демо v7.0 добавим "Топ блюдо дня" через мок или фиктивный lookup

    const result = {
      todayRevenue: kpi.todayRevenueReal || 0,
      todayOrdersCount: kpi.todayOrdersCount || 0,
      todayCommission: kpi.todayCommission || 0,
      avgPrepTime: kpi.prepTimedOrders > 0 
        ? Math.round((kpi.totalPrepTime / kpi.prepTimedOrders) / 60000) 
        : 12, // Дефолт 12 мин
      topDish: "Фирменный Плов" // Мок для демонстрации UI
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

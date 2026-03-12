import { Request, Response } from 'express';
import { Order, Commission } from '../models/model';
import mongoose from 'mongoose';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.query;

    if (!restaurantId || typeof restaurantId !== 'string') {
      return res.status(400).json({ message: 'restaurantId is required' });
    }

    const objectId = new mongoose.Types.ObjectId(restaurantId);

    // 1. Общая сумма успешных заказов
    const revenueResult = await Order.aggregate([
      { $match: { restaurantId: objectId, status: { $in: ['paid', 'ready'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalTips: { $sum: '$tips' } } }
    ]);

    // 2. Общее количество заказов
    const totalOrders = await Order.countDocuments({ restaurantId: objectId });

    // 3. Сумма комиссии (по 1 сомони за заказ)
    const commissionResult = await Commission.aggregate([
      { $match: { restaurantId: objectId } },
      { $group: { _id: null, totalCommission: { $sum: '$amount' } } }
    ]);

    res.json({
      revenue: revenueResult[0]?.totalRevenue || 0,
      tips: revenueResult[0]?.totalTips || 0,
      totalOrders,
      commission: commissionResult[0]?.totalCommission || 0
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

/**
 * Получение KPI сотрудников (Официанты и Повара)
 */
export const getStaffKPI = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.query;
    if (!restaurantId || typeof restaurantId !== 'string') {
      return res.status(400).json({ message: 'restaurantId is required' });
    }

    const objectId = new mongoose.Types.ObjectId(restaurantId);

    // 1. KPI Официантов (Выручка, средний чек, количество заказов)
    const waiterKPI = await Order.aggregate([
      { 
        $match: { 
          restaurantId: objectId, 
          status: 'paid',
          waiterId: { $exists: true }
        } 
      },
      {
        $group: {
          _id: '$waiterId',
          totalSales: { $sum: '$totalAmount' },
          ordersCount: { $sum: 1 },
          avgCheck: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'waiterInfo'
        }
      },
      { $unwind: '$waiterInfo' },
      {
        $project: {
          name: '$waiterInfo.name',
          totalSales: 1,
          ordersCount: 1,
          avgCheck: { $round: ['$avgCheck', 0] }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    // 2. KPI Поваров (Скорость приготовления, количество заказов)
    const chefKPI = await Order.aggregate([
      { 
        $match: { 
          restaurantId: objectId, 
          status: { $in: ['ready', 'paid'] },
          chefId: { $exists: true },
          cookingAt: { $exists: true },
          readyAt: { $exists: true }
        } 
      },
      {
        $group: {
          _id: '$chefId',
          ordersCount: { $sum: 1 },
          avgPrepTimeMs: { $avg: { $subtract: ['$readyAt', '$cookingAt'] } }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'chefInfo'
        }
      },
      { $unwind: '$chefInfo' },
      {
        $project: {
          name: '$chefInfo.name',
          ordersCount: 1,
          avgPrepTimeMinutes: { $round: [{ $divide: ['$avgPrepTimeMs', 60000] }, 1] }
        }
      },
      { $sort: { avgPrepTimeMinutes: 1 } }
    ]);

    res.json({ waiters: waiterKPI, chefs: chefKPI });
  } catch (error) {
    console.error('Error fetching Staff KPI:', error);
    res.status(500).json({ message: 'Server error fetching Staff KPI' });
  }
};

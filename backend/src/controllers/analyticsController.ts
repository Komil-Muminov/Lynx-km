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

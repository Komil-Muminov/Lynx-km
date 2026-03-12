import { Request, Response } from 'express';
import { Order, DailyReport } from '../models/model';
import dayjs from 'dayjs';

/**
 * Получение текущей ожидаемой выручки (Z-отчет онлайн)
 */
export const getCurrentExpected = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) return res.status(400).json({ message: 'Ресторан не определен' });

    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    const orders = await Order.find({
      restaurantId,
      status: 'paid',
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    });

    const expectedAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({ expectedAmount, ordersCount: orders.length });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при расчете ожидаемой выручки' });
  }
};

/**
 * Закрытие дня
 */
export const closeDay = async (req: Request, res: Response) => {
  try {
    const { actualAmount } = req.body;
    const restaurantId = req.user?.restaurantId;
    const cashierId = req.user?.userId;

    if (!restaurantId || !cashierId) {
      return res.status(401).json({ message: 'Недостаточно прав' });
    }

    const todayStart = dayjs().startOf('day').toDate();
    const todayEnd = dayjs().endOf('day').toDate();

    // Считаем сколько должно быть
    const orders = await Order.find({
      restaurantId,
      status: 'paid',
      updatedAt: { $gte: todayStart, $lte: todayEnd }
    });

    const expectedAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const difference = actualAmount - expectedAmount;

    const report = new DailyReport({
      restaurantId,
      date: new Date(),
      expectedAmount,
      actualAmount,
      difference,
      cashierId,
      status: 'closed'
    });

    await report.save();

    res.json({ 
      message: 'День успешно закрыт', 
      reportId: report._id,
      difference 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при закрытии дня' });
  }
};

/**
 * Получение истории отчетов
 */
export const getFinancialReports = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.user?.restaurantId;
    const reports = await DailyReport.find({ restaurantId })
      .populate('cashierId', 'name')
      .sort({ date: -1 })
      .limit(30);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении финансовых отчетов' });
  }
};

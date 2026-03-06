import { Request, Response } from 'express';
import { Menu, EUserRole } from '../models/model';

/**
 * Получение меню конкретного заведения (Публично)
 */
export const getMenu = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    let menu = await Menu.findOne({ restaurantId });
    
    if (!menu) {
      // Создаем пустое меню, если его еще нет
      menu = new Menu({ restaurantId, items: [] });
      await menu.save();
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении меню' });
  }
};

/**
 * Обновление меню (Доступно Администратору кафе или Супер-Админу)
 */
export const updateMenu = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const { items } = req.body;

    // Проверка прав (в middleware уже частично проверено)
    if (req.user?.role !== EUserRole.SUPER_ADMIN && req.user?.restaurantId !== restaurantId) {
      return res.status(403).json({ message: 'Нет доступа к управлению этим меню' });
    }

    const menu = await Menu.findOneAndUpdate(
      { restaurantId },
      { items },
      { new: true, upsert: true }
    );

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении меню' });
  }
};

/**
 * Добавление одного блюда (Утилитарно)
 */
export const addItem = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    const item = req.body;

    const menu = await Menu.findOneAndUpdate(
      { restaurantId },
      { $push: { items: item } },
      { new: true, upsert: true }
    );

    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении блюда' });
  }
};

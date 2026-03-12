import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User, EUserRole, Order } from '../models/model';

/**
 * Получение списка персонала ресторана
 */
export const getStaff = async (req: Request, res: Response) => {
  try {
    const { restaurantId } = req.params;
    
    // Безопасность: Владелец/Менеджер может видеть только свой ресторан
    if (req.user?.role !== EUserRole.SUPER_ADMIN && req.user?.restaurantId?.toString() !== restaurantId) {
      return res.status(403).json({ message: 'Нет доступа к персоналу этого заведения' });
    }

    const staff = await User.find({ 
      restaurantId, 
      role: { $in: [EUserRole.WAITER, EUserRole.CHEF, EUserRole.CASHIER, EUserRole.MANAGER, EUserRole.ADMIN] } 
    }).select('-passwordHash');

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка персонала' });
  }
};

/**
 * Добавление нового сотрудника
 */
export const addStaff = async (req: Request, res: Response) => {
  try {
    const { name, phone, password, role } = req.body;
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      return res.status(400).json({ message: 'Вы не привязаны к ресторану' });
    }

    // Проверка лимита менеджеров (только 1 на ресторан)
    if (role === EUserRole.MANAGER) {
      const existingManager = await User.findOne({ 
        restaurantId, 
        role: EUserRole.MANAGER 
      });
      if (existingManager) {
        return res.status(400).json({ message: 'В ресторане уже есть один управляющий менеджер. Делегация возможна только на одно лицо.' });
      }
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким номером уже зарегистрирован' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const staffMember = new User({
      name,
      phone,
      role,
      restaurantId,
      passwordHash
    });

    await staffMember.save();
    res.status(201).json({ message: 'Сотрудник успешно добавлен', staff: { id: staffMember._id, name: staffMember.name, role: staffMember.role } });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при добавлении сотрудника' });
  }
};

/**
 * Удаление сотрудника
 */
export const removeStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id);

    if (!staff) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Проверка прав (Владелец/Менеджер не может удалить Супер-Админа или себя)
    if (staff.role === EUserRole.ADMIN && req.user?.role !== EUserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: 'Вы не можете удалить владельца' });
    }

    if (staff.restaurantId?.toString() !== req.user?.restaurantId?.toString() && req.user?.role !== EUserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: 'Нет прав на удаление сотрудника другого ресторана' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'Сотрудник удален' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при удалении сотрудника' });
  }
};

/**
 * Редактирование сотрудника
 */
export const updateStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, password, role } = req.body;
    const restaurantId = req.user?.restaurantId;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Сотрудник не найден' });
    }

    // Безопасность
    if (staff.restaurantId?.toString() !== restaurantId?.toString() && req.user?.role !== EUserRole.SUPER_ADMIN) {
      return res.status(403).json({ message: 'Нет прав на редактирование сотрудника другого ресторана' });
    }

    // Если меняется роль на MANAGER, проверяем лимит
    if (role === EUserRole.MANAGER && staff.role !== EUserRole.MANAGER) {
      const existingManager = await User.findOne({ 
        restaurantId, 
        role: EUserRole.MANAGER 
      });
      if (existingManager) {
        return res.status(400).json({ message: 'В ресторане уже есть один управляющий менеджер.' });
      }
    }

    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (role) staff.role = role;
    if (password) {
      staff.passwordHash = await bcrypt.hash(password, 10);
    }

    await staff.save();
    res.json({ message: 'Данные сотрудника обновлены', staff: { id: staff._id, name: staff.name, role: staff.role } });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении данных сотрудника' });
  }
};

/**
 * Установка ПИН-кода для сотрудника
 */
export const setPin = async (req: Request, res: Response) => {
  try {
    const { userId, pin } = req.body;
    
    // Проверка прав (только админ/менеджер или сам юзер)
    if (req.user?.userId !== userId && req.user?.role !== EUserRole.ADMIN && req.user?.role !== EUserRole.MANAGER) {
      return res.status(403).json({ message: 'Нет прав на установку ПИН-кода' });
    }

    if (!pin || pin.length !== 4) {
      return res.status(400).json({ message: 'ПИН-код должен состоять из 4 цифр' });
    }

    const pinHash = await bcrypt.hash(pin, 10);
    await User.findByIdAndUpdate(userId, { pinHash });

    res.json({ message: 'ПИН-код успешно установлен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при установке ПИН-кода' });
  }
};

/**
 * Переключение статуса смены
 */
export const toggleShift = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    user.isOnShift = !user.isOnShift;
    await user.save();

    res.json({ isOnShift: user.isOnShift, message: user.isOnShift ? 'Вы вышли на смену' : 'Смена завершена' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при переключении смены' });
  }
};

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, EUserRole, Restaurant } from '../models/model';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_me';

// Схема валидации для регистрации
const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.nativeEnum(EUserRole),
  restaurantId: z.string().optional(),
});

// Схема валидации для логина
const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});

/**
 * Регистрация нового пользователя
 */
export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Проверка, существует ли пользователь
    const existingUser = await User.findOne({ phone: validatedData.phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким номером уже существует' });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const newUser = new User({
      name: validatedData.name,
      phone: validatedData.phone,
      role: validatedData.role,
      restaurantId: validatedData.restaurantId,
      passwordHash,
    });

    await newUser.save();

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
};

// Схема валидации для логина по ПИН
const loginPinSchema = z.object({
  phone: z.string(),
  pin: z.string().length(4),
});

/**
 * Авторизация пользователя по ПИН-коду (для персонала)
 */
export const loginPin = async (req: Request, res: Response) => {
  try {
    const { phone, pin } = loginPinSchema.parse(req.body);

    const user = await User.findOne({ phone });
    if (!user || !user.pinHash) {
      return res.status(401).json({ message: 'Неверный номер телефона или ПИН-код' });
    }

    const isMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный номер телефона или ПИН-код' });
    }

    // Автоматически ставим "На смене" при входе по ПИН
    user.isOnShift = true;
    await user.save();

    // Создание токена
    const token = jwt.sign(
      { userId: user._id, role: user.role, restaurantId: user.restaurantId, isOnShift: true },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        restaurantId: user.restaurantId,
        isOnShift: true
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: 'Ошибка сервера при входе по ПИН' });
  }
};

/**
 * Выход из системы (сброс статуса смены)
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    const user = await User.findById(userId);
    if (user) {
      user.isOnShift = false;
      await user.save();
    }

    res.json({ message: 'Выход выполнен успешно' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Ошибка сервера при выходе' });
  }
};

/**
 * Авторизация пользователя
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { phone, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Неверный номер телефона или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный номер телефона или пароль' });
    }

    // Создание токена
    const token = jwt.sign(
      { userId: user._id, role: user.role, restaurantId: user.restaurantId, isOnShift: user.isOnShift },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        restaurantId: user.restaurantId,
        isOnShift: user.isOnShift
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
};

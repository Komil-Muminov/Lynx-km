import { Request, Response } from 'express';
import { z } from 'zod';
import { Restaurant, ERestaurantType, User, EUserRole } from '../models/model';

const restaurantSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(ERestaurantType),
  address: z.string().min(5),
  ownerId: z.string(), // ID пользователя-владельца
  logoUrl: z.string().optional(),
});

/**
 * Создание нового заведения (Доступно только SuperAdmin)
 */
export const createRestaurant = async (req: Request, res: Response) => {
  try {
    const validatedData = restaurantSchema.parse(req.body);

    // Только супер-админ (Комил) может добавлять новые кафе в систему глобально
    // (Хотя в некоторых случаях это может делать сам владелец при регистрации)
    
    const newRestaurant = new Restaurant({
      name: validatedData.name,
      type: validatedData.type,
      address: validatedData.address,
      ownerId: validatedData.ownerId,
      logoUrl: validatedData.logoUrl || '',
    });

    await newRestaurant.save();

    // Обновляем пользователя, привязывая его к ресторану
    await User.findByIdAndUpdate(validatedData.ownerId, { 
      restaurantId: newRestaurant._id,
      role: EUserRole.ADMIN 
    });

    res.status(201).json(newRestaurant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Create restaurant error:', error);
    res.status(500).json({ message: 'Ошибка сервера при создании заведения' });
  }
};

/**
 * Получение инфо о заведении (Публично для гостей или для админа)
 */
export const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Заведение не найдено' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

/**
 * Обновление заведения (Доступно Админу кафе или Супер-Админу)
 */
export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Проверка прав (в middleware уже проверено, но тут доп. логика по ID)
    if (req.user?.role !== EUserRole.SUPER_ADMIN && req.user?.restaurantId !== id) {
      return res.status(403).json({ message: 'Нет доступа к редактированию этого заведения' });
    }

    const updated = await Restaurant.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении заведения' });
  }
};

/**
 * Список всех заведений (Только для Супер-Админа - Комила)
 */
export const getAllRestaurants = async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find().populate('ownerId', 'name phone');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { EUserRole } from '../models/model';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_me';

interface IUserPayload {
  userId: string;
  role: EUserRole;
  restaurantId?: string;
}

// Расширяем Request для TS
declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}

/**
 * Middleware для проверки JWT токена
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Нет авторизации, токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Токен не валиден' });
  }
};

/**
 * Middleware для проверки ролей
 */
export const authorize = (...roles: EUserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Доступ запрещен для вашей роли: ${req.user?.role || 'неизвестно'}` 
      });
    }
    next();
  };
};

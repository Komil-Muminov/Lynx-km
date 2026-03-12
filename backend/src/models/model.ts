import mongoose, { Schema, Document } from 'mongoose';

/**
 * Роли пользователей в системе
 */
export enum EUserRole {
  SUPER_ADMIN = 'super_admin', // Комил
  ADMIN = 'admin',             // Владелец кафе
  WAITER = 'waiter',           // Официант
  CHEF = 'chef',               // Повар
  CASHIER = 'cashier',         // Кассир
  SECURITY = 'security',       // Охрана
  MANAGER = 'manager'          // Менеджер (помощник админа)
}

/**
 * Типы заведений
 */
export enum ERestaurantType {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  FAST_FOOD = 'fast_food'
}

// --- Интерфейсы ---

export interface IRestaurant extends Document {
  name: string;
  type: ERestaurantType;
  logoUrl: string;
  address: string;
  ownerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  role: EUserRole;
  restaurantId?: Types.ObjectId; // null для SuperAdmin
  passwordHash: string;
  pinHash?: string; // Экранированный ПИН-код (4 цифры)
  isOnShift: boolean; // Статус смены
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuItem {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
}

export interface IMenu extends Document {
  restaurantId: mongoose.Types.ObjectId;
  items: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends Document {
  restaurantId: mongoose.Types.ObjectId;
  tableId: string;
  items: Array<{
    itemId: mongoose.Types.ObjectId;
    quantity: number;
    priceAtOrder: number;
  }>;
  totalAmount: number;
  commissionAmount: number; // Всегда 1 сомони
  discount?: number; // Скидка в процентах (0-100)
  tips?: number; // Чаевые в абсолютном значении (сомони)
  status: 'draft' | 'pending' | 'cooking' | 'ready' | 'paid' | 'cancelled';
  cookingAt?: Date; // Когда повар начал готовить
  readyAt?: Date;   // Когда заказ стал готов к выдаче
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommission extends Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

// --- Схемы Mongoose ---

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ERestaurantType), required: true },
  logoUrl: { type: String, default: '' },
  address: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(EUserRole), required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  passwordHash: { type: String, required: true },
  pinHash: { type: String },
  isOnShift: { type: Boolean, default: false }
}, { timestamps: true });

const MenuSchema = new Schema<IMenu>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  items: [{
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    category: String,
    isAvailable: { type: Boolean, default: true }
  }]
}, { timestamps: true });

const OrderSchema = new Schema<IOrder>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: String, required: true },
  items: [{
    itemId: Schema.Types.ObjectId,
    quantity: Number,
    priceAtOrder: Number
  }],
  totalAmount: { type: Number, required: true },
  commissionAmount: { type: Number, default: 1 }, // Тот самый 1 сомони
  discount: { type: Number, default: 0 },
  tips: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'cooking', 'ready', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  cookingAt: { type: Date },
  readyAt: { type: Date }
}, { timestamps: true });

const CommissionSchema = new Schema<ICommission>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  amount: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
}, { timestamps: true });

// --- Модели ---

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export const Commission = mongoose.model<ICommission>('Commission', CommissionSchema);

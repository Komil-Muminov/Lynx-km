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
  SECURITY = 'security'        // Охрана
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
}

export interface IUser extends Document {
  name: string;
  phone: string;
  role: EUserRole;
  restaurantId?: mongoose.Types.ObjectId; // null для SuperAdmin
  passwordHash: string;
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
  commissionAmount: number; // Всегда 1 дирам
  status: 'pending' | 'cooking' | 'ready' | 'paid' | 'cancelled';
  createdAt: Date;
}

export interface ICommission extends Document {
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'paid';
  createdAt: Date;
}

// --- Схемы Mongoose ---

const RestaurantSchema = new Schema<IRestaurant>({
  name: { type: String, required: true },
  type: { type: String, enum: Object.values(ERestaurantType), required: true },
  logoUrl: { type: String, default: '' },
  address: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: Object.values(EUserRole), required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
  passwordHash: { type: String, required: true }
});

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
});

const OrderSchema = new Schema<IOrder>({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: { type: String, required: true },
  items: [{
    itemId: Schema.Types.ObjectId,
    quantity: Number,
    priceAtOrder: Number
  }],
  totalAmount: { type: Number, required: true },
  commissionAmount: { type: Number, default: 1 }, // Тот самый 1 дирам
  status: { 
    type: String, 
    enum: ['pending', 'cooking', 'ready', 'paid', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

const CommissionSchema = new Schema<ICommission>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  amount: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// --- Модели ---

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export const Commission = mongoose.model<ICommission>('Commission', CommissionSchema);

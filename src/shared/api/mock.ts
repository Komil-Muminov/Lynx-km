import type { IMenu } from '@entities/Menu/index.js';

export interface IMockCall {
  _id: string;
  tableId: string;
  type: 'waiter' | 'hookah' | 'payment';
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface IMockOrder {
  _id: string;
  tableId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
}

export const MOCK_MENU: IMenu = {
  _id: 'mock-menu-1',
  restaurantId: '65b2a1c9e8d4a3b2c1f0e4d5',
  items: [
    {
      _id: 'item-1',
      name: 'Борщ классический',
      description: 'С говядиной, свежей капустой и сметаной. Подается с пампушками.',
      price: 45000,
      category: 'Супы',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop',
      isAvailable: true
    },
    {
      _id: 'item-2',
      name: 'Плов Самаркандский',
      description: 'Традиционный плов с желтой морковью и нежной бараниной.',
      price: 55000,
      category: 'Горячее',
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=2070&auto=format&fit=crop',
      isAvailable: true
    },
    {
      _id: 'item-3',
      name: 'Салат Ачи-Чучук',
      description: 'Тонко нарезанные помидоры с луком и острым перцем.',
      price: 25000,
      category: 'Салаты',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
      isAvailable: true
    },
    {
      _id: 'item-4',
      name: 'Чай зеленый с лимоном',
      description: 'Освежающий напиток с натуральным лимоном.',
      price: 15000,
      category: 'Напитки',
      imageUrl: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=2070&auto=format&fit=crop',
      isAvailable: true
    }
  ]
};

export const MOCK_CALLS: IMockCall[] = [
  {
    _id: 'call-1',
    tableId: 'Стол №5',
    type: 'waiter',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'call-2',
    tableId: 'Стол №12',
    type: 'payment',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'call-3',
    tableId: 'Стол №3',
    type: 'hookah',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

export const MOCK_ORDERS: IMockOrder[] = [
  {
    _id: 'order-1',
    tableId: 'Стол №8',
    items: [
      { name: 'Плов Самаркандский', quantity: 2, price: 55000 },
      { name: 'Чай зеленый', quantity: 1, price: 15000 }
    ],
    totalPrice: 125000,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'order-2',
    tableId: 'Стол №2',
    items: [
      { name: 'Борщ классический', quantity: 1, price: 45000 },
      { name: 'Салат Ачи-Чучук', quantity: 1, price: 25000 }
    ],
    totalPrice: 70000,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

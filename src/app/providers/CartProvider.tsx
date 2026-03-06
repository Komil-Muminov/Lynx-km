import React, { createContext, useContext, useState } from 'react';
import type { IMenuItem } from '@entities/Menu/index.js';
import type { ICartItem } from '@entities/Cart/model.js';

interface ICartContext {
  items: ICartItem[];
  addItem: (item: IMenuItem) => void;
  removeItem: (itemId: string) => void;
  totalPrice: number;
  totalCount: number;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: IProps) => {
  const [items, setItems] = useState<ICartItem[]>([]);

  const addItem = (item: IMenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem._id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.menuItem._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.menuItem._id !== itemId);
    });
  };

  const totalPrice = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, totalPrice, totalCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { useGuestSession } from './GuestSessionProvider.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import type { IMenuItem } from '@entities/Menu/index.js';
import type { ICartItem } from '@entities/Cart/model.js';

interface ICartContext {
  items: ICartItem[];
  addItem: (item: IMenuItem) => void;
  removeItem: (itemId: string) => void;
  totalPrice: number;
  totalCount: number;
  clearCart: () => void;
}

const CartContext = createContext<ICartContext | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: IProps) => {
  const [items, setItems] = useState<ICartItem[]>([]);
  const { session } = useGuestSession();
  const { trigger } = useHaptic();
  const syncTimerRef = useRef<any>(null);

  // Мутация для синхронизации корзины
  const { mutate: doSync } = useMutationQuery();

  // Эффект для дебаунс-синхронизации с сервером
  useEffect(() => {
    if (!session || items.length === 0) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(() => {
      doSync({
        url: '/api/orders/sync-cart',
        method: 'POST',
        data: {
          restaurantId: session.restaurantId,
          tableId: session.tableId,
          items: items.map(i => ({
            itemId: i.menuItem._id,
            quantity: i.quantity,
            priceAtOrder: i.menuItem.price
          })),
          totalAmount: items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0)
        }
      });
    }, 1500); // Синхронизируем через 1.5 секунды после последнего изменения

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [items, session, doSync]);

  const addItem = (item: IMenuItem) => {
    trigger('light');
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
    trigger('light');
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

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, totalPrice, totalCount, clearCart }}>
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

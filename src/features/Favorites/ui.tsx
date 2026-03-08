import React, { createContext, useContext, useState } from 'react';
import type { IFavoritesContext, TMenuItemId } from './model.js';

const FavoritesContext = createContext<IFavoritesContext | undefined>(undefined);

interface IProps {
  children: React.ReactNode;
}

/** Провайдер избранного — оборачивает приложение на уровне App */
export const FavoritesProvider = ({ children }: IProps) => {
  const [favorites, setFavorites] = useState<Set<TMenuItemId>>(new Set());

  const toggle = (id: TMenuItemId) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isFavorite = (id: TMenuItemId) => favorites.has(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggle, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

/** Хук для использования избранного в компонентах */
export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

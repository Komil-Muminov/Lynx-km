import React, { useState, useCallback, useMemo } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { useCart } from '@app/providers/index.js';
import { Menu } from '@entities/Menu/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/index.js';
import './MenuList.css';

interface IProps {
  restaurantId: string;
}

export const MenuList = ({ restaurantId }: IProps) => {
  const { items: cartItems, addItem, removeItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const { data: menu, isLoading, isError } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `/api/menu/${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  const handleAddToCart = useCallback((item: IMenuItem) => {
    addItem(item);
  }, [addItem]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);

  const categories = useMemo(() => {
    if (!menu) return ['Все'];
    return ['Все', ...Array.from(new Set(menu.items.map(i => i.category)))];
  }, [menu]);

  if (isLoading) {
    return (
      <view className="menu-list__state">
        {/* Скелетон-загрузчик */}
        {[1, 2, 3].map(i => (
          <view key={i} className="menu-list__skeleton">
            <view className="menu-list__skeleton-img" />
            <view className="menu-list__skeleton-info">
              <view className="menu-list__skeleton-line menu-list__skeleton-line--title" />
              <view className="menu-list__skeleton-line" />
              <view className="menu-list__skeleton-line menu-list__skeleton-line--short" />
            </view>
          </view>
        ))}
      </view>
    );
  }

  if (isError || !menu) {
    return (
      <view className="menu-list__state">
        <text className="menu-list__empty-icon">🍽</text>
        <text className="menu-list__message menu-list__message--error">
          Не удалось загрузить меню
        </text>
        <text className="menu-list__message-hint">Проверьте подключение к сети</text>
      </view>
    );
  }

  if (menu.items.length === 0) {
    return (
      <view className="menu-list__state">
        <text className="menu-list__empty-icon">🫙</text>
        <text className="menu-list__message">В этом заведении пока нет блюд.</text>
      </view>
    );
  }

  const filtered = selectedCategory === 'Все'
    ? menu.items
    : menu.items.filter(i => i.category === selectedCategory);

  return (
    <view className="menu-list">
      {/* Горизонтальный скролл категорий */}
      <scroll-view className="menu-list__tabs" scroll-x>
        {categories.map(cat => (
          <view
            key={cat}
            className={`menu-list__tab ${selectedCategory === cat ? 'menu-list__tab--active' : ''}`}
            bindtap={() => setSelectedCategory(cat)}
          >
            <text className="menu-list__tab-text">{cat}</text>
          </view>
        ))}
      </scroll-view>

      {/* Отфильтрованный список с мемоизированными карточками */}
      {filtered.map((item) => {
        const quantity = cartItems.find(i => i.menuItem._id === item._id)?.quantity || 0;
        return (
          <view key={item._id}>
            <Menu
              item={item}
              quantity={quantity}
              onAdd={handleAddToCart}
              onRemove={handleRemoveFromCart}
            />
          </view>
        );
      })}
    </view>
  );
};

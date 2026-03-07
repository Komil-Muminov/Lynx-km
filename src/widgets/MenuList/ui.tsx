import React, { useState } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { useCart } from '@app/providers/index.js';
import { Menu } from '@entities/Menu/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/index.js';
import './MenuList.css';

interface IProps {
  restaurantId: string;
}

export const MenuList = ({ restaurantId }: IProps) => {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const { data: menu, isLoading, isError } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `/api/menu/${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  const handleAddToCart = (item: IMenuItem) => {
    addItem(item);
  };

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

  // Уникальные категории + "Все"
  const categories = ['Все', ...Array.from(new Set(menu.items.map(i => i.category)))];
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

      {/* Отфильтрованный список */}
      {filtered.map((item) => (
        <Menu
          key={item._id}
          item={item}
          onAdd={handleAddToCart}
        />
      ))}
    </view>
  );
};

import React from 'react';
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

  // Используем относительный URL, так как BASE_URL настроен в _axios
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
        <text className="menu-list__message">Загружаем вкусное меню...</text>
      </view>
    );
  }

  if (isError || !menu) {
    return (
      <view className="menu-list__state">
        <text className="menu-list__message menu-list__message--error">
          Не удалось загрузить меню :( 
        </text>
      </view>
    );
  }

  if (menu.items.length === 0) {
    return (
      <view className="menu-list__state">
        <text className="menu-list__message">В этом заведении пока нет блюд.</text>
      </view>
    );
  }

  return (
    <view className="menu-list">
      {menu.items.map((item) => (
        <Menu 
          key={item._id} 
          item={item} 
          onAdd={handleAddToCart} 
        />
      ))}
    </view>
  );
};

import React, { memo, useCallback } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/model.js';
import './ManagerMenuList.css';

interface IManagerMenuListProps {
  restaurantId: string;
}

/**
 * Мемоизированный компонент карточки блюда списка менеджера
 */
const ManagerMenuItem = memo(({ item, onToggle }: { item: IMenuItem; onToggle: (item: IMenuItem) => void }) => {
  const isOff = !item.isAvailable;
  
  return (
    <view className="manager-menu__item">
      <view className="manager-menu__item-info">
        <text className={`manager-menu__item-name ${isOff ? 'manager-menu__item-name--disabled' : ''}`}>
          {item.name}
        </text>
        <text className="manager-menu__item-category">{item.category}</text>
      </view>
      
      <view 
        className={`manager-menu__toggle ${!isOff ? 'manager-menu__toggle--on' : ''}`}
        bindtap={() => onToggle(item)}
      >
        <view className="manager-menu__toggle-handle" />
        <text className="manager-menu__toggle-status">
          {!isOff ? 'В наличии' : 'Закончилось'}
        </text>
      </view>
    </view>
  );
});

ManagerMenuItem.displayName = 'ManagerMenuItem';

/**
 * Виджет: ManagerMenuList
 * Отвечает за: Управление стоп-листом (наличием блюд).
 * Руководитель может включать/выключать доступность блюд для заказа.
 */
export const ManagerMenuList = ({ restaurantId }: IManagerMenuListProps) => {
  const { data: menu, isLoading, refetch } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `/api/menu/${restaurantId}`,
    {},
    { useMock: true }
  );

  const toggleMutation = useMutationQuery();

  const handleToggle = useCallback((item: IMenuItem) => {
    toggleMutation.mutate({
      url: `/api/menu/${restaurantId}/items/${item._id}/availability`,
      method: 'PATCH',
      data: { isAvailable: !item.isAvailable }
    }, {
      onSuccess: () => refetch()
    });
  }, [restaurantId, toggleMutation, refetch]);

  if (isLoading) {
    return (
      <view className="manager-menu__loading">
        <text>Загрузка меню...</text>
      </view>
    );
  }

  return (
    <view className="manager-menu">
      <text className="manager-menu__title">Управление наличием</text>
      <scroll-view className="manager-menu__list" scroll-y>
        {menu?.items.map((item) => (
          <ManagerMenuItem key={item._id} item={item} onToggle={handleToggle} />
        ))}
      </scroll-view>
    </view>
  );
};

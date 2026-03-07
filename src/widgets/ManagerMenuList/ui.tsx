import React from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/model.js';
import './ManagerMenuList.css';

interface IProps {
  restaurantId: string;
}

export const ManagerMenuList = ({ restaurantId }: IProps) => {
  const { data: menu, isLoading, refetch } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `/api/menu/${restaurantId}`,
    {},
    { useMock: true }
  );

  const toggleMutation = useMutationQuery();

  const handleToggle = (item: IMenuItem) => {
    toggleMutation.mutate({
      url: `/api/menu/${restaurantId}/items/${item._id}/availability`,
      method: 'PATCH',
      data: { isAvailable: !item.isAvailable }
    }, {
      onSuccess: () => refetch()
    });
  };

  if (isLoading) return <view className="manager-menu__loading"><text>Загрузка меню...</text></view>;

  return (
    <view className="manager-menu">
      <text className="manager-menu__title">Управление наличием</text>
      <scroll-view className="manager-menu__list" scroll-y>
        {menu?.items.map((item) => (
          <view key={item._id} className="manager-menu__item">
            <view className="manager-menu__item-info">
              <text className={`manager-menu__item-name ${!item.isAvailable ? 'manager-menu__item-name--disabled' : ''}`}>
                {item.name}
              </text>
              <text className="manager-menu__item-category">{item.category}</text>
            </view>
            <view 
              className={`manager-menu__toggle ${item.isAvailable ? 'manager-menu__toggle--on' : ''}`}
              bindtap={() => handleToggle(item)}
            >
              <view className="manager-menu__toggle-handle" />
              <text className="manager-menu__toggle-status">
                {item.isAvailable ? 'В наличии' : 'Закончилось'}
              </text>
            </view>
          </view>
        ))}
      </scroll-view>
    </view>
  );
};

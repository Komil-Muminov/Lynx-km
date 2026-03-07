import React, { memo, useCallback } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/model.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import './ManagerMenuList.css';

interface IManagerMenuListProps {
  restaurantId: string;
}

const ManagerMenuItem = ({ item, onToggle }: { item: IMenuItem; onToggle: (item: IMenuItem) => void }) => {
  const isOff = !item.isAvailable;
  
  return (
    <view className="manager-menu__item">
      <image 
        className="manager-menu__item-image" 
        src={item.imageUrl} 
        mode="aspectFill" 
      />
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
};

export const ManagerMenuList = ({ restaurantId }: IManagerMenuListProps) => {
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

  if (isLoading) {
    return (
      <view className="manager-menu">
        <text className="manager-menu__title">Управление наличием</text>
        <view className="manager-menu__list">
          {[1, 2, 3, 4, 5].map((i) => (
            <view key={i} className="manager-menu__item">
              <Skeleton width={50} height={50} borderRadius={8} className="manager-menu__item-image-skeleton" />
              <view className="manager-menu__item-info">
                <Skeleton width="70%" height={20} className="manager-menu__skeleton-text" />
                <Skeleton width="40%" height={14} className="manager-menu__skeleton-subtext" />
              </view>
              <Skeleton width={80} height={32} borderRadius={20} />
            </view>
          ))}
        </view>
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

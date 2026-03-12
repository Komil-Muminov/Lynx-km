import React from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import { getEnvVar } from '@shared/config/index.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import type { IMenu } from '@entities/Menu/index.js';
import './style.css';

interface IProps {
  restaurantId: string;
}

const API_URL = getEnvVar('API_URL');

export const ChefMenuList = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptic();

  const { data: menu, isLoading } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `${API_URL}/api/menu/${restaurantId}`
  );

  const statusMutation = useMutationQuery();

  const toggleAvailability = (item: any) => {
    trigger('medium');
    const newStatus = !item.isAvailable;
    
    statusMutation.mutate(
      {
        url: `${API_URL}/api/menu/${restaurantId}/items/${item._id}/availability`,
        method: 'PATCH',
        data: { isAvailable: newStatus },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['menu', restaurantId] });
        },
      }
    );
  };

  if (isLoading) return <text className="chef-menu__loading">Загрузка меню...</text>;

  return (
    <view className="chef-menu">
      <text className="chef-menu__title">Управление Стоп-листом</text>
      <text className="chef-menu__hint">Нажмите на блюдо, чтобы выключить его из меню</text>

      <scroll-view className="chef-menu__scroll" scroll-y>
        <view className="chef-menu__list">
          {menu?.items.map((item) => (
            <view 
              key={item._id} 
              className={`chef-menu__item ${item.isAvailable ? '' : 'chef-menu__item--out'}`}
              bindtap={() => toggleAvailability(item)}
            >
              <image src={item.imageUrl} className="chef-menu__img" mode="aspectFill" />
              <view className="chef-menu__info">
                <text className="chef-menu__name">{item.name}</text>
                <text className="chef-menu__category">{item.category}</text>
              </view>
              <view className={`chef-menu__switch ${item.isAvailable ? 'chef-menu__switch--on' : 'chef-menu__switch--off'}`}>
                <text className="chef-menu__switch-text">
                  {item.isAvailable ? 'В наличии' : 'СТОП'}
                </text>
              </view>
            </view>
          ))}
        </view>
      </scroll-view>
    </view>
  );
};

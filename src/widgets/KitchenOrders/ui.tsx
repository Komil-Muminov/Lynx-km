import React, { useState } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { IOrder } from '@entities/Order/index.js';
import './KitchenOrders.css';

interface IProps {
  restaurantId: string;
}

export const KitchenOrders = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['kitchen-orders', restaurantId],
    `http://localhost:5000/api/orders/restaurant/${restaurantId}`
  );

  const statusMutation = useMutationQuery();

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    statusMutation.mutate(
      {
        url: `http://localhost:5000/api/orders/${orderId}/status`,
        method: 'PUT',
        data: { status: newStatus }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['kitchen-orders', restaurantId] });
        }
      }
    );
  };

  if (isLoading) return <text className="kitchen-orders__loading">Загрузка кухни...</text>;

  return (
    <view className="kitchen-orders">
      <text className="kitchen-orders__title">Заказы на кухне</text>
      
      <scroll-view className="kitchen-orders__scroll" scroll-y>
        {orders?.filter(o => o.status === 'pending' || o.status === 'cooking').map((order) => (
          <view key={order._id} className={`kitchen-orders__card kitchen-orders__card--${order.status}`}>
            <view className="kitchen-orders__card-header">
              <text className="kitchen-orders__table">Стол: {order.tableId}</text>
              <text className="kitchen-orders__status-label">
                {(order.status === 'pending' ? 'В очереди' : 'Готовится').toUpperCase()}
              </text>
            </view>
            
            <view className="kitchen-orders__items">
              {order.items.map((item, idx) => (
                <text key={idx} className="kitchen-orders__item-txt">
                  • {item.name} x {item.quantity}
                </text>
              ))}
            </view>
            
            <view className="kitchen-orders__actions">
              {order.status === 'pending' ? (
                <view 
                  className="kitchen-orders__btn kitchen-orders__btn--start" 
                  bindtap={() => handleUpdateStatus(order._id, 'cooking')}
                >
                  <text className="kitchen-orders__btn-txt">Начать готовить</text>
                </view>
              ) : (
                <view 
                  className="kitchen-orders__btn kitchen-orders__btn--ready" 
                  bindtap={() => handleUpdateStatus(order._id, 'ready')}
                >
                  <text className="kitchen-orders__btn-txt">Готово!</text>
                </view>
              )}
            </view>
          </view>
        ))}
        {orders?.length === 0 && <text className="kitchen-orders__empty">На кухне пока тихо...</text>}
      </scroll-view>
    </view>
  );
};

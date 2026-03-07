import React, { useState } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { IOrder } from '@entities/Order/index.js';
import './NewOrders.css';

interface IProps {
  restaurantId: string;
}

export const NewOrders = ({ restaurantId }: IProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'cooking'>('pending');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['orders', restaurantId],
    `/api/orders/active?restaurantId=${restaurantId}`,
    {},
    {
      refetchInterval: 15000,
      useMock: true
    }
  );

  const statusMutation = useMutationQuery();

  const handleStatusChange = (orderId: string, newStatus: string) => {
    statusMutation.mutate({
      url: `/api/orders/${orderId}/status`,
      method: 'PUT',
      data: { status: newStatus }
    }, {
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['orders', restaurantId] });
      }
    });
  };

  if (isLoading) return <view className="new-orders__loading"><text>Синхронизация заказов...</text></view>;

  const filteredOrders = orders?.filter(o => o.status === activeTab) || [];

  return (
    <view className="new-orders">
      <view className="new-orders__tabs">
        <view 
          className={`new-orders__tab ${activeTab === 'pending' ? 'new-orders__tab--active' : ''}`}
          bindtap={() => setActiveTab('pending')}
        >
          <text className={`new-orders__tab-txt ${activeTab === 'pending' ? 'new-orders__tab-txt--active' : ''}`}>
            Новые ({orders?.filter(o => o.status === 'pending').length || 0})
          </text>
        </view>
        <view 
          className={`new-orders__tab ${activeTab === 'cooking' ? 'new-orders__tab--active' : ''}`}
          bindtap={() => setActiveTab('cooking')}
        >
          <text className={`new-orders__tab-txt ${activeTab === 'cooking' ? 'new-orders__tab-txt--active' : ''}`}>
            В работе ({orders?.filter(o => o.status === 'cooking').length || 0})
          </text>
        </view>
      </view>

      <scroll-view className="new-orders__list" scroll-y>
        {filteredOrders.length === 0 ? (
          <view className="new-orders__empty">
            <text className="new-orders__empty-txt">Пока нет заказов в этой категории</text>
          </view>
        ) : (
          filteredOrders.map(order => (
            <view key={order._id} className="order-card">
              <view className="order-card__header">
                <text className="order-card__table">{order.tableId}</text>
                <text className="order-card__time">
                  {dayjs(order.createdAt).format('HH:mm')}
                </text>
              </view>
              
              <view className="order-card__items">
                {order.items.map((item, idx) => (
                  <view key={idx} className="order-card__item">
                    <text className="order-card__item-name">{item.name}</text>
                    <text className="order-card__item-qty">x{item.quantity}</text>
                  </view>
                ))}
              </view>

              <view className="order-card__footer">
                <text className="order-card__total">{order.totalPrice} д.</text>
                {order.status === 'pending' && (
                   <view 
                     className="order-card__btn order-card__btn--accept"
                     bindtap={() => handleStatusChange(order._id, 'cooking')}
                   >
                     <text className="order-card__btn-txt">Принять в работу</text>
                   </view>
                )}
                {order.status === 'cooking' && (
                   <view 
                     className="order-card__btn order-card__btn--deliver"
                     bindtap={() => handleStatusChange(order._id, 'delivered')}
                   >
                     <text className="order-card__btn-txt">Подано</text>
                   </view>
                )}
              </view>
            </view>
          ))
        )}
      </scroll-view>
    </view>
  );
};

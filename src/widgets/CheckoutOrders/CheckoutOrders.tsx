import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import type { IOrder } from '@entities/Order/index.js';
import { OrderCheckoutCard } from './ui/OrderCheckoutCard.js';
import './style.css';

interface IProps {
  restaurantId: string;
}

export const CheckoutOrders = ({ restaurantId }: IProps) => {
  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['checkout-orders', restaurantId],
    `/api/orders/restaurant/${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  if (isLoading) {
    return (
      <view className="checkout-orders__loading">
        <text className="checkout-orders__loading-text">Загрузка терминала...</text>
      </view>
    );
  }

  const activeOrders = orders?.filter(o => o.status !== 'paid') || [];

  return (
    <view className="checkout-orders">
      <view className="checkout-orders__stats">
        <view className="checkout-orders__stat-box">
          <text className="checkout-orders__stat-val">{activeOrders.length}</text>
          <text className="checkout-orders__stat-label">Ожидают</text>
        </view>
        <view className="checkout-orders__stat-box">
          <text className="checkout-orders__stat-val">{orders?.filter(o => o.status === 'paid').length || 0}</text>
          <text className="checkout-orders__stat-label">Закрыто</text>
        </view>
      </view>

      <scroll-view className="checkout-orders__scroll" scroll-y>
        {activeOrders.length > 0 ? (
          <view className="checkout-orders__list">
            {activeOrders.map((order) => (
              <OrderCheckoutCard 
                key={order._id} 
                order={order} 
                restaurantId={restaurantId} 
              />
            ))}
          </view>
        ) : (
          <view className="checkout-orders__empty">
            <text className="checkout-orders__empty-icon">☕</text>
            <text className="checkout-orders__empty-title">Все счета оплачены</text>
            <text className="checkout-orders__empty-sub">Новых заказов пока нет</text>
          </view>
        )}
      </scroll-view>
    </view>
  );
};

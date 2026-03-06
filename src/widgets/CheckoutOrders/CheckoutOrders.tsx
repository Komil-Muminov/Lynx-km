import React from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import './CheckoutOrders.css';

interface IOrder {
  _id: string;
  tableId: string;
  totalAmount: number;
  status: 'pending' | 'cooking' | 'ready' | 'paid';
}

interface IProps {
  restaurantId: string;
}

export const CheckoutOrders = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['checkout-orders', restaurantId],
    `http://localhost:5000/api/orders/restaurant/${restaurantId}`
  );

  const payMutation = useMutationQuery();

  const handlePayment = (orderId: string) => {
    payMutation.mutate(
      {
        url: `http://localhost:5000/api/orders/${orderId}/status`,
        method: 'PUT',
        data: { status: 'paid' }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['checkout-orders', restaurantId] });
        }
      }
    );
  };

  if (isLoading) return <text className="checkout__loading">Загрузка счетов...</text>;

  const readyOrders = orders?.filter(o => o.status === 'ready');

  return (
    <view className="checkout">
      <text className="checkout__title">Готовы к оплате</text>
      
      <scroll-view className="checkout__list" scroll-y>
        {readyOrders?.map((order) => (
          <view key={order._id} className="checkout__card">
            <view className="checkout__info">
              <text className="checkout__table">Стол: {order.tableId}</text>
              <text className="checkout__amount">{order.totalAmount} дирам</text>
            </view>
            <view className="checkout__btn" bindtap={() => handlePayment(order._id)}>
              <text className="checkout__btn-txt">Оплачено</text>
            </view>
          </view>
        ))}
        {readyOrders?.length === 0 && (
          <text className="checkout__empty">Нет активных счетов для оплаты</text>
        )}
      </scroll-view>
      
      <view className="checkout__summary">
        <text className="checkout__summary-txt">
          Всего оплачено сегодня: {orders?.filter(o => o.status === 'paid').length || 0}
        </text>
      </view>
    </view>
  );
};

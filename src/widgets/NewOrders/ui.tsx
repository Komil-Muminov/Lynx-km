import React from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import './NewOrders.css';

interface IOrder {
  _id: string;
  tableId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
}

interface IProps {
  restaurantId: string;
}

export const NewOrdersWidget = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['new-orders', restaurantId],
    `/api/orders/restaurant/${restaurantId}?status=pending`
  );

  const statusMutation = useMutationQuery();

  const handleUpdateStatus = (orderId: string, status: string) => {
    statusMutation.mutate(
      {
        url: `/api/orders/${orderId}/status`,
        method: 'PATCH',
        data: { status },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['new-orders', restaurantId] });
        }
      }
    );
  };

  if (isLoading) return <text className="new-orders__loading">Загрузка заказов...</text>;

  return (
    <view className="new-orders">
      <text className="new-orders__title">Новые заказы</text>
      {orders?.length === 0 ? (
        <text className="new-orders__empty">Новых заказов нет</text>
      ) : (
        <scroll-view className="new-orders__list" scroll-y>
          {orders?.map((order) => (
            <view key={order._id} className="new-orders__item">
              <view className="new-orders__info">
                <text className="new-orders__table">Стол: {order.tableId}</text>
                <text className="new-orders__summary">
                  {order.items.length} поз. на {order.totalPrice} сум
                </text>
                <view className="new-orders__items">
                  {order.items.map((item, idx) => (
                    <text key={idx} className="new-orders__item-name">
                      • {item.name} x{item.quantity}
                    </text>
                  ))}
                </view>
              </view>
              <view className="new-orders__actions">
                <view 
                  className="new-orders__btn new-orders__btn--accept" 
                  bindtap={() => handleUpdateStatus(order._id, 'preparing')}
                >
                  <text className="new-orders__btn-text">Принять</text>
                </view>
              </view>
            </view>
          ))}
        </scroll-view>
      )}
    </view>
  );
};

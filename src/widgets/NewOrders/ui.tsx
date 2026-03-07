import React, { useState } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import './NewOrders.css';

interface IMockOrder {
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

type TTab = 'pending' | 'preparing';

export const NewOrdersWidget = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TTab>('pending');

  const { data: orders, isLoading } = useGetQuery<IMockOrder[]>(
    ['new-orders', restaurantId],
    `/api/orders/restaurant/${restaurantId}?status=pending`,
    {},
    { refetchInterval: 15000 } // Автообновление каждые 15 сек
  );

  const statusMutation = useMutationQuery();

  const handleUpdateStatus = (orderId: string, status: string) => {
    statusMutation.mutate(
      { url: `/api/orders/${orderId}/status`, method: 'PATCH', data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['new-orders', restaurantId] });
        }
      }
    );
  };

  if (isLoading) return <text className="new-orders__loading">Загрузка заказов...</text>;

  const pendingOrders = orders?.filter(o => o.status === 'pending') ?? [];
  const preparingOrders = orders?.filter(o => o.status === 'preparing') ?? [];
  const displayed = activeTab === 'pending' ? pendingOrders : preparingOrders;

  return (
    <view className="new-orders">
      {/* Заголовок с вкладками */}
      <view className="new-orders__header">
        <view
          className={`new-orders__tab ${activeTab === 'pending' ? 'new-orders__tab--active' : ''}`}
          bindtap={() => setActiveTab('pending')}
        >
          <text className="new-orders__tab-text">
            Новые {pendingOrders.length > 0 ? `(${pendingOrders.length})` : ''}
          </text>
        </view>
        <view
          className={`new-orders__tab ${activeTab === 'preparing' ? 'new-orders__tab--active' : ''}`}
          bindtap={() => setActiveTab('preparing')}
        >
          <text className="new-orders__tab-text">
            В работе {preparingOrders.length > 0 ? `(${preparingOrders.length})` : ''}
          </text>
        </view>
      </view>

      {displayed.length === 0 ? (
        <text className="new-orders__empty">
          {activeTab === 'pending' ? 'Новых заказов нет 🎉' : 'В работе пусто'}
        </text>
      ) : (
        <scroll-view className="new-orders__list" scroll-y>
          {displayed.map((order) => (
            <view key={order._id} className="new-orders__item">
              <view className="new-orders__info">
                <text className="new-orders__table">{order.tableId}</text>
                <text className="new-orders__summary">
                  {order.items.length} поз. · {order.totalPrice} дирам
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
                {activeTab === 'pending' && (
                  <view
                    className="new-orders__btn new-orders__btn--accept"
                    bindtap={() => handleUpdateStatus(order._id, 'preparing')}
                  >
                    <text className="new-orders__btn-text">Принять</text>
                  </view>
                )}
                {activeTab === 'preparing' && (
                  <view
                    className="new-orders__btn new-orders__btn--served"
                    bindtap={() => handleUpdateStatus(order._id, 'delivered')}
                  >
                    <text className="new-orders__btn-text">Подано ✓</text>
                  </view>
                )}
              </view>
            </view>
          ))}
        </scroll-view>
      )}
    </view>
  );
};

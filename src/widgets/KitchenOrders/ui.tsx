import React from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import { getEnvVar } from '@shared/config/index.js';
import dayjs from 'dayjs';
import { useHaptic } from '@shared/lib/hooks/index.js';
import { EmptyState } from '@shared/ui/EmptyState/index.js';
import { KitchenOrdersSkeleton } from './ui/index.js';
import type { IOrder } from '@entities/Order/index.js';
import './KitchenOrders.css';

interface IProps {
  restaurantId: string;
}

// Статусы, которые отображаются на кухне
const ACTIVE_STATUSES = ['pending', 'cooking'] as const;

// Читабельные лейблы статусов
const STATUS_LABELS: Record<string, string> = {
  pending: 'В очереди',
  cooking: 'Готовится',
};

const API_URL = getEnvVar('API_URL');

export const KitchenOrders = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptic();

  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['kitchen-orders', restaurantId],
    `${API_URL}/api/orders/restaurant/${restaurantId}`
  );

  const statusMutation = useMutationQuery();

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    trigger('medium');
    statusMutation.mutate(
      {
        url: `${API_URL}/api/orders/${orderId}/status`,
        method: 'PUT',
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['kitchen-orders', restaurantId] });
        },
      }
    );
  };

  if (isLoading) return <KitchenOrdersSkeleton />;

  // Фильтруем только активные заказы (pending / cooking)
  const activeOrders = orders?.filter(o => ACTIVE_STATUSES.includes(o.status as typeof ACTIVE_STATUSES[number])) ?? [];

  return (
    <view className="kitchen-orders">
      <text className="kitchen-orders__title">Заказы на кухне</text>

      <scroll-view className="kitchen-orders__scroll" scroll-y>
        {activeOrders.map((order) => (
          <view key={order._id} className={`kitchen-orders__card kitchen-orders__card-${order.status}`}>
            <view className="kitchen-orders__card-header">
              <text className="kitchen-orders__table">Стол: {order.tableId}</text>
              <text className={`kitchen-orders__status-label kitchen-orders__status-label-${order.status}`}>
                {STATUS_LABELS[order.status]?.toUpperCase() ?? order.status}
              </text>
            </view>

            {/* Время поступления заказа */}
            <text className="kitchen-orders__time">
              ⏱ {dayjs(order.createdAt).format('HH:mm')}
            </text>

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
                  className="kitchen-orders__btn kitchen-orders__btn-start"
                  bindtap={() => handleUpdateStatus(order._id, 'cooking')}
                >
                  <text className="kitchen-orders__btn-txt">Начать готовить</text>
                </view>
              ) : (
                <view
                  className="kitchen-orders__btn kitchen-orders__btn-ready"
                  bindtap={() => handleUpdateStatus(order._id, 'ready')}
                >
                  <text className="kitchen-orders__btn-txt">Готово!</text>
                </view>
              )}
            </view>
          </view>
        ))}

        {/* Empty state — проверяем уже отфильтрованный массив */}
        {activeOrders.length === 0 && (
          <EmptyState
            icon="🍳"
            title="На кухне пока тихо..."
            hint="Новые заказы появятся здесь автоматически"
          />
        )}
      </scroll-view>
    </view>
  );
};


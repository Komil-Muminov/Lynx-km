import React from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import { getEnvVar } from '@shared/config/index.js';
import dayjs from 'dayjs';
import { useHaptic } from '@shared/lib/hooks/index.js';
import { EmptyState } from '@shared/ui/EmptyState/index.js';
import { KitchenOrdersSkeleton } from './ui/index.js';
import { useAudio } from '@shared/lib/hooks/index.js';
import type { IOrder } from '@entities/Order/index.js';
import './style.css';

interface IProps {
  restaurantId: string;
}

// Статусы, которые отображаются на кухне
const ACTIVE_STATUSES = ['pending', 'cooking'] as const;

// Читабельные лейблы статусов
const STATUS_LABELS: Record<string, string> = {
  pending: 'Новый заказ',
  cooking: 'В работе',
};

const API_URL = getEnvVar('API_URL');

// Пороговые значения времени (в минутах)
const TIME_THRESHOLDS = {
  WARNING: 8, // Чуть раньше подгоняем
  CRITICAL: 15
};

export const KitchenOrders = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptic();
  const { playNotification } = useAudio();

  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['kitchen-orders', restaurantId],
    `${API_URL}/api/orders/restaurant/${restaurantId}`,
    {},
    { refetchInterval: 10000 } // Опрашиваем чаще
  );

  const statusMutation = useMutationQuery();
  const [now, setNow] = React.useState(dayjs());
  const prevOrdersCount = React.useRef(0);

  // Следим за новыми заказами
  React.useEffect(() => {
    if (!orders) return;
    
    const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status as any));
    
    // Если стало больше активных заказов, чем было — играем звук
    if (activeOrders.length > prevOrdersCount.current) {
      playNotification();
      trigger('heavy');
    }
    
    prevOrdersCount.current = activeOrders.length;
  }, [orders]);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 60000); // Обновляем каждую минуту
    return () => clearInterval(timer);
  }, []);

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

  const getUrgencyClass = (createdAt: any) => {
    const minutes = now.diff(dayjs(createdAt), 'minute');
    if (minutes >= TIME_THRESHOLDS.CRITICAL) return 'kitchen-orders__card--critical';
    if (minutes >= TIME_THRESHOLDS.WARNING) return 'kitchen-orders__card--warning';
    return 'kitchen-orders__card--normal';
  };

  const getElapsedTime = (createdAt: any) => {
    const minutes = now.diff(dayjs(createdAt), 'minute');
    if (minutes < 1) return 'Только что';
    return `${minutes} мин`;
  };

  if (isLoading) return <KitchenOrdersSkeleton />;

  // Фильтруем только активные заказы (pending / cooking)
  const activeOrders = orders?.filter(o => ACTIVE_STATUSES.includes(o.status as typeof ACTIVE_STATUSES[number])) ?? [];

  return (
    <view className="kitchen-orders">
      <text className="kitchen-orders__title">Заказы на кухне</text>

      <scroll-view className="kitchen-orders__scroll" scroll-y>
        <view className="kitchen-orders__grid">
          {activeOrders.map((order) => (
            <view key={order._id} className={`kitchen-orders__card kitchen-orders__card-${order.status} ${getUrgencyClass(order.createdAt)}`}>
              <view className="kitchen-orders__accent-bar" />
              <view className="kitchen-orders__card-header">
                <view className="kitchen-orders__table-badge">
                  <text className="kitchen-orders__table">Стол {order.tableId}</text>
                </view>
                
                <view className="kitchen-orders__header-right">
                  <view className="kitchen-orders__timer-badge">
                    <text className="kitchen-orders__elapsed">{getElapsedTime(order.createdAt)}</text>
                  </view>
                  <text className={`kitchen-orders__status-label kitchen-orders__status-label-${order.status}`}>
                    {STATUS_LABELS[order.status]?.toUpperCase() ?? order.status}
                  </text>
                </view>
              </view>

              <view className="kitchen-orders__items">
                {order.items.map((item, idx) => (
                  <view key={idx} className="kitchen-orders__item-row">
                    <text className="kitchen-orders__item-txt">{item.name}</text>
                    <text className="kitchen-orders__item-qty">x{item.quantity}</text>
                  </view>
                ))}
              </view>

              <view className="kitchen-orders__actions">
                {order.status === 'pending' ? (
                  <view
                    className="kitchen-orders__btn kitchen-orders__btn-start press-effect"
                    bindtap={() => handleUpdateStatus(order._id, 'cooking')}
                  >
                    <text className="kitchen-orders__btn-txt">Начать готовить</text>
                  </view>
                ) : (
                  <view
                    className="kitchen-orders__btn kitchen-orders__btn-ready press-effect"
                    bindtap={() => handleUpdateStatus(order._id, 'ready')}
                  >
                    <text className="kitchen-orders__btn-txt">Выдано!</text>
                  </view>
                )}
              </view>
            </view>
          ))}
        </view>

        {/* Empty state — проверяем уже отфильтрованный массив */}
        {activeOrders.length === 0 && (
          <EmptyState
            icon="🔪"
            title="Кухня отдыхает"
            hint="Все заказы выданы, ждем новые чеки"
          />
        )}
      </scroll-view>
    </view>
  );
};


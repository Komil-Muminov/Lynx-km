import React, { useEffect } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import dayjs from 'dayjs';
import './style.css';

interface INotification {
  _id: string;
  message: string;
  type: 'order_ready' | 'call_waiter' | 'system';
  isRead: boolean;
  createdAt: string;
}

/**
 * Виджет: Уведомления персонала
 * Показывает алерты в реальном времени (через поллинг).
 */
export const StaffNotifications = () => {
  const { data: notifications, refetch } = useGetQuery<INotification[]>(
    ['notifications'],
    '/api/notifications',
    {},
    { refetchInterval: 5000 } // Поллинг каждые 5 сек
  );

  const markReadMutation = useMutationQuery({
    onSuccess: () => refetch()
  });

  const handleRead = (id: string) => {
    markReadMutation.mutate({
      url: `/api/notifications/${id}/read`,
      method: 'PATCH'
    });
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  if (unreadCount === 0) return null;

  return (
    <view className="staff-notifications">
      {notifications?.filter(n => !n.isRead).map((n) => (
        <view key={n._id} className={`staff-notification staff-notification--${n.type}`} bindtap={() => handleRead(n._id)}>
          <view className="staff-notification__icon">
            <text>{n.type === 'order_ready' ? '🍳' : n.type === 'call_waiter' ? '🛎️' : '📢'}</text>
          </view>
          <view className="staff-notification__content">
            <text className="staff-notification__msg">{n.message}</text>
            <text className="staff-notification__time">{dayjs(n.createdAt).format('HH:mm')}</text>
          </view>
          <view className="staff-notification__close">
            <text className="staff-notification__close-icon">✕</text>
          </view>
        </view>
      ))}
    </view>
  );
};

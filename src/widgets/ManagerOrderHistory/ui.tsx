import React, { useState } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import type { IOrder } from '@entities/Order/index.js';
import { formatPrice } from '@shared/lib/format.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { SwipeableItem } from '@shared/ui/SwipeableItem/index.js';
import dayjs from 'dayjs';
import './style.css';

interface IProps {
  restaurantId: string;
}

/**
 * Виджет: ManagerOrderHistory
 * Назначение: Отображение истории оплаченных чеков для руководителя.
 * Показывает список чеков и позволяет развернуть каждый для просмотра деталей.
 */
export const ManagerOrderHistory = ({ restaurantId }: IProps) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { data: history, isLoading } = useGetQuery<IOrder[]>(
    ['order-history', restaurantId],
    `http://localhost:5000/api/orders/history/${restaurantId}`,
    {},
    { useMock: true } // Пока бэк может не работать, оставляем мок-режим активным
  );

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <view className="order-history">
        <text className="order-history__title">Последние чеки</text>
        <view className="order-history__list">
          {[1, 2, 3].map((i) => (
            <view key={i} className="history-card">
              <view className="history-card__main">
                <view className="history-card__info">
                  <Skeleton width="100px" height="18px" borderRadius="4px" className="order-history__skeleton-label" />
                  <Skeleton width="60px" height="14px" borderRadius="4px" />
                </view>
                <Skeleton width="80px" height="24px" borderRadius="6px" />
              </view>
            </view>
          ))}
        </view>
      </view>
    );
  }

  if (!history || history.length === 0) {
    return (
      <view className="order-history order-history--empty">
        <text className="order-history__txt">Сегодня пока не было оплат.</text>
      </view>
    );
  }

  return (
    <view className="order-history">
      <view className="order-history__header">
        <text className="order-history__title">Последние чеки</text>
        <text className="order-history__count">Всего: {history.length}</text>
      </view>

      <scroll-view className="order-history__list" scroll-y>
        {history.map((order) => {
          const isExpanded = expandedOrderId === order._id;
          
          return (
            <SwipeableItem 
              key={order._id} 
              onSwipeAction={() => console.log('Отмена заказа', order._id)}
              actionText="Отменить"
              actionColor="#ff3b30"
            >
              <view className="history-card press-effect" bindtap={() => toggleExpand(order._id)}>
                <view className="history-card__main">
                  <view className="history-card__info">
                    <text className="history-card__table">Стол: {order.tableId}</text>
                    <text className="history-card__time">
                      {dayjs(order.createdAt).format('HH:mm')}
                    </text>
                  </view>
                  
                  <view className="history-card__amount-box">
                    <text className="history-card__amount">{formatPrice(order.totalPrice, true)}</text>
                    <text className={`history-card__chevron ${isExpanded ? 'history-card__chevron--up' : ''}`}>▼</text>
                  </view>
                </view>

                {/* Детализация заказа (разворачивается по клику) */}
                {isExpanded && (
                  <view className="history-card__details">
                    <view className="history-card__divider" />
                    {order.items.map((item, idx) => (
                      <view key={idx} className="history-card__item">
                        <text className="history-card__item-name">{item.name}</text>
                        <view className="history-card__item-right">
                          <text className="history-card__item-qty">x{item.quantity}</text>
                          <text className="history-card__item-price">{formatPrice(item.price * item.quantity, true)}</text>
                        </view>
                      </view>
                    ))}
                    <view className="history-card__meta">
                      <text className="history-card__meta-txt">ID: {order._id.slice(-6)}</text>
                      <text className="history-card__meta-txt">
                        Комиссия системы: {formatPrice(1, true)}
                      </text>
                    </view>
                  </view>
                )}
              </view>
            </SwipeableItem>
          );
        })}
      </scroll-view>
    </view>
  );
};

import React from 'react';
import { formatPrice } from '@shared/lib/format.js';
import './style.css';

interface IGuestOrderStatusProps {
  status: 'pending' | 'cooking' | 'ready' | 'paid';
  totalAmount: number;
}

export const GuestOrderStatus = ({ status, totalAmount }: IGuestOrderStatusProps) => {
  const STATUS_CONFIG = {
    pending: {
      icon: '📝',
      label: 'Заказ принят',
      sub: 'Ждем подтверждения кухни',
      color: '#ff9800',
      progress: 25
    },
    cooking: {
      icon: '👨‍🍳',
      label: 'Готовится',
      sub: 'Повар уже творит магию',
      color: '#2196f3',
      progress: 50
    },
    ready: {
      icon: '🍽️',
      label: 'Готово к выдаче',
      sub: 'Официант уже спешит к вам',
      color: '#4caf50',
      progress: 85
    },
    paid: {
      icon: '💖',
      label: 'Оплачено',
      sub: 'Спасибо за визит!',
      color: '#9c27b0',
      progress: 100
    }
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <view className="guest-status">
      <view className="guest-status__header">
        <text className="guest-status__icon">{config.icon}</text>
        <view className="guest-status__text">
          <text className="guest-status__label">{config.label}</text>
          <text className="guest-status__sub">{config.sub}</text>
        </view>
        <view className="guest-status__amount-badge">
          <text className="guest-status__amount-val">{formatPrice(totalAmount)}</text>
        </view>
      </view>

      <view className="guest-status__progress-bg">
        <view 
          className="guest-status__progress-bar" 
          style={{ width: `${config.progress}%`, backgroundColor: config.color }} 
        />
      </view>
    </view>
  );
};

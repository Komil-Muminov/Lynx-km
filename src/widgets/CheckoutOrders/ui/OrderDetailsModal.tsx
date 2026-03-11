import React from 'react';
import type { IOrder } from '@entities/Order/index.js';
import dayjs from 'dayjs';

interface IOrderDetailsModalProps {
  order: IOrder;
  onClose: () => void;
}

export const OrderDetailsModal = ({ order, onClose }: IOrderDetailsModalProps) => {
  return (
    <view className="order-modal-overlay" bindtap={onClose}>
      <view className="order-modal" catchtap={() => {}}>
        <view className="order-modal__header">
          <text className="order-modal__title">Детали заказа #{order._id.slice(-4)}</text>
          <view className="order-modal__close press-effect" bindtap={onClose}>
            <text className="order-modal__close-icon">✕</text>
          </view>
        </view>

        <view className="order-modal__info">
          <view className="order-modal__info-row">
             <text className="order-modal__info-label">Стол:</text>
             <text className="order-modal__info-value">{order.tableId}</text>
          </view>
          <view className="order-modal__info-row">
             <text className="order-modal__info-label">Время:</text>
             <text className="order-modal__info-value">
                {dayjs(order.createdAt).format('HH:mm')} ({dayjs(order.createdAt).format('DD.MM')})
             </text>
          </view>
          <view className="order-modal__info-row">
             <text className="order-modal__info-label">Статус:</text>
             <text className={`order-modal__status order-modal__status--${order.status}`}>
                {order.status.toUpperCase()}
             </text>
          </view>
        </view>

        <view className="order-modal__divider" />

        <scroll-view className="order-modal__items" scroll-y>
          <text className="order-modal__items-title">Состав заказа:</text>
          {order.items.map((item, idx) => (
            <view key={idx} className="order-modal__item">
              <view className="order-modal__item-main">
                <text className="order-modal__item-name">{item.name}</text>
                <text className="order-modal__item-qty">x{item.quantity}</text>
              </view>
              <text className="order-modal__item-price">{item.price * item.quantity} д.</text>
            </view>
          ))}
        </scroll-view>

        <view className="order-modal__divider" />

        <view className="order-modal__footer">
          <view className="order-modal__total-row">
             <text className="order-modal__total-label">Сумма заказа:</text>
             <text className="order-modal__total-val">{order.totalPrice} д.</text>
          </view>
          {order.status === 'paid' && (
            <view className="order-modal__paid-badge">
               <text className="order-modal__paid-text">✓ ОПЛАЧЕНО</text>
            </view>
          )}
        </view>
      </view>
    </view>
  );
};

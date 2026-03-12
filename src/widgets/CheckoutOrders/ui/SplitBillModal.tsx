import React, { useState } from 'react';
import type { IOrder } from '@entities/Order/index.js';

interface ISplitBillModalProps {
  order: IOrder;
  onClose: () => void;
}

export const SplitBillModal = ({ order, onClose }: ISplitBillModalProps) => {
  // Выбранные позиции для "текущей" доли
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleItem = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(prev => prev.filter(i => i !== idx));
    } else {
      setSelectedIndices(prev => [...prev, idx]);
    }
  };

  const currentTotal = selectedIndices.reduce((acc, idx) => {
    const item = order.items[idx];
    return acc + (item.price * item.quantity);
  }, 0);

  return (
    <view className="order-modal-overlay" bindtap={onClose}>
      <view className="order-modal order-modal--split" catchtap={() => {}}>
        <view className="order-modal__header">
          <text className="order-modal__title">Разделение чека</text>
          <view className="order-modal__close press-effect" bindtap={onClose}>
            <text className="order-modal__close-icon">✕</text>
          </view>
        </view>

        <view className="split-modal__hint">
          <text className="split-modal__hint-text">Выберите блюда, которые оплачивает гость</text>
        </view>

        <scroll-view className="order-modal__items" scroll-y>
          {order.items.map((item, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <view 
                key={idx} 
                className={`split-item ${isSelected ? 'split-item--selected' : ''}`}
                bindtap={() => toggleItem(idx)}
              >
                <view className="split-item__checkbox">
                  {isSelected && <text className="split-item__check-icon">✓</text>}
                </view>
                <view className="split-item__info">
                  <text className="split-item__name">{item.name}</text>
                  <text className="split-item__qty">x{item.quantity}</text>
                </view>
                <text className="split-item__price">{item.price * item.quantity} д.</text>
              </view>
            );
          })}
        </scroll-view>

        <view className="order-modal__footer split-modal__footer">
          <view className="split-modal__sum">
            <text className="split-modal__sum-label">Сумма доли:</text>
            <text className="split-modal__sum-value">{currentTotal} д.</text>
          </view>
          
          <view className="split-modal__actions">
            <view className="split-modal__btn split-modal__btn--secondary press-effect" bindtap={onClose}>
              <text className="split-modal__btn-text">Отмена</text>
            </view>
            <view 
              className={`split-modal__btn split-modal__btn--primary ${selectedIndices.length > 0 ? 'press-effect' : 'split-modal__btn--disabled'}`}
              bindtap={selectedIndices.length > 0 ? onClose : undefined}
            >
              <text className="split-modal__btn-text-primary">Оплатить долю</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  );
};

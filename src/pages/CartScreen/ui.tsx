import React, { memo, useCallback } from 'react';
import { useCart } from '@app/providers/index.js';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import type { IMenuItem } from '@entities/Menu/model.js';
import './CartScreen.css';

interface ICartItemProps {
  menuItem: IMenuItem;
  quantity: number;
  onAdd: (item: IMenuItem) => void;
  onRemove: (id: string) => void;
}

const CartItemCard = memo(({ menuItem, quantity, onAdd, onRemove }: ICartItemProps) => (
  <view className="cart-screen__item">
    <view className="cart-screen__item-info">
      {menuItem.imageUrl && (
        <image src={menuItem.imageUrl} className="cart-screen__img" mode="aspectFill" />
      )}
      <view className="cart-screen__item-text">
        <text className="cart-screen__item-name">{menuItem.name}</text>
        <text className="cart-screen__item-price">{menuItem.price * quantity} дирам</text>
      </view>
    </view>
    <view className="cart-screen__counter">
      <view className="cart-screen__counter-btn" bindtap={() => onRemove(menuItem._id)}>
        <text className="cart-screen__counter-icon">−</text>
      </view>
      <text className="cart-screen__counter-val">{quantity}</text>
      <view className="cart-screen__counter-btn" bindtap={() => onAdd(menuItem)}>
        <text className="cart-screen__counter-icon">+</text>
      </view>
    </view>
  </view>
));

CartItemCard.displayName = 'CartItemCard';

interface IProps {
  restaurantId: string;
  tableId: string;
  onBack: () => void;
}

export const CartScreen = ({ restaurantId, tableId, onBack }: IProps) => {
  const { items, addItem, removeItem, totalPrice, totalCount } = useCart();

  const orderMutation = useMutationQuery();

  const handleOrder = useCallback(() => {
    const orderData = {
      restaurantId,
      tableId,
      items: items.map(i => ({
        itemId: i.menuItem._id,
        name: i.menuItem.name,
        quantity: i.quantity,
        price: i.menuItem.price,
      })),
      totalPrice,
    };

    orderMutation.mutate(
      { url: '/api/orders', method: 'POST', data: orderData },
      {
        onSuccess: () => {
          alert('Заказ принят! Ожидайте.');
          onBack();
        },
        onError: () => {
          // В демо-режиме — имитируем успех
          console.log('Демо-заказ:', orderData);
          onBack();
        }
      }
    );
  }, [items, restaurantId, tableId, totalPrice, orderMutation, onBack]);

  const handleAdd = useCallback((item: IMenuItem) => {
    addItem(item);
  }, [addItem]);

  const handleRemove = useCallback((id: string) => {
    removeItem(id);
  }, [removeItem]);

  // Пустая корзина
  if (items.length === 0) {
    return (
      <view className="cart-screen">
        <view className="cart-screen__header">
          <view className="cart-screen__back" bindtap={onBack}>
            <text className="cart-screen__back-icon">← Назад</text>
          </view>
          <text className="cart-screen__title">Ваш заказ</text>
        </view>
        <view className="cart-screen__empty">
          <text className="cart-screen__empty-icon">🛒</text>
          <text className="cart-screen__empty-title">Корзина пуста</text>
          <text className="cart-screen__empty-hint">Добавьте блюда из меню, чтобы сделать заказ</text>
          <view className="cart-screen__empty-btn" bindtap={onBack}>
            <text className="cart-screen__empty-btn-text">← Перейти в меню</text>
          </view>
        </view>
      </view>
    );
  }

  return (
    <view className="cart-screen">
      {/* Шапка */}
      <view className="cart-screen__header">
        <view className="cart-screen__back" bindtap={onBack}>
          <text className="cart-screen__back-icon">← Назад</text>
        </view>
        <text className="cart-screen__title">Ваш заказ</text>
        <text className="cart-screen__count">{totalCount} позиции</text>
      </view>

      {/* Список товаров */}
      <scroll-view className="cart-screen__list" scroll-y>
        {items.map(({ menuItem, quantity }) => (
          <CartItemCard 
            key={menuItem._id} 
            menuItem={menuItem} 
            quantity={quantity} 
            onAdd={handleAdd} 
            onRemove={handleRemove} 
          />
        ))}
      </scroll-view>

      {/* Итог и кнопка */}
      <view className="cart-screen__footer">
        <view className="cart-screen__total">
          <text className="cart-screen__total-label">Итого:</text>
          <text className="cart-screen__total-price">{totalPrice} дирам</text>
        </view>
        <view
          className={`cart-screen__order-btn ${orderMutation.isPending ? 'cart-screen__order-btn--loading' : ''}`}
          bindtap={handleOrder}
        >
          <text className="cart-screen__order-text">
            {orderMutation.isPending ? 'Отправляем...' : '🍽 Оформить заказ'}
          </text>
        </view>
      </view>
    </view>
  );
};

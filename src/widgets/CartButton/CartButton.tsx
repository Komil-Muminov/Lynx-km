import React from 'react';
import { useCart } from '@app/providers/index.js';
import './CartButton.css';

export const CartButton = () => {
  const { totalCount, totalPrice } = useCart();

  if (totalCount === 0) return null;

  const handleCheckout = () => {
    // В будущем здесь будет навигация на экран оформления заказа
    console.log('Оформление заказа. Итого:', totalPrice);
  };

  return (
    <view className="cart-button-container">
      <view className="cart-button" bindtap={handleCheckout}>
        <view className="cart-button__info">
          <text className="cart-button__count">{totalCount} позиций</text>
          <text className="cart-button__price">{totalPrice} дирам</text>
        </view>
        <text className="cart-button__action">К оплате ➔</text>
      </view>
    </view>
  );
};

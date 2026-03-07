import React, { useState, useEffect } from 'react';
import { useCart } from '@app/providers/index.js';
import './CartButton.css';

interface IProps {
  onCartPress: () => void;
}

export const CartButton = ({ onCartPress }: IProps) => {
  const { totalCount, totalPrice } = useCart();
  const [isBumping, setIsBumping] = useState(false);

  // Срабатывает при каждом изменении количества товаров
  useEffect(() => {
    if (totalCount === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [totalCount]);

  if (totalCount === 0) return null;

  return (
    <view className="cart-button-container">
      <view
        className={`cart-button ${isBumping ? 'cart-button--bump' : ''}`}
        bindtap={onCartPress}
      >
        <view className="cart-button__info">
          <text className="cart-button__count">{totalCount} позиций</text>
          <text className="cart-button__price">{totalPrice} дирам</text>
        </view>
        <text className="cart-button__action">К заказу ➔</text>
      </view>
    </view>
  );
};

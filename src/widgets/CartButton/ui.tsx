import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@app/providers/index.js';
import { formatPrice } from '@shared/lib/format.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import './style.css';

interface IProps {
  onCartPress: () => void;
}

export const CartButton = ({ onCartPress }: IProps) => {
  const { totalCount, totalPrice } = useCart();
  const { trigger } = useHaptic();

  /** Анимация прыжка бейджа при изменении кол-ва */
  const [isBumping, setIsBumping] = useState(false);
  /** Контроль класса появления/скрытия бара */
  const [isVisible, setIsVisible] = useState(false);
  /** Предыдущее значение count для отслеживания изменений */
  const prevCount = useRef(0);

  /* Показываем / скрываем бар */
  useEffect(() => {
    setIsVisible(totalCount > 0);
  }, [totalCount > 0]);

  /* Триггерим bump только при реальном изменении числа */
  useEffect(() => {
    if (totalCount === 0 || totalCount === prevCount.current) return;
    prevCount.current = totalCount;
    setIsBumping(true);
    const t = setTimeout(() => setIsBumping(false), 400);
    return () => clearTimeout(t);
  }, [totalCount]);

  /* Не рендерим вообще если корзина пустая */
  if (totalCount === 0) return null;

  /* Формируем подпись «N позиц...» */
  const itemsLabel = (() => {
    const n = totalCount;
    if (n === 1) return '1 позиция';
    if (n >= 2 && n <= 4) return `${n} позиции`;
    return `${n} позиций`;
  })();

  return (
    <view className={`cart-bar ${isVisible ? 'cart-bar--visible' : 'cart-bar--hidden'}`}>
      <view className="cart-bar__btn" bindtap={() => { trigger('medium'); onCartPress(); }}>

        {/* Пульсирующий зелёный индикатор */}
        <view className="cart-bar__pulse" />

        {/* Левая часть: бейдж-счётчик + подпись */}
        <view className="cart-bar__left">
          <view className={`cart-bar__badge ${isBumping ? 'cart-bar__badge--bump' : ''}`}>
            <text className="cart-bar__count">{totalCount}</text>
          </view>

          <view className="cart-bar__label">
            <text className="cart-bar__label-title">Ваша корзина</text>
            <text className="cart-bar__label-items">{itemsLabel}</text>
          </view>
        </view>

        {/* Правая часть: итоговая сумма + стрелка */}
        <view className="cart-bar__right">
          <text className="cart-bar__price">{formatPrice(totalPrice, true)}</text>
          <view className="cart-bar__arrow">
            <text className="cart-bar__arrow-icon">›</text>
          </view>
        </view>

      </view>
    </view>
  );
};

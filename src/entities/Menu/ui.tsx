import React, { useState, useEffect, memo } from 'react';
import type { IMenuItem } from './model.js';
import { formatPrice } from '@shared/lib/format.js';
import './Menu.css';

interface IProps {
  item: IMenuItem;
  quantity: number;
  onAdd: (item: IMenuItem) => void;
  onRemove: (itemId: string) => void;
}

export const MenuItemCard = memo(({ item, quantity, onAdd, onRemove }: IProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item);
    setIsAdded(true);
  };

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  return (
    <view className="menu-card">
      {item.imageUrl && (
        <image src={item.imageUrl} className="menu-card__image" mode="aspectFill" />
      )}
      <view className="menu-card__info">
        <text className="menu-card__name">{item.name}</text>
        <text className="menu-card__desc">{item.description}</text>

        <view className="menu-card__bottom">
          <text className="menu-card__price">{formatPrice(item.price)}</text>

          {item.isAvailable ? (
            quantity > 0 ? (
              /* Счётчик — если уже добавлено */
              <view className="menu-card__qty">
                <view className="menu-card__qty-btn press-effect" bindtap={() => onRemove(item._id)}>
                  <text className="menu-card__qty-icon">−</text>
                </view>
                <text className="menu-card__qty-val">{quantity}</text>
                <view className="menu-card__qty-btn press-effect" bindtap={handleAdd}>
                  <text className="menu-card__qty-icon">+</text>
                </view>
              </view>
            ) : (
              /* Кнопка добавить — если ещё нет в корзине */
              <view
                className={`menu-card__add-btn press-effect ${isAdded ? 'menu-card__add-btn--success' : ''}`}
                bindtap={handleAdd}
              >
                <text className="menu-card__add-text">
                  {isAdded ? '✅ Добавлено' : '+ В корзину'}
                </text>
              </view>
            )
          ) : (
            <text className="menu-card__unavailable">Нет в наличии</text>
          )}
        </view>
      </view>
    </view>
  );
});

// Задаем displayName для отладки
MenuItemCard.displayName = 'MenuItemCard';

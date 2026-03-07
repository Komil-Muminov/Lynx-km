import React, { useState, useEffect } from 'react';
import type { IMenuItem } from './model.js';
import { useCart } from '@app/providers/index.js';
import './Menu.css';

interface IProps {
  item: IMenuItem;
  onAdd: (item: IMenuItem) => void;
}

export const MenuItemCard = ({ item, onAdd }: IProps) => {
  const { items, removeItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  // Количество данной позиции в корзине
  const cartItem = items.find(i => i.menuItem._id === item._id);
  const quantity = cartItem?.quantity ?? 0;

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
          <text className="menu-card__price">{item.price} дирам</text>

          {item.isAvailable ? (
            quantity > 0 ? (
              /* Счётчик — если уже добавлено */
              <view className="menu-card__qty">
                <view className="menu-card__qty-btn" bindtap={() => removeItem(item._id)}>
                  <text className="menu-card__qty-icon">−</text>
                </view>
                <text className="menu-card__qty-val">{quantity}</text>
                <view className="menu-card__qty-btn" bindtap={handleAdd}>
                  <text className="menu-card__qty-icon">+</text>
                </view>
              </view>
            ) : (
              /* Кнопка добавить — если ещё нет в корзине */
              <view
                className={`menu-card__add-btn ${isAdded ? 'menu-card__add-btn--success' : ''}`}
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
};

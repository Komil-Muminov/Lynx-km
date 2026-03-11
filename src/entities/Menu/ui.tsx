import React, { useState, useEffect, memo } from 'react';
import type { IMenuItem } from './model.js';
import { formatPrice } from '@shared/lib/format.js';
import { useFavorites } from '@features/Favorites/index.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import './style.css';

interface IProps {
  item: IMenuItem;
  quantity: number;
  onAdd: (item: IMenuItem) => void;
  onRemove: (itemId: string) => void;
  /** Клик по карточке — открывает Bottom Sheet с деталями */
  onPress?: (item: IMenuItem) => void;
}

export const MenuItemCard = memo(({ item, quantity, onAdd, onRemove, onPress }: IProps) => {
  const [isAdded, setIsAdded] = useState(false);
  const { toggle, isFavorite } = useFavorites();
  const { trigger } = useHaptic();

  const handleAdd = () => {
    onAdd(item);
    setIsAdded(true);
  };

  const handleFavorite = (e: any) => {
    e?.stopPropagation?.();
    trigger('selection');
    toggle(item._id);
  };

  const activeFavorite = isFavorite(item._id);

  useEffect(() => {
    if (isAdded) {
      const timer = setTimeout(() => setIsAdded(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isAdded]);

  return (
    <view className="menu-card" bindtap={() => onPress?.(item)}>
      <view className="menu-card__image-container">
        <image
          src={item.imageUrl || ''}
          className={`menu-card__image ${item.imageUrl ? '' : 'menu-card__image--hidden'}`}
          mode="aspectFill"
        />
        <view
          className={`menu-card__favorite ${activeFavorite ? 'menu-card__favorite--active' : ''}`}
          bindtap={handleFavorite}
        >
          <text className="menu-card__favorite-icon">{activeFavorite ? '❤️' : '🤍'}</text>
        </view>
      </view>
      <view className="menu-card__info">
        <text className="menu-card__name">{item.name}</text>
        <text className="menu-card__desc">{item.description}</text>

        <view className="menu-card__bottom">
          <text className="menu-card__price">{formatPrice(item.price)}</text>

          {item.isAvailable ? (
            quantity > 0 ? (
              /* Счётчик — если уже добавлено */
              <view className="menu-card__qty" bindtap={(e: any) => e?.stopPropagation?.()}>
                <view className="menu-card__qty-btn press-effect" bindtap={() => onRemove(item._id)}>
                  <text className="menu-card__qty-icon">−</text>
                </view>
                <text className="menu-card__qty-val">{quantity}</text>
                <view className="menu-card__qty-btn press-effect" bindtap={handleAdd}>
                  <text className="menu-card__qty-icon">+</text>
                </view>
              </view>
            ) : (
              /* Кнопка добавить */
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

MenuItemCard.displayName = 'MenuItemCard';

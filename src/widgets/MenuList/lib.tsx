import React, { useState, useEffect } from 'react';
import type { IMenuItem } from '@entities/Menu/index.js';
import { formatPrice } from '@shared/lib/format.js';
import './DishSheet.css';

interface IProps {
  item: IMenuItem;
  quantity: number;
  onAdd: (item: IMenuItem) => void;
}

/**
 * Контент Bottom Sheet с деталями блюда.
 * Вынесен в lib, так как это JSX-рендер без собственного состояния маршрутизации.
 */
export const renderDishSheet = ({ item, quantity, onAdd }: IProps) => {
  return <DishSheetContent item={item} quantity={quantity} onAdd={onAdd} />;
};

/** Внутренний компонент — нужен чтобы использовать хуки */
const DishSheetContent = ({ item, quantity, onAdd }: IProps) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAdd(item);
    setIsAdded(true);
  };

  useEffect(() => {
    if (!isAdded) return;
    const t = setTimeout(() => setIsAdded(false), 2000);
    return () => clearTimeout(t);
  }, [isAdded]);

  return (
    <view>
      {/* Фото блюда */}
      {item.imageUrl ? (
        <image src={item.imageUrl} className="dish-sheet__image" mode="aspectFill" />
      ) : (
        <view className="dish-sheet__image-placeholder">
          <text className="dish-sheet__placeholder-emoji">🍽</text>
        </view>
      )}

      {/* Бейдж категории */}
      <view className="dish-sheet__category">
        <text className="dish-sheet__category-text">{item.category}</text>
      </view>

      {/* Название */}
      <text className="dish-sheet__name">{item.name}</text>

      {/* Описание */}
      <text className="dish-sheet__desc">
        {item.description || 'Подробное описание блюда скоро появится.'}
      </text>

      {/* Футер: цена + кнопка */}
      <view className="dish-sheet__footer">
        <text className="dish-sheet__price">{formatPrice(item.price)}</text>

        {item.isAvailable ? (
          <view
            className={`dish-sheet__cta ${isAdded ? 'dish-sheet__cta--success' : ''}`}
            bindtap={handleAdd}
          >
            <text className="dish-sheet__cta-text">
              {isAdded
                ? `✅ В корзине (${quantity + 1})`
                : quantity > 0
                  ? `+ Ещё (${quantity} в корзине)`
                  : '+ В корзину'}
            </text>
          </view>
        ) : (
          <view className="dish-sheet__unavailable-badge">
            <text className="dish-sheet__unavailable-text">Нет в наличии</text>
          </view>
        )}
      </view>
    </view>
  );
};

import React, { useState, useCallback, useMemo } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { useCart } from '@app/providers/index.js';
import { Menu } from '@entities/Menu/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { EmptyState } from '@shared/ui/EmptyState/index.js';
import { BottomSheet } from '@shared/ui/BottomSheet/index.js';
import { renderDishSheet } from './lib.js';
import './MenuList.css';

interface IProps {
  restaurantId: string;
}

export const MenuList = ({ restaurantId }: IProps) => {
  const { items: cartItems, addItem, removeItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('Все');
  /** Блюдо, открытое в Bottom Sheet */
  const [activeDish, setActiveDish] = useState<IMenuItem | null>(null);

  const { data: menu, isLoading, isError } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `/api/menu/${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  const handleAddToCart = useCallback((item: IMenuItem) => {
    addItem(item);
  }, [addItem]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);

  const categories = useMemo(() => {
    if (!menu) return ['Все'];
    return ['Все', ...Array.from(new Set(menu.items.map(i => i.category)))];
  }, [menu]);

  /* -- Состояния загрузки и ошибок -- */

  if (isLoading) {
    return (
      <view className="menu-list__state">
        <scroll-view className="menu-list__tabs" scroll-x>
          {[1, 2, 3, 4].map(i => (
            <view key={i} className="menu-list__tab">
              <Skeleton width="60px" height="20px" borderRadius="10px" />
            </view>
          ))}
        </scroll-view>

        {[1, 2, 3].map(i => (
          <view key={i} className="menu-list__skeleton">
            <Skeleton width="100px" height="100px" borderRadius="12px" className="menu-list__skeleton-img" />
            <view className="menu-list__skeleton-info">
              <Skeleton width="80%" height="20px" className="menu-list__skeleton-line" />
              <Skeleton width="60%" height="16px" className="menu-list__skeleton-line" />
              <Skeleton width="40%" height="24px" className="menu-list__skeleton-line" />
            </view>
          </view>
        ))}
      </view>
    );
  }

  if (isError || !menu) {
    return (
      <EmptyState
        icon="📡"
        title="Не удалось загрузить меню"
        hint="Проверьте подключение к сети и попробуйте ещё раз"
        variant="error"
      />
    );
  }

  if (menu.items.length === 0) {
    return (
      <EmptyState
        icon="🍽"
        title="Меню пока пустое"
        hint="Шеф-повар уже работает над этим 👨‍🍳"
      />
    );
  }

  const filtered = selectedCategory === 'Все'
    ? menu.items
    : menu.items.filter(i => i.category === selectedCategory);

  /* Текущее количество в корзине для активного блюда */
  const activeDishQty = activeDish
    ? cartItems.find(i => i.menuItem._id === activeDish._id)?.quantity ?? 0
    : 0;

  return (
    <view className="menu-list">
      {/* Горизонтальный скролл категорий */}
      <scroll-view className="menu-list__tabs" scroll-x>
        {categories.map(cat => (
          <view
            key={cat}
            className={`menu-list__tab ${selectedCategory === cat ? 'menu-list__tab--active' : ''}`}
            bindtap={() => setSelectedCategory(cat)}
          >
            <text className="menu-list__tab-text">{cat}</text>
          </view>
        ))}
      </scroll-view>

      {/* Список блюд. Клик по карточке открывает Bottom Sheet */}
      {filtered.map((item) => {
        const quantity = cartItems.find(i => i.menuItem._id === item._id)?.quantity || 0;
        return (
          <view key={item._id}>
            <Menu
              item={item}
              quantity={quantity}
              onAdd={handleAddToCart}
              onRemove={handleRemoveFromCart}
              onPress={setActiveDish}
            />
          </view>
        );
      })}

      {/* Bottom Sheet с деталями выбранного блюда */}
      <BottomSheet
        isOpen={!!activeDish}
        onClose={() => setActiveDish(null)}
      >
        {activeDish && renderDishSheet({
          item: activeDish,
          quantity: activeDishQty,
          onAdd: handleAddToCart,
        })}
      </BottomSheet>
    </view>
  );
};

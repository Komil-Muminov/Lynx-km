import React, { useState, useCallback, useMemo } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { useCart } from '@app/providers/index.js';
import { Menu } from '@entities/Menu/index.js';
import type { IMenu, IMenuItem } from '@entities/Menu/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { EmptyState } from '@shared/ui/EmptyState/index.js';
import { BottomSheet } from '@shared/ui/BottomSheet/index.js';
import { MenuSearch } from '@features/MenuSearch/index.js';
import { useFavorites } from '@features/Favorites/index.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import { renderDishSheet } from './lib.js';
import './MenuList.css';

interface IProps {
  restaurantId: string;
}

export const MenuList = ({ restaurantId }: IProps) => {
  const { items: cartItems, addItem, removeItem } = useCart();
  const { isFavorite } = useFavorites();
  const { trigger } = useHaptic();
  
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDish, setActiveDish] = useState<IMenuItem | null>(null);

  const { data: menu, isLoading, isError, refetch } = useGetQuery<IMenu>(
    ['menu', restaurantId],
    `/api/menu/${restaurantId}`,
    {},
    { enabled: !!restaurantId, useMock: true }
  );

  const handleAddToCart = useCallback((item: IMenuItem) => {
    addItem(item);
  }, [addItem]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);



  /** Категории + "Избранное" если есть */
  const categories = useMemo(() => {
    if (!menu) return ['Все'];
    const base = ['Все', ...Array.from(new Set(menu.items.map(i => i.category)))];
    // Добавляем категорию "Любимое" если есть хоть одно избранное
    const hasFavorites = menu.items.some(i => isFavorite(i._id));
    return hasFavorites ? [...base, '❤️ Любимое'] : base;
  }, [menu, isFavorite]);

  /** Подсчет количества блюд в каждой категории для бейджей */
  const categoryCounts = useMemo(() => {
    if (!menu) return {};
    const counts: Record<string, number> = {};
    menu.items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    counts['Все'] = menu.items.length;
    counts['❤️ Любимое'] = menu.items.filter(i => isFavorite(i._id)).length;
    return counts;
  }, [menu, isFavorite]);

  /** Фильтрация: Поиск + Категория */
  const filtered = useMemo(() => {
    if (!menu) return [];
    
    return menu.items.filter(item => {
      // 1. Фильтр поиска
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Фильтр категории
      if (selectedCategory === 'Все') return true;
      if (selectedCategory === '❤️ Любимое') return isFavorite(item._id);
      return item.category === selectedCategory;
    });
  }, [menu, searchQuery, selectedCategory, isFavorite]);

  /* -- Состояния загрузки и ошибок -- */

  if (isLoading) {
    return (
      <view className="menu-list__state">
        <scroll-view className="menu-list__tabs" scroll-x>
          {[1, 2, 3, 4].map(i => (
            <view key={i} className="menu-list__tab">
              <Skeleton width="80px" height="32px" borderRadius="16px" />
            </view>
          ))}
        </scroll-view>

        {[1, 2, 3].map(i => (
          <view key={i} className="menu-list__skeleton">
            <view className="menu-list__skeleton-image-wrap">
               <Skeleton width="100px" height="100px" borderRadius="12px" />
            </view>
            <view className="menu-list__skeleton-info">
              <Skeleton width="80%" height="24px" className="menu-list__skeleton-line" />
              <Skeleton width="60%" height="16px" className="menu-list__skeleton-line" />
              <view style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: '10px' }}>
                <Skeleton width="70px" height="24px" borderRadius="12px" />
                <Skeleton width="90px" height="32px" borderRadius="16px" />
              </view>
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
        hint="Проверьте подключение к сети и потяните вниз для обновления"
        variant="error"
      />
    );
  }

  const activeDishQty = activeDish
    ? cartItems.find(i => i.menuItem._id === activeDish._id)?.quantity ?? 0
    : 0;

  return (
    <view className="menu-list">
      {/* Поиск */}
      <view className="menu-list__search-wrap">
        <MenuSearch value={searchQuery} onChange={setSearchQuery} />
      </view>

      {/* Категории с бейджами */}
      <scroll-view className="menu-list__tabs" scroll-x>
        {categories.map(cat => (
          <view
            key={cat}
            className={`menu-list__tab ${selectedCategory === cat ? 'menu-list__tab--active' : ''}`}
            bindtap={() => { trigger('selection'); setSelectedCategory(cat); }}
          >
            <text className="menu-list__tab-text">{cat}</text>
            <view className="menu-list__tab-badge">
              <text className="menu-list__tab-badge-text">{categoryCounts[cat] || 0}</text>
            </view>
          </view>
        ))}
      </scroll-view>

      {/* Список блюд */}
      <scroll-view 
        className="menu-list__scroll" 
        scroll-y 
        style={{ flex: 1 }}
      >

        {filtered.length > 0 ? (
          <view className="menu-list__items">
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
          </view>
        ) : (
          <EmptyState
            icon={searchQuery ? '🔍' : '🍽'}
            title={searchQuery ? 'Ничего не найдено' : 'В этой категории пусто'}
            hint={searchQuery ? 'Попробуйте изменить запрос' : 'Выберите другую категорию'}
          />
        )}
      </scroll-view>

      {/* Bottom Sheet детали */}
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

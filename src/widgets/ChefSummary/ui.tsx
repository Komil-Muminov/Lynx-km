import React, { useMemo } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import type { IOrder, IOrderItem } from '@entities/Order/index.js';
import './style.css';

interface IProps {
  restaurantId: string;
}

interface IAggregatedItem {
  id: string; // id блюда
  name: string;
  totalQuantity: number;
  orderIds: string[]; // в каких заказах участвует
}

/**
 * Виджет: ChefSummary
 * Назначение: Показывает повару сводку по блюдам (группировка одинаковых позиций).
 * Полезно, когда нужно сварить сразу 10 порций супа на весь зал, а не смотреть в каждый чек.
 */
export const ChefSummary = ({ restaurantId }: IProps) => {
  // Получаем активные заказы
  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['kitchen-summary', restaurantId],
    `http://localhost:5000/api/orders/restaurant/${restaurantId}`,
    {},
    { refetchInterval: 15000 }
  );

  // Группируем блюда только со статусами 'pending' и 'cooking'
  const summary = useMemo(() => {
    if (!orders) return [];

    const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'cooking');
    const itemMap = new Map<string, IAggregatedItem>();

    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = itemMap.get(item.itemId);
        
        if (existing) {
          existing.totalQuantity += item.quantity;
          if (!existing.orderIds.includes(order.tableId)) {
            existing.orderIds.push(`Стол ${order.tableId}`);
          }
        } else {
          itemMap.set(item.itemId, {
            id: item.itemId,
            name: item.name,
            totalQuantity: item.quantity,
            orderIds: [`Стол ${order.tableId}`]
          });
        }
      });
    });

    // Преобразуем Map в массив и сортируем по количеству порций
    return Array.from(itemMap.values()).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [orders]);

  if (isLoading) return <text className="chef-summary__loading">Сводим данные...</text>;

  if (summary.length === 0) {
    return (
      <view className="chef-summary__empty">
        <text className="chef-summary__empty-txt">Нет блюд в очереди на готовку 🧑‍🍳</text>
      </view>
    );
  }

  return (
    <view className="chef-summary">
      <view className="chef-summary__header">
        <text className="chef-summary__title">Сводка по позициям</text>
        <view className="chef-summary__badge">
          <text className="chef-summary__badge-txt">Всего блюд: {summary.length}</text>
        </view>
      </view>

      <scroll-view className="chef-summary__list" scroll-y>
        {summary.map((item) => (
          <view key={item.id} className="summary-card">
            <view className="summary-card__main">
              <text className="summary-card__name">{item.name}</text>
              <view className="summary-card__qty-box">
                <text className="summary-card__qty-val">{item.totalQuantity}</text>
                <text className="summary-card__qty-label">порц.</text>
              </view>
            </view>
            <view className="summary-card__footer">
              <text className="summary-card__tables-label">Ждут: </text>
              <text className="summary-card__tables">{item.orderIds.join(', ')}</text>
            </view>
          </view>
        ))}
      </scroll-view>
    </view>
  );
};

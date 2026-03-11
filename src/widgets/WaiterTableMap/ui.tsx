import React, { useMemo } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import type { IOrder } from '@entities/Order/model.js';
import type { ICallMsg } from '@entities/CallStaff/model.js';
import './style.css';

interface IProps {
  restaurantId: string;
}

type TableStatus = 'free' | 'occupied' | 'call' | 'bill';

interface ITable {
  id: string;
  name: string;
  status: TableStatus;
}

// Хардкодим список столов для демо (в реальном приложении приходил бы с бэкенда ресторана)
const RESTAURANT_TABLES = Array.from({ length: 12 }, (_, i) => `Стол №${i + 1}`);

/**
 * Виджет: WaiterTableMap
 * Отвечает за: Визуализацию зала ресторана для официанта.
 * Показывает столы в виде сетки, окрашивая их в зависимости от активных вызовов и заказов.
 */
export const WaiterTableMap = ({ restaurantId }: IProps) => {
  // Получаем активные заказы и вызовы для вычисления статусов
  const { data: calls } = useGetQuery<ICallMsg[]>(
    ['active-calls', restaurantId],
    `/api/calls/active?restaurantId=${restaurantId}`,
    {},
    { refetchInterval: 15000 }
  );

  const { data: orders } = useGetQuery<IOrder[]>(
    ['active-orders', restaurantId],
    `/api/orders/active?restaurantId=${restaurantId}`,
    {},
    { refetchInterval: 15000 }
  );

  const tables = useMemo<ITable[]>(() => {
    return RESTAURANT_TABLES.map(tableName => {
      // 1. Проверяем вызовы (самый высокий приоритет для раскраски)
      const tableCall = calls?.find(c => c.tableId === tableName && c.status === 'pending');
      
      if (tableCall) {
        if (tableCall.reason === 'bill') return { id: tableName, name: tableName, status: 'bill' };
        return { id: tableName, name: tableName, status: 'call' };
      }

      // 2. Проверяем заказы (если есть активные — стол занят)
      const tableOrder = orders?.find(o => o.tableId === tableName && o.status !== 'paid');
      if (tableOrder) {
        return { id: tableName, name: tableName, status: 'occupied' };
      }

      // 3. Иначе — свободен
      return { id: tableName, name: tableName, status: 'free' };
    });
  }, [calls, orders]);

  return (
    <view className="table-map">
      <view className="table-map__header">
        <text className="table-map__title">Карта зала</text>
        <view className="table-map__legend">
          <view className="table-map__legend-item">
            <view className="table-map__dot table-map__dot--free" />
            <text className="table-map__legend-text">Свободен</text>
          </view>
          <view className="table-map__legend-item">
            <view className="table-map__dot table-map__dot--occupied" />
            <text className="table-map__legend-text">Едят</text>
          </view>
          <view className="table-map__legend-item">
            <view className="table-map__dot table-map__dot--call" />
            <text className="table-map__legend-text">Зовут</text>
          </view>
          <view className="table-map__legend-item">
            <view className="table-map__dot table-map__dot--bill" />
            <text className="table-map__legend-text">Счет</text>
          </view>
        </view>
      </view>

      <view className="table-map__grid">
        {tables.map(table => (
          <view key={table.id} className={`table-card table-card--${table.status}`}>
            <text className={`table-card__name table-card__name--${table.status}`}>
              {table.name.replace('Стол №', '')}
            </text>
            <view className="table-card__icon-container">
              {table.status === 'call' && <text className="table-card__icon">🙋</text>}
              {table.status === 'bill' && <text className="table-card__icon">💳</text>}
              {table.status === 'occupied' && <text className="table-card__icon">🍽</text>}
              {table.status === 'free' && <text className="table-card__icon" style={{ opacity: 0.3 }}>✓</text>}
            </view>
          </view>
        ))}
      </view>
    </view>
  );
};

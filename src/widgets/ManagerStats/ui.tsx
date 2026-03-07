import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import './ManagerStats.css';

interface IStats {
  todayRevenue: number;
  todayOrdersCount: number;
  todayCommission: number;
  averageBill: number;
}

interface IManagerStatsProps {
  restaurantId: string;
}

/**
 * Виджет: ManagerStats
 * Отвечает за: Отображение ключевой статистики (KPI) заведения за текущий день.
 * Показывает выручку, количество заказов, средний чек и накопленную комиссию.
 */
export const ManagerStats = ({ restaurantId }: IManagerStatsProps) => {
  const { data, isLoading } = useGetQuery<IStats>(
    ['manager-stats', restaurantId],
    `/api/orders/stats/restaurant/${restaurantId}`,
    {},
    { 
      refetchInterval: 30000,
      useMock: true
    }
  );

  if (isLoading) {
    return (
      <view className="manager-stats__loading">
        <text>Загрузка статистики...</text>
      </view>
    );
  }

  const defaultStats: IStats = {
    todayRevenue: 0,
    todayOrdersCount: 0,
    todayCommission: 0,
    averageBill: 0
  };

  const stats = data || defaultStats;

  return (
    <view className="manager-stats">
      <view className="manager-stats__grid">
        <view className="manager-stats__card">
          <text className="manager-stats__label">Выручка за сегодня</text>
          <text className="manager-stats__value manager-stats__value-revenue">
            {stats.todayRevenue} дирам
          </text>
        </view>
        
        <view className="manager-stats__card">
          <text className="manager-stats__label">Заказов</text>
          <text className="manager-stats__value">{stats.todayOrdersCount}</text>
        </view>
        
        <view className="manager-stats__card">
          <text className="manager-stats__label">Средний чек</text>
          <text className="manager-stats__value">{stats.averageBill} дирам</text>
        </view>
        
        <view className="manager-stats__card">
          <text className="manager-stats__label">Комиссия (1с/заказ)</text>
          <text className="manager-stats__value manager-stats__value-commission">
            {stats.todayCommission} дирам
          </text>
        </view>
      </view>
    </view>
  );
};

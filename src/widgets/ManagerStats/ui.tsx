import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { formatPrice } from '@shared/lib/format.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import './style.css';

interface IStats {
  todayRevenue: number;
  todayOrdersCount: number;
  todayCommission: number;
  averageBill: number;
  avgPrepTime: number;
  topDish: string;
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
      <view className="manager-stats">
        <view className="manager-stats__grid">
          {[1, 2, 3, 4].map((i) => (
            <view key={i} className="manager-stats__card">
              <view className="manager-stats__accent-bar" />
              <Skeleton width="60%" height="16px" className="manager-stats__label-skeleton" />
              <Skeleton width="80%" height="32px" className="manager-stats__value-skeleton" />
            </view>
          ))}
        </view>
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
        <view className="manager-stats__card manager-stats__card--revenue">
          <view className="manager-stats__accent-bar" />
          <text className="manager-stats__label">Выручка за сегодня</text>
          <text className="manager-stats__value manager-stats__value-revenue">
            {formatPrice(stats.todayRevenue)}
          </text>
        </view>
        
        <view className="manager-stats__card manager-stats__card--orders">
          <view className="manager-stats__accent-bar" />
          <text className="manager-stats__label">Заказов</text>
          <text className="manager-stats__value">{stats.todayOrdersCount}</text>
        </view>
        
        <view className="manager-stats__card manager-stats__card--bill">
          <view className="manager-stats__accent-bar" />
          <text className="manager-stats__label">Средний чек</text>
          <text className="manager-stats__value">{formatPrice(stats.averageBill)}</text>
        </view>
        
        <view className="manager-stats__card manager-stats__card--commission">
          <view className="manager-stats__accent-bar" />
          <text className="manager-stats__label">Комиссия (текущая)</text>
          <text className="manager-stats__value manager-stats__value-commission">
            {formatPrice(stats.todayCommission)}
          </text>
        </view>

        <view className="manager-stats__card manager-stats__card--accent">
          <view className="manager-stats__accent-bar" />
          <text className="manager-stats__label">🏆 Топ блюдо</text>
          <text className="manager-stats__value manager-stats__value-top">{stats.topDish}</text>
        </view>

        <view className="manager-stats__card">
          <view className="manager-stats__accent-bar" />
          <text className="manager-stats__label">⏱ Ср. время готовки</text>
          <text className="manager-stats__value manager-stats__value-time">{stats.avgPrepTime} мин</text>
        </view>
      </view>
    </view>
  );
};

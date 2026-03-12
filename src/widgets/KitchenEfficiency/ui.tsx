import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { Card } from '@shared/ui/Card/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import './style.css';

interface IEfficiencyData {
  avgCookingTime: number; // в минутах
  totalReadyOrders: number;
  topChefs: Array<{ name: string; count: number }>;
}

interface IProps {
  restaurantId: string;
}

export const KitchenEfficiency = ({ restaurantId }: IProps) => {
  const { data, isLoading } = useGetQuery<IEfficiencyData>(
    ['kitchen-efficiency', restaurantId],
    `/api/analytics/kitchen?restaurantId=${restaurantId}`,
    {},
    { useMock: true }
  );

  if (isLoading) {
    return <Skeleton width="100%" height="200px" borderRadius="16px" />;
  }

  // Мок-данные если нет с бэка
  const stats = data || {
    avgCookingTime: 18,
    totalReadyOrders: 42,
    topChefs: [
      { name: 'Ахмед Д.', count: 24 },
      { name: 'Саид М.', count: 18 }
    ]
  };

  return (
    <view className="efficiency">
      <text className="efficiency__title">Эффективность кухни 🍳</text>
      
      <view className="efficiency__row">
        <Card className="efficiency__card efficiency__card--main">
          <text className="efficiency__value">{stats.avgCookingTime} мин</text>
          <text className="efficiency__label">Среднее время отдачи</text>
        </Card>
        
        <Card className="efficiency__card">
          <text className="efficiency__value">{stats.totalReadyOrders}</text>
          <text className="efficiency__label">Блюд сегодня</text>
        </Card>
      </view>

      <view className="efficiency__list">
        <text className="efficiency__list-title">Лучшие повара дня</text>
        {stats.topChefs.map((chef, idx) => (
          <view key={idx} className="efficiency__chef">
            <text className="efficiency__chef-name">{chef.name}</text>
            <view className="efficiency__chef-bar-wrap">
              <view 
                className="efficiency__chef-bar" 
                style={{ width: `${(chef.count / stats.totalReadyOrders) * 200}%` }} 
              />
              <text className="efficiency__chef-count">{chef.count} зак.</text>
            </view>
          </view>
        ))}
      </view>
    </view>
  );
};

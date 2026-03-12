import React from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import { formatPrice } from '@shared/lib/format.js';
import './style.css';

interface IWaiterKPI {
  _id: string;
  name: string;
  totalSales: number;
  ordersCount: number;
  avgCheck: number;
}

interface IKPIResponse {
  waiters: IWaiterKPI[];
}

interface IProps {
  restaurantId: string;
}

/**
 * Виджет: Эффективность персонала (KPI)
 * Показывает "Топ дня" по официантам.
 */
export const StaffEfficiency = ({ restaurantId }: IProps) => {
  const { data, isLoading } = useGetQuery<IKPIResponse>(
    ['staff-kpi', restaurantId],
    `/api/analytics/staff-kpi?restaurantId=${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  if (isLoading) {
    return (
      <view className="staff-efficiency">
        <Skeleton width="100%" height="200px" borderRadius="20px" />
      </view>
    );
  }

  return (
    <view className="staff-efficiency">
      <view className="staff-efficiency__section">
        <text className="staff-efficiency__title">🎖 Лучшие официанты</text>
        <view className="staff-efficiency__list">
          {data?.waiters.map((waiter, index) => (
            <view key={waiter._id} className="staff-efficiency__item">
              <view className="staff-efficiency__rank">
                <text className="staff-efficiency__rank-text">{index + 1}</text>
              </view>
              <view className="staff-efficiency__info">
                <text className="staff-efficiency__name">{waiter.name}</text>
                <text className="staff-efficiency__sub">
                  {waiter.ordersCount} зак. • Ср. чек {formatPrice(waiter.avgCheck)}
                </text>
              </view>
              <text className="staff-efficiency__value">{formatPrice(waiter.totalSales)}</text>
            </view>
          ))}
          {(!data?.waiters || data.waiters.length === 0) && (
            <text className="staff-efficiency__empty">Статистики по официантам пока нет</text>
          )}
        </view>
      </view>
    </view>
  );
};

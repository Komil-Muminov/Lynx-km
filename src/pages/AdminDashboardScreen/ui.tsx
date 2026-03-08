import React from 'react';
import type { IAdminDashboardScreenProps, IAnalyticsData } from './model.js';
import { useGetQuery } from '@shared/api/hooks/index.js';
import { formatPrice } from '@shared/lib/format.js';
import { Skeleton } from '@shared/ui/Skeleton/index.js';
import './style.css';

export const AdminDashboardScreen = ({ restaurantId, onBack }: IAdminDashboardScreenProps) => {
  const { data, isLoading, isError } = useGetQuery<IAnalyticsData>(
    ['analytics', restaurantId],
    `/api/analytics/dashboard?restaurantId=${restaurantId}`
  );

  return (
    <view className="dashboard">
      <view className="dashboard__header">
        <view className="dashboard__back press-effect" bindtap={onBack}>
          <text className="dashboard__back-icon">← Назад</text>
        </view>
        <text className="dashboard__title">Аналитика ресторана</text>
      </view>

      {isLoading && (
        <scroll-view className="dashboard__content" scroll-y>
          <view className="dashboard__card">
            <Skeleton width="40%" height="20px" className="dashboard__skeleton-title" />
            <Skeleton width="60%" height="40px" />
          </view>
          <view className="dashboard__card">
            <Skeleton width="50%" height="20px" className="dashboard__skeleton-title" />
            <Skeleton width="30%" height="40px" />
          </view>
          <view className="dashboard__card">
            <Skeleton width="45%" height="20px" className="dashboard__skeleton-title" />
            <Skeleton width="50%" height="40px" />
          </view>
          <view className="dashboard__card">
            <Skeleton width="35%" height="20px" className="dashboard__skeleton-title" />
            <Skeleton width="40%" height="40px" />
          </view>
        </scroll-view>
      )}

      {isError && (
        <view className="dashboard__error">
          <text className="dashboard__error-text">Не удалось загрузить аналитику. Попробуйте позже.</text>
        </view>
      )}

      {!isLoading && !isError && data && (
        <scroll-view className="dashboard__content" scroll-y>
          
          <view className="dashboard__card">
            <text className="dashboard__card-title">Общая выручка</text>
            <text className="dashboard__card-value dashboard__card-value--green">
              {formatPrice(data.revenue)}
            </text>
          </view>
          
          <view className="dashboard__card">
            <text className="dashboard__card-title">Количество заказов</text>
            <text className="dashboard__card-value">{data.totalOrders}</text>
          </view>
          
          <view className="dashboard__card">
            <text className="dashboard__card-title">Сумма комиссии системы</text>
            <text className="dashboard__card-value dashboard__card-value--green">
              {formatPrice(data.commission)}
            </text>
          </view>

          <view className="dashboard__card">
            <text className="dashboard__card-title">Сумма чаевых</text>
            <text className="dashboard__card-value">{formatPrice(data.tips)}</text>
          </view>

        </scroll-view>
      )}
    </view>
  );
};

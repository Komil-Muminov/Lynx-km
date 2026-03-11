import React, { useState } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import type { IOrder } from '@entities/Order/index.js';
import { OrderCheckoutCard } from './ui/OrderCheckoutCard.js';
import './style.css';

interface IProps {
  restaurantId: string;
}

interface IManagerStats {
  todayRevenue: number;
  todayOrdersCount: number;
  todayCommission: number;
  averageBill: number;
}

export const CheckoutOrders = ({ restaurantId }: IProps) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Активные заказы
  const { data: activeOrdersData, isLoading: isActiveLoading } = useGetQuery<IOrder[]>(
    ['checkout-orders', restaurantId],
    `/api/orders/restaurant/${restaurantId}`,
    {},
    { enabled: !!restaurantId && activeTab === 'active' }
  );

  // История заказов
  const { data: historyOrdersData, isLoading: isHistoryLoading } = useGetQuery<IOrder[]>(
    ['checkout-history', restaurantId],
    `/api/orders/history/${restaurantId}`,
    {},
    { enabled: !!restaurantId && activeTab === 'history' }
  );

  // Статистика за день
  const { data: stats } = useGetQuery<IManagerStats>(
    ['manager-stats', restaurantId],
    `/api/orders/stats/restaurant/${restaurantId}`,
    {},
    { enabled: !!restaurantId }
  );

  const isLoading = activeTab === 'active' ? isActiveLoading : isHistoryLoading;
  const rawOrders = activeTab === 'active' ? activeOrdersData : historyOrdersData;
  
  // Фильтрация по поиску
  const orders = rawOrders?.filter(o => 
    o.tableId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <view className="checkout-orders">
      {/* Виджет статистики */}
      <view className="checkout-stats">
        <view className="checkout-stats__item">
          <text className="checkout-stats__value">{stats?.todayRevenue || 0} д.</text>
          <text className="checkout-stats__label">Выручка сегодня</text>
        </view>
        <view className="checkout-stats__divider" />
        <view className="checkout-stats__item">
          <text className="checkout-stats__value">{stats?.averageBill || 0} д.</text>
          <text className="checkout-stats__label">Средний чек</text>
        </view>
      </view>

      {/* Поиск и Вкладки */}
      <view className="checkout-controls">
        <view className="checkout-search">
          <text className="checkout-search__icon">🔍</text>
          <input 
            className="checkout-search__input"
            value={searchQuery}
            onInput={(e: any) => setSearchQuery(e.detail.value)}
            placeholder="Поиск стола..."
            placeholder-style="color: #bbb;"
          />
        </view>

        <view className="checkout-tabs">
          <view 
            className={`checkout-tabs__item ${activeTab === 'active' ? 'checkout-tabs__item--active' : ''}`}
            bindtap={() => setActiveTab('active')}
          >
            <text className="checkout-tabs__text">Активные ({activeOrdersData?.length || 0})</text>
          </view>
          <view 
            className={`checkout-tabs__item ${activeTab === 'history' ? 'checkout-tabs__item--active' : ''}`}
            bindtap={() => setActiveTab('history')}
          >
            <text className="checkout-tabs__text">История</text>
          </view>
        </view>
      </view>

      <scroll-view className="checkout-orders__scroll" scroll-y>
        {isLoading ? (
          <view className="checkout-orders__loading">
            <text className="checkout-orders__loading-text">Загрузка данных...</text>
          </view>
        ) : orders.length > 0 ? (
          <view className="checkout-orders__list">
            {orders.map((order) => (
              <OrderCheckoutCard 
                key={order._id} 
                order={order} 
                restaurantId={restaurantId} 
              />
            ))}
          </view>
        ) : (
          <view className="checkout-orders__empty">
            <text className="checkout-orders__empty-icon">
              {searchQuery ? '🔎' : '☕'}
            </text>
            <text className="checkout-orders__empty-title">
              {searchQuery ? 'Ничего не найдено' : activeTab === 'active' ? 'Все счета оплачены' : 'История пуста'}
            </text>
            <text className="checkout-orders__empty-sub">
              {searchQuery ? 'Попробуйте другой номер стола' : 'Новых заказов пока нет'}
            </text>
          </view>
        )}
      </scroll-view>
    </view>
  );
};

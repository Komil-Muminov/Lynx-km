import React from 'react';
import { CheckoutOrders } from '@widgets/CheckoutOrders/index.js';
import { ErrorBoundary } from '@shared/ui/ErrorBoundary/index.js';
import './style.css';

export const CashierHome = () => {
  const restaurantId = "65b2a1c9e8d4a3b2c1f0e4d5"; // Со временем заменим на динамику

  return (
    <view className="cashier-page">
      <view className="cashier-page__header">
        <view className="cashier-page__header-left">
          <text className="cashier-page__title">Кассовый терминал</text>
          <text className="cashier-page__subtitle">Lynx Cafe • Основной зал</text>
        </view>
        <view className="cashier-page__header-right">
          <view className="cashier-page__shift-badge">
            <text className="cashier-page__shift-text">Смена открыта</text>
          </view>
          <text className="cashier-page__time">15:45</text>
        </view>
      </view>
      
      <view className="cashier-page__content">
        <ErrorBoundary title="Ошибка загрузки терминала кассира">
          <CheckoutOrders restaurantId={restaurantId} />
        </ErrorBoundary>
      </view>
      
      <view className="cashier-page__footer">
        <view className="cashier-page__status-indicator" />
        <text className="cashier-page__power">Система: Онлайн</text>
      </view>
    </view>
  );
};

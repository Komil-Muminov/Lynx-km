import React from 'react';
import { CheckoutOrders } from '@widgets/CheckoutOrders/index.js';
import { ErrorBoundary } from '@shared/ui/ErrorBoundary/index.js';
import './style.css';

export const CashierHome = () => {
  const restaurantId = "65b2a1c9e8d4a3b2c1f0e4d5";

  return (
    <view className="cashier-page">
      <view className="cashier-page__header">
        <text className="cashier-page__title">Кассовый терминал</text>
        <text className="cashier-page__subtitle">Заведение: Lynx Cafe</text>
      </view>
      
      <view className="cashier-page__content">
        <ErrorBoundary title="Ошибка загрузки терминала кассира">
          <CheckoutOrders restaurantId={restaurantId} />
        </ErrorBoundary>
      </view>
      
      <view className="cashier-page__footer">
        <text className="cashier-page__power">Касса: Онлайн</text>
      </view>
    </view>
  );
};

import React from 'react';
import { ActiveCalls } from '@widgets/ActiveCalls/index.js';
import { NewOrders } from '@widgets/NewOrders/index.js';
import { WaiterTableMap } from '@widgets/WaiterTableMap/index.js';
import './style.css';

export const WaiterHome = () => {
  // Хардкод для демонстрации, потом будем брать из AuthContext
  const restaurantId = "65b2a1c9e8d4a3b2c1f0e4d5";

  return (
    <view className="waiter-page">
      <view className="waiter-page__header">
        <text className="waiter-page__title">Рабочий день: Официант</text>
        <text className="waiter-page__subtitle">Столик заведения: Lynx Cafe</text>
      </view>
      
      <scroll-view className="waiter-page__content" scroll-y>
        <WaiterTableMap restaurantId={restaurantId} />
        <ActiveCalls restaurantId={restaurantId} />
        <NewOrders restaurantId={restaurantId} />
      </scroll-view>
      
      <view className="waiter-page__footer">
        <text className="waiter-page__footer-text">Статус: В сети</text>
      </view>
    </view>
  );
};

import React from 'react';
import { ActiveCalls } from '@widgets/ActiveCalls/index.js';
// В будущем добавим виджет списка заказов для официанта
import './WaiterHome.css';

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
        <ActiveCalls restaurantId={restaurantId} />
        
        <view className="waiter-page__section">
          <text className="waiter-page__section-title">Активные заказы</text>
          <view className="waiter-page__card-info">
            <text className="waiter-page__card-text">Здесь будет список всех заказов столов...</text>
          </view>
        </view>
      </scroll-view>
      
      <view className="waiter-page__footer">
        <text className="waiter-page__footer-text">Статус: В сети</text>
      </view>
    </view>
  );
};

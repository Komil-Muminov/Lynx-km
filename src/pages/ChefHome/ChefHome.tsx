import React from 'react';
import { KitchenOrders } from '@widgets/KitchenOrders/index.js';
import './ChefHome.css';

export const ChefHome = () => {
  const restaurantId = "65b2a1c9e8d4a3b2c1f0e4d5";

  return (
    <view className="chef-page">
      <view className="chef-page__header">
        <text className="chef-page__title">Экран Кухни (KDS)</text>
        <text className="chef-page__subtitle">Chef: Повар №1</text>
      </view>
      
      <view className="chef-page__content">
        <KitchenOrders restaurantId={restaurantId} />
      </view>
      
      <view className="chef-page__footer">
        <text className="chef-page__status">🔥 Жарка идет...</text>
      </view>
    </view>
  );
};

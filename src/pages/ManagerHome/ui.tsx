import React from 'react';
import { ManagerStats } from '@widgets/ManagerStats/index.js';
import { ManagerMenuList } from '@widgets/ManagerMenuList/index.js';
import './ManagerHome.css';

export const ManagerHome = () => {
  // Для демо используем ID из мока
  const restaurantId = '65b2a1c9e8d4a3b2c1f0e4d5';

  return (
    <view className="manager-home">
      <view className="manager-home__header">
        <text className="manager-home__title">Управление заведением</text>
        <text className="manager-home__sub">Панель руководителя</text>
      </view>
      
      <scroll-view className="manager-home__content" scroll-y>
        <ManagerStats restaurantId={restaurantId} />
        <ManagerMenuList restaurantId={restaurantId} />
      </scroll-view>
    </view>
  );
};

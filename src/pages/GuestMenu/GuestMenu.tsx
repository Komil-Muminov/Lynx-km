import React from 'react';
import { MenuList } from '@widgets/MenuList/index.js';
import { CartButton } from '@widgets/CartButton/index.js';
import { CallStaffWidget } from '@features/CallStaff/index.js';
import './GuestMenu.css';

export const GuestMenu = () => {
  return (
    <view className="guest-menu">
      <view className="guest-menu__header">
        <text className="guest-menu__title">Меню ресторана</text>
      </view>
      <scroll-view className="guest-menu__content" scroll-y>
        {/* Временно используем хардкод ID для тестирования API */}
        <MenuList restaurantId="65b2a1c9e8d4a3b2c1f0e4d5" />
      </scroll-view>
      <CallStaffWidget restaurantId="65b2a1c9e8d4a3b2c1f0e4d5" tableId="Table-1" />
      <CartButton />
    </view>
  );
};

import React, { useState } from 'react';
import { MenuList } from '@widgets/MenuList/index.js';
import { CartButton } from '@widgets/CartButton/index.js';
import { CallStaff } from '@widgets/CallStaff/index.js';
import { CartScreen } from '@pages/CartScreen/index.js';
import { useGuestSession } from '@app/providers/index.js';
import './GuestMenu.css';

export const GuestMenu = () => {
  // Берём данные стола из сессии (параметры QR или демо-режим)
  const { session } = useGuestSession();
  const [showCart, setShowCart] = useState(false);

  if (!session) return null;

  const { restaurantId, tableId, restaurantName } = session;

  if (showCart) {
    return (
      <CartScreen
        restaurantId={restaurantId}
        tableId={tableId}
        onBack={() => setShowCart(false)}
      />
    );
  }

  return (
    <view className="guest-menu">
      <view className="guest-menu__header">
        <text className="guest-menu__title">{restaurantName || 'Меню ресторана'}</text>
        <text className="guest-menu__table">{tableId}</text>
      </view>
      <view className="guest-menu__content">
        <MenuList restaurantId={restaurantId} />
      </view>
      <CallStaff restaurantId={restaurantId} tableId={tableId} />
      <CartButton onCartPress={() => setShowCart(true)} />
    </view>
  );
};

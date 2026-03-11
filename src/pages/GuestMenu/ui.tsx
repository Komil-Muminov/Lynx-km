import React, { useState } from 'react';
import { MenuList } from '@widgets/MenuList/index.js';
import { CartButton } from '@widgets/CartButton/index.js';
import { CallStaff } from '@widgets/CallStaff/index.js';
import { CartScreen } from '@pages/CartScreen/index.js';
import { useGuestSession } from '@app/providers/index.js';
import './style.css';

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

  const heroTags = [
    tableId ? `Столик ${tableId}` : 'Гостевой режим',
    'QR-меню',
    'Свежие блюда'
  ];

  return (
    <view className="guest-menu">
      <view className="guest-menu__hero">
        <view className="guest-menu__hero-grid">
          <view className="guest-menu__hero-meta">
            <text className="guest-menu__hero-label">Ресторан</text>
            <text className="guest-menu__hero-title">{restaurantName || 'Меню ресторана'}</text>
            <text className="guest-menu__hero-subtitle">Сервис за столиком #{tableId}</text>
          </view>
          {session.logoUrl && (
            <image
              src={session.logoUrl}
              className="guest-menu__hero-logo"
              mode="aspectFill"
            />
          )}
        </view>
        <view className="guest-menu__hero-tags">
          {heroTags.map(tag => (
            <view key={tag} className="guest-menu__hero-tag">
              <text className="guest-menu__hero-tag-text">{tag}</text>
            </view>
          ))}
        </view>
        <text className="guest-menu__hero-description">
          Выбирайте, добавляйте в корзину и вызывайте персонал — всё в одном интерфейсе Lynx.
        </text>
      </view>
      <view className="guest-menu__content">
        <MenuList restaurantId={restaurantId} />
      </view>
      <CallStaff restaurantId={restaurantId} tableId={tableId} />
      <CartButton onCartPress={() => setShowCart(true)} />
    </view>
  );
};

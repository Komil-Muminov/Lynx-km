import React from 'react';
import './Header.css';

/**
 * Виджет: Header
 * Отвечает за: Отображение логотипа и названия приложения.
 * Размещается в самом верху приложения.
 */
export const Header = () => {
  return (
    <view className="header">
      <view className="header__logo-container">
        <view className="header__logo-icon-wrapper">
          <text className="header__logo-sparkle header__logo-sparkle--small">✦</text>
          <text className="header__logo-sparkle header__logo-sparkle--main">✦</text>
        </view>
        <text className="header__title">PHENOMEN</text>
      </view>
    </view>
  );
};

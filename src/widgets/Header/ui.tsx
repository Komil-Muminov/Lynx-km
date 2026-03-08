import React from 'react';
import './style.css';

/**
 * Glassmorphism-шапка приложения.
 * Эффект матового стекла через backdrop-filter + полупрозрачный фон.
 */
export const Header = () => {
  return (
    <view className="header">
      {/* Фоновый blur-слой вместо ::before (Lynx не поддерживает псевдо-элементы) */}
      <view className="header__blur-layer" />
      {/* Лого + название */}
      <view className="header__logo-container">
        <view className="header__logo-icon-wrapper">
          <text className="header__logo-sparkle header__logo-sparkle--small">✦</text>
          <text className="header__logo-sparkle header__logo-sparkle--main">✦</text>
        </view>
        <text className="header__title">PHENOM</text>
      </view>

      {/* Правый слот — статус-бейдж */}
      <view className="header__right">
        <view className="header__badge">
          <text className="header__badge-text">OPEN</text>
        </view>
      </view>
    </view>
  );
};

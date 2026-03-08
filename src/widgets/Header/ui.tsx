import React from 'react';
import './style.css';

/**
 * Glassmorphism-шапка приложения.
 * Эффект матового стекла через backdrop-filter + полупрозрачный фон.
 */
interface IProps {
  role?: 'guest' | 'waiter' | 'chef' | 'cashier' | 'admin';
  isDark?: boolean;
  onToggleRole?: () => void;
  onToggleTheme?: () => void;
}

export const Header = ({ role = 'guest', isDark = false, onToggleRole, onToggleTheme }: IProps) => {
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
        <text className="header__title">PHENOMEN</text>
      </view>

      {/* Правый слот — управление (роль, тема) */}
      <view className="header__right">
        {onToggleRole && (
          <view className="header__action-btn" bindtap={onToggleRole}>
            <text className="header__action-text">
              {role === 'guest' ? '👤 Гость' : 
               role === 'waiter' ? '🍽 Оф-ант' : 
               role === 'chef' ? '👨‍🍳 Повар' : 
               role === 'cashier' ? '💳 Кассир' : '🤵 Рук-ль'}
            </text>
          </view>
        )}
        
        {onToggleTheme && (
          <view className="header__action-btn header__action-btn--icon" bindtap={onToggleTheme}>
            <text className="header__action-icon">{isDark ? '☀️' : '🌙'}</text>
          </view>
        )}
      </view>
    </view>
  );
};

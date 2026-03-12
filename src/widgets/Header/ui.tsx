import React from 'react';
import './style.css';

/**
 * Glassmorphism-шапка приложения.
 * Эффект матового стекла через backdrop-filter + полупрозрачный фон.
 */
interface IProps {
  role?: 'guest' | 'waiter' | 'chef' | 'cashier' | 'admin';
  isDark?: boolean;
  isOnShift?: boolean;
  onToggleRole?: () => void;
  onToggleTheme?: () => void;
  onToggleShift?: () => void;
}

export const Header = ({ 
  role = 'guest', 
  isDark = false, 
  isOnShift = false,
  onToggleRole, 
  onToggleTheme,
  onToggleShift
}: IProps) => {
  const isStaff = role !== 'guest' && role !== 'admin';

  return (
    <view className="header">
      {/* Фоновый blur-слой */}
      <view className="header__blur-layer" />
      
      <view className="header__logo-container">
        <view className="header__logo-icon-wrapper">
          <text className="header__logo-sparkle header__logo-sparkle--small">✦</text>
          <text className="header__logo-sparkle header__logo-sparkle--main">✦</text>
        </view>
        <text className="header__title">PHENOMEN</text>
      </view>

      <view className="header__right">
        {/* Индикатор смены для персонала */}
        {isStaff && onToggleShift && (
          <view 
            className={`header__shift-badge ${isOnShift ? 'header__shift-badge--on' : ''} press-effect`} 
            bindtap={onToggleShift}
          >
            <view className="header__shift-dot" />
            <text className="header__shift-text">{isOnShift ? 'НА СМЕНЕ' : 'ВНЕ СМЕНЫ'}</text>
          </view>
        )}

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

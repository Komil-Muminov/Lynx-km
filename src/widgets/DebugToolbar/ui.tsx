import React from 'react';
import './style.css';

interface IProps {
  role: 'guest' | 'waiter' | 'chef' | 'cashier' | 'admin';
  isDark: boolean;
  onToggleRole: () => void;
  onToggleTheme: () => void;
}

export const DebugToolbar = ({ role, isDark, onToggleRole, onToggleTheme }: IProps) => {
  return (
    <view className="debug-toolbar">
      <view className="debug-toolbar__pill">
        <view className="debug-toolbar__role-btn press-effect" bindtap={onToggleRole}>
          <text className="debug-toolbar__role">
            {role === 'guest' ? '👤 Гость' : 
             role === 'waiter' ? '🍽 Официант' : 
             role === 'chef' ? '👨‍🍳 Повар' : 
             role === 'cashier' ? '💳 Кассир' : '🤵 Админ'}
          </text>
        </view>
        <view className="debug-toolbar__divider" />
        <view className="debug-toolbar__theme-btn press-effect" bindtap={onToggleTheme}>
          <text className="debug-toolbar__icon">{isDark ? '☀️' : '🌙'}</text>
        </view>
      </view>
    </view>
  );
};

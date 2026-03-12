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
      <view className="debug-toolbar__pill" bindtap={onToggleRole}>
        <text className="debug-toolbar__role">
          {role === 'guest' ? '👤 Гость' : 
           role === 'waiter' ? '🍽 Официант' : 
           role === 'chef' ? '👨‍🍳 Повар' : 
           role === 'cashier' ? '💳 Кассир' : '🤵 Админ'}
        </text>
      </view>
      <view className="debug-toolbar__theme" bindtap={onToggleTheme}>
        <text className="debug-toolbar__icon">{isDark ? '☀️' : '🌙'}</text>
      </view>
    </view>
  );
};

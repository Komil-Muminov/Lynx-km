import React, { useState, useEffect } from 'react';
import { QueryProvider, CartProvider, GuestSessionProvider } from './providers/index.js';
import { FavoritesProvider } from '@features/Favorites/index.js';
import { GuestMenu } from '@pages/GuestMenu/index.js';
import { WaiterHome } from '@pages/WaiterHome/index.js';
import { ChefHome } from '@pages/ChefHome/index.js';
import { CashierHome } from '@pages/CashierHome/index.js';
import { ManagerHome } from '@pages/ManagerHome/index.js';
import { Header } from '@widgets/Header/index.js';
import { _axios } from '@shared/api/_axios.js';
import './App.css';
export const App = () => {
  const [role, setRole] = useState<'guest' | 'waiter' | 'chef' | 'cashier' | 'admin'>('guest');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (role !== 'guest') {
      _axios.defaults.headers.common['Authorization'] = `Bearer debug-token-${role}`;
    } else {
      delete _axios.defaults.headers.common['Authorization'];
    }
  }, [role]);

  const toggleRole = () => {
    if (role === 'guest') setRole('waiter');
    else if (role === 'waiter') setRole('chef');
    else if (role === 'chef') setRole('cashier');
    else if (role === 'cashier') setRole('admin');
    else setRole('guest');
  };

  const roleLabel = role === 'guest' 
    ? '👤 Гость' 
    : role === 'waiter' 
    ? '🍽 Оф-ант' 
    : role === 'chef' 
    ? '👨‍🍳 Повар' 
    : role === 'cashier' 
    ? '💳 Кассир' 
    : '🤵 Рук-ль';

  return (
    <QueryProvider>
      <CartProvider>
        <FavoritesProvider>
          <view className={`app-container ${isDark ? 'app-container--dark' : ''}`}>
            {/* Панель отладки: роль + тема */}
            <view className="debug-bar">
              <view className="debug-toggle" bindtap={toggleRole}>
                <text className="debug-toggle__text">{roleLabel} (сменить)</text>
              </view>
              <view className="debug-theme" bindtap={() => setIsDark(!isDark)}>
                <text className="debug-toggle__text">{isDark ? '☀️' : '🌙'}</text>
              </view>
            </view>

            {/* Глобальная шапка приложения */}
            <Header />

            {/* Глобальная контентная область для экранов (занимает всё оставшееся место) */}
            <view className="app-content">
              {role === 'guest' && (
                <GuestSessionProvider>
                  <GuestMenu />
                </GuestSessionProvider>
              )}
              {role === 'waiter' && <WaiterHome />}
              {role === 'chef' && <ChefHome />}
              {role === 'cashier' && <CashierHome />}
              {role === 'admin' && <ManagerHome />}
            </view>
          </view>
        </FavoritesProvider>
      </CartProvider>
    </QueryProvider>
  );
};

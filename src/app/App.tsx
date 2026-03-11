import React, { useState, useEffect } from 'react';
import { QueryProvider, CartProvider, GuestSessionProvider, ToastProvider } from './providers/index.js';
import { FavoritesProvider } from '@features/Favorites/index.js';
import { GuestMenu } from '@pages/GuestMenu/index.js';
import { WaiterHome } from '@pages/WaiterHome/index.js';
import { ChefHome } from '@pages/ChefHome/index.js';
import { CashierHome } from '@pages/CashierHome/index.js';
import { ManagerHome } from '@pages/ManagerHome/index.js';
import { Header } from '@widgets/Header/index.js';
import { _axios } from '@shared/api/_axios.js';
import { NetworkBanner } from '@shared/ui/NetworkBanner/index.js';
import './App.css';
export const App = () => {
  const [role, setRole] = useState<'guest' | 'waiter' | 'chef' | 'cashier' | 'admin'>('guest');
  const [isDark, setIsDark] = useState(false);
  const [isGuestReady, setIsGuestReady] = useState(false);

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
        <ToastProvider>
          <FavoritesProvider>
            <view className={`app-container ${isDark ? 'app-container--dark' : ''}`}>
            <NetworkBanner />
            {/* Глобальная шапка приложения */}
            {(role !== 'guest' || isGuestReady) && (
              <Header 
                role={role} 
                isDark={isDark} 
                onToggleRole={toggleRole} 
                onToggleTheme={() => setIsDark(!isDark)} 
              />
            )}

            {/* Контентная область — ровно один активный экран всегда */}
            <view className="app-content">
              {role === 'guest' ? (
                <GuestSessionProvider onReady={setIsGuestReady}>
                  <GuestMenu />
                </GuestSessionProvider>
              ) : role === 'waiter' ? (
                <WaiterHome />
              ) : role === 'chef' ? (
                <ChefHome />
              ) : role === 'cashier' ? (
                <CashierHome />
              ) : (
                <ManagerHome />
              )}
            </view>

            {/* Панель отладки удалена, перенесена в шапку */}
          </view>
        </FavoritesProvider>
      </ToastProvider>
    </CartProvider>
  </QueryProvider>
  );
};

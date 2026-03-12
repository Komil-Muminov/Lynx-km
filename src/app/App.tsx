import React, { useState, useEffect } from 'react';
import { QueryProvider, CartProvider, GuestSessionProvider, ToastProvider } from './providers/index.js';
import { useMutationQuery } from '@shared/api/hooks/index.js';
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
import { PinLogin } from '@pages/PinLogin/index.js';

export const App = () => {
  const [role, setRole] = useState<'guest' | 'waiter' | 'chef' | 'cashier' | 'admin'>('guest');
  const [isOnShift, setIsOnShift] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isGuestReady, setIsGuestReady] = useState(false);

  const toggleShiftMutation = useMutationQuery({
    onSuccess: (data: any) => {
      setIsOnShift(data.isOnShift);
    }
  });

  const logoutMutation = useMutationQuery({
    onSuccess: () => {
      setIsOnShift(false);
      setRole('guest');
    }
  });

  const handleToggleShift = () => {
    toggleShiftMutation.mutate({
      url: '/api/users/shift',
      method: 'PATCH'
    });
  };

  const handleLoginSuccess = (user: any) => {
    setRole(user.role);
    setIsOnShift(true); // Всегда true при входе по ПИН (согласно новой логике)
    setIsLoggingIn(false);
    _axios.defaults.headers.common['Authorization'] = `Bearer dev-token`; 
  };

  const toggleRole = () => {
    if (role === 'guest') {
      setIsLoggingIn(true);
      return;
    }
    
    // При выходе (переходе в гостя) - сбрасываем смену
    if ((role as string) !== 'guest') {
      logoutMutation.mutate({
        url: '/api/auth/logout',
        method: 'POST'
      });
      return;
    }

    // Демо-переключение
    const roles: any[] = ['guest', 'waiter', 'chef', 'cashier', 'admin'];
    const next = roles[(roles.indexOf(role) + 1) % roles.length];
    setRole(next);
  };

  return (
    <QueryProvider>
      <CartProvider>
        <ToastProvider>
          <FavoritesProvider>
            <view className={`app-container ${isDark ? 'app-container--dark' : ''}`}>
            <NetworkBanner />
            
            {isLoggingIn ? (
              <PinLogin 
                onLoginSuccess={handleLoginSuccess} 
                onBack={() => setIsLoggingIn(false)} 
              />
            ) : (
              <>
                {(role !== 'guest' || isGuestReady) && (
                  <Header 
                    role={role} 
                    isDark={isDark} 
                    isOnShift={isOnShift}
                    onToggleRole={toggleRole} 
                    onToggleTheme={() => setIsDark(!isDark)} 
                    onToggleShift={handleToggleShift}
                  />
                )}

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
              </>
            )}
          </view>
        </FavoritesProvider>
      </ToastProvider>
    </CartProvider>
  </QueryProvider>
  );
};

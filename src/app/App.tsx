import React, { useState } from 'react';
import { GuestSessionProvider } from './providers/index.js';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { GuestMenu } from '@pages/GuestMenu/index.js';
import { WaiterHome } from '@pages/WaiterHome/index.js';
import { ChefHome } from '@pages/ChefHome/index.js';
import { CashierHome } from '@pages/CashierHome/index.js';
import { ManagerHome } from '@pages/ManagerHome/index.js';
import { DebugToolbar } from '@widgets/DebugToolbar/index.js';
import { _axios } from '@shared/api/_axios.js';
import { NetworkBanner } from '@shared/ui/NetworkBanner/index.js';
import { PinLogin } from '@pages/PinLogin/index.js';
import { StaffNotifications } from '@widgets/StaffNotifications/index.js';
import './App.css';

import { useGuestSession } from './providers/index.js';

export const App = () => {
  const { session } = useGuestSession();
  const [role, setRole] = useState<'guest' | 'waiter' | 'chef' | 'cashier' | 'admin'>('guest');
  const [isOnShift, setIsOnShift] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDark, setIsDark] = useState(false);

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
    setIsOnShift(true); 
    setIsLoggingIn(false);
    _axios.defaults.headers.common['Authorization'] = `Bearer dev-token`; 
  };

  const toggleRole = () => {
    // Циклическое переключение всех ролей для тестирования UI
    const roles: Array<'guest' | 'waiter' | 'chef' | 'cashier' | 'admin'> = ['guest', 'waiter', 'chef', 'cashier', 'admin'];
    const currentIndex = roles.indexOf(role);
    const nextIndex = (currentIndex + 1) % roles.length;
    setRole(roles[nextIndex]);
  };

  return (
    <view className={`app-container ${isDark ? 'app-container--dark' : ''}`}>
      <NetworkBanner />
      {role !== 'guest' && <StaffNotifications />}
      
      <view className="app-main">
        {(role !== 'guest' || !!session) && (
          <DebugToolbar 
            role={role} 
            isDark={isDark} 
            onToggleRole={toggleRole} 
            onToggleTheme={() => setIsDark(!isDark)} 
          />
        )}
        <view className="app-content">
          {role === 'guest' ? (
            <GuestMenu />
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
      </view>
    </view>
  );
};

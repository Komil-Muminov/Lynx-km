import React, { useState } from 'react';
import { QueryProvider, CartProvider } from './providers/index.js';
import { GuestMenu } from '@pages/GuestMenu/index.js';
import { WaiterHome } from '@pages/WaiterHome/index.js';
import { ChefHome } from '@pages/ChefHome/index.js';
import { CashierHome } from '@pages/CashierHome/index.js';
import './App.css';

export const App = () => {
  // Расширяем переключатель ролей для тестов всех сценариев
  const [role, setRole] = useState<'guest' | 'waiter' | 'chef' | 'cashier'>('guest');

  const toggleRole = () => {
    if (role === 'guest') setRole('waiter');
    else if (role === 'waiter') setRole('chef');
    else if (role === 'chef') setRole('cashier');
    else setRole('guest');
  };

  return (
    <QueryProvider>
      <CartProvider>
        <view className="app-container">
          <view className="debug-toggle" bindtap={toggleRole}>
            <text className="debug-toggle__text">
              Роль: {
                role === 'guest' ? 'Гость' : 
                role === 'waiter' ? 'Официант' : 
                role === 'chef' ? 'Повар' : 'Кассир'
              } (сменить)
            </text>
          </view>

          {role === 'guest' && <GuestMenu />}
          {role === 'waiter' && <WaiterHome />}
          {role === 'chef' && <ChefHome />}
          {role === 'cashier' && <CashierHome />}
        </view>
      </CartProvider>
    </QueryProvider>
  );
};

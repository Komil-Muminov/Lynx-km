import React from 'react';
import { QueryProvider, CartProvider } from './providers/index.js';
import { GuestMenu } from '@pages/GuestMenu/index.js';

export const App = () => {
  return (
    <QueryProvider>
      <CartProvider>
        <GuestMenu />
      </CartProvider>
    </QueryProvider>
  );
};

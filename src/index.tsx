import { root } from '@lynx-js/react';
import { App } from '@app/App.js';
import { QueryProvider, CartProvider, GuestSessionProvider, ToastProvider } from '@app/providers/index.js';
import { FavoritesProvider } from '@features/Favorites/index.js';

root.render(
  <QueryProvider>
    <GuestSessionProvider>
      <CartProvider>
        <FavoritesProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </FavoritesProvider>
      </CartProvider>
    </GuestSessionProvider>
  </QueryProvider>
)

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
}

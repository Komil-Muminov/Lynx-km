import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания статуса сети (Online/Offline).
 * Возвращает true, если есть соединение, и false, если оно пропало.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // В Lynx/React Native navigator.onLine может работать иначе,
    // но для начала используем стандартный веб-подход.
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Начальное значение
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания статуса сети (Online/Offline).
 * Возвращает true, если есть соединение, и false, если оно пропало.
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // В Lynx средах для отслеживания сети нужны нативные модули.
    // Пока возвращаем true как заглушку, чтобы избежать ReferenceError.
    setIsOnline(true);
  }, []);

  return isOnline;
};

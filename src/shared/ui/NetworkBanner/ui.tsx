import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../../lib/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import './style.css';

/**
 * Компонент: NetworkBanner
 * Показывает уведомление сверху экрана при потере связи.
 * При восстановлении связи показывает зеленый баннер и делает рефетч данных.
 */
export const NetworkBanner = () => {
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (isOnline) {
      // Если связь вернулась, показываем "Снова в сети" и обновляем данные
      setShowBackOnline(true);
      queryClient.refetchQueries();
      
      const timer = setTimeout(() => {
        setShowBackOnline(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, queryClient]);

  if (!isOnline) {
    return (
      <view className="network-banner network-banner--offline">
        <text className="network-banner__text">📡 Нет подключения к сети</text>
      </view>
    );
  }

  if (showBackOnline) {
    return (
      <view className="network-banner network-banner--online">
        <text className="network-banner__text">✅ Подключение восстановлено</text>
      </view>
    );
  }

  return null;
};

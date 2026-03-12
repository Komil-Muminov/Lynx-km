import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGetQuery } from '@shared/api/hooks/index.js';
import './SplashScreen.css';

export interface IGuestSession {
  restaurantId: string;
  tableId: string;
  restaurantName: string;
  logoUrl: string;
  isDemo?: boolean; // Флаг для легкого удаления демо-логики
}

interface IGuestSessionContext {
  session: IGuestSession | null;
  setSession: (s: IGuestSession) => void;
  isLoading: boolean;
  latestOrder: any | null;
}

const GuestSessionContext = createContext<IGuestSessionContext | undefined>(undefined);

// --- КОНФИГУРАЦИЯ ДЕМО-РЕЖИМА (Удалить перед продакшном) ---
const ENABLE_DEMO_MODE = true; 

export const useGuestSession = () => {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) throw new Error('useGuestSession must be used inside GuestSessionProvider');
  return ctx;
};

// Читаем параметры из lynx.__globalProps (нативный клиент передаёт при deeplink)
const getGlobalParam = (key: string): string | null => {
  try {
    const props = (globalThis as any).lynx?.__globalProps ?? {};
    return props[key] ?? null;
  } catch {
    return null;
  }
};

const DEMO_SESSION: IGuestSession = {
  restaurantId: '65b2a1c9e8d4a3b2c1f0e4d5',
  tableId: 'Стол №5',
  restaurantName: 'Демо-ресторан',
  logoUrl: '',
  isDemo: true,
};

interface IProps {
  children: React.ReactNode;
  onReady?: (ready: boolean) => void;
}

export const GuestSessionProvider = ({ children, onReady }: IProps) => {
  const restaurantId = getGlobalParam('restaurantId');
  const tableId = getGlobalParam('tableId');
  const hasQrParams = !!(restaurantId && tableId);

  // null = экран сканирования, IGuestSession = сессия активна
  const [session, setSession] = useState<IGuestSession | null>(null);

  // Для UI-тестирования на моках: если нет параметров QR — сразу заходим в демо
  useEffect(() => {
    if (!hasQrParams && ENABLE_DEMO_MODE && !session) {
      setSession(DEMO_SESSION);
    }
  }, []);

  // Если QR уже просканирован нативным клиентом — сразу грузим данные
  const { data, isLoading, isError } = useGetQuery<IGuestSession>(
    ['scan', restaurantId, tableId],
    '/api/scan',
    { restaurantId: restaurantId ?? '', tableId: tableId ?? '' },
    { enabled: hasQrParams && !session }
  );

  useEffect(() => {
    if (data) setSession(data);
  }, [data]);

  // Полинг статуса заказа для гостя (используем новый публичный эндпоинт)
  const { data: latestOrder } = useGetQuery<any>(
    ['guest-order-status', session?.restaurantId, session?.tableId],
    `/api/orders/status/${session?.restaurantId}/${session?.tableId}`,
    {},
    { 
      enabled: !!session, 
      refetchInterval: 3000 // Опрашиваем чуть чаще для отзывчивости
    }
  );

  const isPaid = latestOrder?.status === 'paid';

  // QR получен через нативный клиент
  if (hasQrParams) {
    if (isLoading) {
      return (
        <view className="splash">
          <view className="splash__content">
            <text className="splash__icon">🍽</text>
            <text className="splash__title">Открываем меню...</text>
            <text className="splash__sub">Загружаем ваш столик</text>
            <view className="splash__loader">
              <view className="splash__dot" />
              <view className="splash__dot" />
              <view className="splash__dot" />
            </view>
          </view>
        </view>
      );
    }

    if (isError || !session) {
      return (
        <view className="splash splash--error">
          <view className="splash__content">
            <text className="splash__icon">❌</text>
            <text className="splash__title">QR-код не распознан</text>
            <text className="splash__sub">Попробуйте отсканировать заново</text>
          </view>
        </view>
      );
    }

    return (
      <GuestSessionContext.Provider value={{ session, setSession, isLoading, latestOrder }}>
        <view className="session-container">
          {children}
        </view>
      </GuestSessionContext.Provider>
    );
  }

  // Нет QR-параметров — показываем экран сканирования
  if (!session) {
    return (
      <view className="qr-scan">
        <view className="qr-scan__bg" />

        <view className="qr-scan__content">
          <view className="qr-scan__header">
            <text className="qr-scan__title">Добро пожаловать</text>
            <text className="qr-scan__sub">Пожалуйста, отсканируйте QR на столике</text>
          </view>

          {/* Иллюстрация сканера */}
          <view className="qr-scan__frame-container">
            <view className="qr-scan__frame">
              <view className="qr-scan__corner qr-scan__corner--tl" />
              <view className="qr-scan__corner qr-scan__corner--tr" />
              <view className="qr-scan__corner qr-scan__corner--bl" />
              <view className="qr-scan__corner qr-scan__corner--br" />
              
              {/* Анимированный луч */}
              <view className="qr-scan__beam" />
              
              <image 
                src="https://img.icons8.com/ios/452/qr-code.png" 
                className="qr-scan__icon-img"
              />
            </view>
            <text className="qr-scan__hint">Наведите камеру на код</text>
          </view>

          <view className="qr-scan__footer">
            {/* Кнопка пропустить — только для тестирования */}
            {ENABLE_DEMO_MODE && (
              <view className="qr-scan__skip press-effect" bindtap={() => setSession(DEMO_SESSION)}>
                <text className="qr-scan__skip-text">Войти в демо-режим</text>
              </view>
            )}
            
            <view className="qr-scan__info">
              <text className="qr-scan__info-text">После сканирования вы сможете сделать заказ и вызвать официанта</text>
            </view>
          </view>
        </view>
      </view>
    );
  }

  return (
    <GuestSessionContext.Provider value={{ session, setSession, isLoading: false, latestOrder }}>
      <view className="session-container">
        {children}
        
        {isPaid && (
          <view className="payment-success-overlay">
            <view className="payment-success-card">
              <view className="payment-success-icon">
                <text className="payment-success-check">✓</text>
              </view>
              <text className="payment-success-title">Счет оплачен</text>
              <text className="payment-success-msg">Спасибо за визит! Будем рады видеть вас снова.</text>
              
              <view className="payment-success-btn press-effect" bindtap={() => {
                // В реальном приложении здесь может быть переход к отзыву или закрытие приложения
                setSession(null); 
              }}>
                <text className="payment-success-btn-txt">Завершить сессию</text>
              </view>
            </view>
          </view>
        )}
      </view>
    </GuestSessionContext.Provider>
  );
};

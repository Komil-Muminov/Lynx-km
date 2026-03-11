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

  // Сообщаем App.tsx, готовы мы (сессия есть) или показываем сканер (сессии нет)
  useEffect(() => {
    onReady?.(!!session);
  }, [session, onReady]);

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
      <GuestSessionContext.Provider value={{ session, setSession, isLoading }}>
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
        <view className="qr-scan__content">
          <text className="qr-scan__title">Добро пожаловать! 👋</text>
          <text className="qr-scan__sub">Отсканируйте QR-код на столике</text>

          {/* Иллюстрация сканера */}
          <view className="qr-scan__frame">
            <view className="qr-scan__corner qr-scan__corner--tl" />
            <view className="qr-scan__corner qr-scan__corner--tr" />
            <view className="qr-scan__corner qr-scan__corner--bl" />
            <view className="qr-scan__corner qr-scan__corner--br" />
            <text className="qr-scan__icon">📷</text>
            <text className="qr-scan__hint">Наведите камеру на QR</text>
          </view>

          {/* Кнопка пропустить — только для тестирования */}
          {ENABLE_DEMO_MODE && (
            <view className="qr-scan__skip" bindtap={() => setSession(DEMO_SESSION)}>
              <text className="qr-scan__skip-text">Пропустить (демо)</text>
            </view>
          )}
        </view>
      </view>
    );
  }

  return (
    <GuestSessionContext.Provider value={{ session, setSession, isLoading: false }}>
      <view className="session-container">
        {children}
      </view>
    </GuestSessionContext.Provider>
  );
};

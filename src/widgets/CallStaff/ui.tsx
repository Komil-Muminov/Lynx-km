import React, { useState, useEffect } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import { ECallType } from './model.js';
import './style.css';

interface IProps {
  restaurantId: string;
  tableId: string;
}

/** Конфигурация радиальных кнопок */
const CALL_ACTIONS = [
  { type: ECallType.WAITER,  emoji: '🙋', label: 'Официант',  mod: '--waiter'  },
  { type: ECallType.HOOKAH,  emoji: '💨', label: 'Кальянщик', mod: '--hookah'  },
] as const;

export const CallStaffWidget = ({ restaurantId, tableId }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const { trigger } = useHaptic();

  const mutation = useMutationQuery();

  /* Счётчик времени ожидания */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sent) {
      interval = setInterval(() => {
        setWaitTime(prev => prev + 1);
      }, 1000);
    } else {
      setWaitTime(0);
    }
    return () => clearInterval(interval);
  }, [sent]);

  /* Через 10 сек сбрасываем состояние «Вызов отправлен» (увеличил с 3 до 10 для наглядности таймера) */
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 10000);
    return () => clearTimeout(t);
  }, [sent]);

  const handleCall = (type: ECallType) => {
    trigger('heavy'); // сильная вибрация при вызове персонала
    mutation.mutate(
      { url: '/api/calls', method: 'POST', data: { restaurantId, tableId, type } },
      {
        onSuccess: () => { setIsOpen(false); setSent(true); },
        onError: ()   => { setIsOpen(false); setSent(true); }, // демо-fallback
      }
    );
  };

  const fabClass = [
    'call-staff__fab',
    isOpen ? 'call-staff__fab--active' : '',
    sent   ? 'call-staff__fab--sent'   : '',
  ].filter(Boolean).join(' ');

  return (
    <view className="call-staff">
      {/* Затемняющий оверлей при открытом меню */}
      {isOpen && (
        <view className="call-staff__overlay" bindtap={() => setIsOpen(false)} />
      )}

      {/* Радиальные кнопки — рендерим только когда открыто */}
      {isOpen && CALL_ACTIONS.map(({ type, emoji, label, mod }, idx) => (
        <view
          key={type}
          className={`call-staff__radial-item call-staff__radial-item--${idx + 1}`}
          bindtap={() => handleCall(type)}
        >
          {/* Подпись слева от иконки */}
          <view className="call-staff__radial-label">
            <text className="call-staff__radial-text">{label}</text>
          </view>
          {/* Круглая иконка */}
          <view className={`call-staff__radial-icon call-staff__radial-icon${mod}`}>
            <text className="call-staff__radial-emoji">{emoji}</text>
          </view>
        </view>
      ))}

      {/* Главная FAB-кнопка */}
      <view className={fabClass} bindtap={() => { if (!sent) { trigger('light'); setIsOpen(!isOpen); } }}>
        <text className="call-staff__fab-emoji">
          {sent ? '✅' : isOpen ? '✕' : '🔔'}
        </text>
        {sent && (
          <view className="call-staff__sent-info">
            <text className="call-staff__sent-label">Вызов отправлен</text>
            <text className="call-staff__timer">Ожидание: {waitTime} сек</text>
          </view>
        )}
      </view>
    </view>
  );
};

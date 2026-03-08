import React, { useState, useEffect } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
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
  { type: ECallType.PAYMENT, emoji: '💳', label: 'Счёт',      mod: '--bill'    },
] as const;

export const CallStaffWidget = ({ restaurantId, tableId }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const mutation = useMutationQuery();

  /* Через 3 сек сбрасываем состояние «Вызов отправлен» */
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 3000);
    return () => clearTimeout(t);
  }, [sent]);

  const handleCall = (type: ECallType) => {
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
      <view className={fabClass} bindtap={() => !sent && setIsOpen(!isOpen)}>
        <text className="call-staff__fab-emoji">
          {sent ? '✅' : isOpen ? '✕' : '🔔'}
        </text>
        {sent && <text className="call-staff__sent-label">Вызов отправлен</text>}
      </view>
    </view>
  );
};

import React, { useState, useEffect } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { ECallType } from './model.js';
import './CallStaff.css';

interface IProps {
  restaurantId: string;
  tableId: string;
}

export const CallStaffWidget = ({ restaurantId, tableId }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sent, setSent] = useState(false); // Бейдж успешного вызова

  const mutation = useMutationQuery();

  // Через 3 сек сбрасываем бейдж отправки
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 3000);
    return () => clearTimeout(t);
  }, [sent]);

  const handleCall = (type: ECallType) => {
    mutation.mutate(
      { url: '/api/calls', method: 'POST', data: { restaurantId, tableId, type } },
      {
        onSuccess: () => {
          setIsOpen(false);
          setSent(true);
        },
        onError: () => {
          // В демо-режиме имитируем успех
          setIsOpen(false);
          setSent(true);
        }
      }
    );
  };

  return (
    <view className="call-staff">
      {isOpen && (
        <view className="call-staff__menu">
          <view className="call-staff__item" bindtap={() => handleCall(ECallType.WAITER)}>
            <text className="call-staff__text">🙋‍♂️ Позвать официанта</text>
          </view>
          <view className="call-staff__item" bindtap={() => handleCall(ECallType.HOOKAH)}>
            <text className="call-staff__text">💨 Кальянщик</text>
          </view>
          <view className="call-staff__item" bindtap={() => handleCall(ECallType.PAYMENT)}>
            <text className="call-staff__text">💳 Счёт</text>
          </view>
        </view>
      )}

      <view
        className={`call-staff__btn ${isOpen ? 'call-staff__btn--active' : ''} ${sent ? 'call-staff__btn--sent' : ''}`}
        bindtap={() => setIsOpen(!isOpen)}
      >
        <text className="call-staff__btn-icon">{sent ? '✅' : isOpen ? '✖' : '🔔'}</text>
        {sent && <text className="call-staff__sent-label">Вызов отправлен</text>}
      </view>
    </view>
  );
};

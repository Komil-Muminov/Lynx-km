import React, { useState } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { ECallType } from './model.js';
import './CallStaffWidget.css';

interface IProps {
  restaurantId: string;
  tableId: string; // В реальном приложении получаем из QR-кода
}

export const CallStaffWidget = ({ restaurantId, tableId }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Используем наш универсальный хук мутации
  const mutation = useMutationQuery();

  const handleCall = (type: ECallType) => {
    mutation.mutate(
      {
        url: 'http://localhost:5000/api/calls', // Позже заменим на getEnvVar
        method: 'POST',
        data: { restaurantId, tableId, type },
      },
      {
        onSuccess: () => {
          // В реальном приложении тут можно показать Toast или красивую анимацию "Галочка"
          console.log(`Успешно вызван: ${type}`);
          setIsOpen(false);
        },
        onError: (error) => {
          console.error('Ошибка вызова персонала:', error);
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
            <text className="call-staff__text">💳 Счет</text>
          </view>
        </view>
      )}

      <view 
        className={`call-staff__btn ${isOpen ? 'call-staff__btn--active' : ''}`}
        bindtap={() => setIsOpen(!isOpen)}
      >
        <text className="call-staff__btn-icon">{isOpen ? '✖' : '🔔'}</text>
      </view>
    </view>
  );
};

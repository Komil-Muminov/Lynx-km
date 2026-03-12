import React, { useState } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { useHaptic, useToast } from '@shared/lib/hooks/index.js';
import './style.css';

interface IProps {
  onLoginSuccess: (user: any) => void;
  onBack: () => void;
}

export const PinLogin = ({ onLoginSuccess, onBack }: IProps) => {
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('992'); // Можно хранить последний номер
  const { trigger } = useHaptic();
  const toast = useToast();

  const mutation = useMutationQuery({
    onSuccess: (data: any) => {
      trigger('success');
      onLoginSuccess(data.user);
    },
    onError: (err: any) => {
      trigger('error');
      setPin('');
      toast.error(err.message || 'Неверный ПИН');
    }
  });

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    trigger('light');
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      mutation.mutate({
        url: '/api/auth/login-pin',
        method: 'POST',
        data: { phone, pin: newPin }
      });
    }
  };

  const handleClear = () => {
    trigger('medium');
    setPin('');
  };

  const handleDelete = () => {
    trigger('light');
    setPin(pin.slice(0, -1));
  };

  return (
    <view className="pin-login">
      <view className="pin-login__header">
        <view className="pin-login__back" bindtap={onBack}>
          <text className="pin-login__back-icon">✕</text>
        </view>
        <text className="pin-login__title">Вход для персонала</text>
      </view>

      <view className="pin-login__content">
        <text className="pin-login__hint">Введите 4-значный ПИН-код</text>
        
        <view className="pin-login__dots">
          {[0, 1, 2, 3].map(i => (
            <view key={i} className={`pin-login__dot ${pin.length > i ? 'pin-login__dot--active' : ''}`} />
          ))}
        </view>

        <view className="numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <view key={num} className="numpad__key press-effect" bindtap={() => handleKeyPress(num.toString())}>
              <text className="numpad__text">{num}</text>
            </view>
          ))}
          <view className="numpad__key numpad__key--secondary" bindtap={handleClear}>
            <text className="numpad__text numpad__text--small">C</text>
          </view>
          <view className="numpad__key press-effect" bindtap={() => handleKeyPress('0')}>
            <text className="numpad__text">0</text>
          </view>
          <view className="numpad__key numpad__key--secondary" bindtap={handleDelete}>
            <text className="numpad__text numpad__text--small">⌫</text>
          </view>
        </view>

        {mutation.isPending && <text className="pin-login__loading">Проверка...</text>}
      </view>
    </view>
  );
};

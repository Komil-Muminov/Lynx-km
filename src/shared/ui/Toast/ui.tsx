import React, { useEffect } from 'react';
import type { IToastProps } from './model.js';
import { TOAST_ICONS } from './model.js';
import './style.css';

/**
 * Toast 2.0 — всплывашка с иконкой, градиентом и прогресс-баром.
 * Автоматически закрывается через `duration` мс.
 */
export const Toast = ({ message, visible, type = 'info', duration = 3000, onClose }: IToastProps) => {
  /* Авто-закрытие */
  useEffect(() => {
    if (!visible || !onClose) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [visible, onClose, duration]);

  const icon = TOAST_ICONS[type];

  /* Класс длительности — раундим до ближайшего шага (1500/2000/3000/4000/5000) */
  const steps = [1500, 2000, 3000, 4000, 5000];
  const closest = steps.reduce((prev, cur) => Math.abs(cur - duration) < Math.abs(prev - duration) ? cur : prev);
  const durationClass = `toast__progress-fill--${closest}`;

  return (
    <view className={`toast toast--${type} ${visible ? 'toast--visible' : ''}`}>
      {/* Основная строка: иконка + текст */}
      <view className="toast__inner">
        <view className="toast__icon-wrap">
          <text className="toast__icon">{icon}</text>
        </view>
        <view className="toast__body">
          <text className="toast__message">{message}</text>
        </view>
      </view>

      {/* Прогресс-бар — показывает сколько осталось */}
      {visible && (
        <view className="toast__progress">
          <view
            className={`toast__progress-fill ${durationClass}`}
          />
        </view>
      )}
    </view>
  );
};

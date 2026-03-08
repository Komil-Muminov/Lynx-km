import React from 'react';
import type { IEmptyStateProps } from './model.js';
import './style.css';

/**
 * Стильная иллюстрация «пустого состояния».
 * Используется вместо пустых списков и ошибок загрузки.
 */
export const EmptyState = ({ icon, title, hint, variant = 'default' }: IEmptyStateProps) => {
  const isError = variant === 'error';

  return (
    <view className="empty-state">
      {/* Иконка в круглом фоне */}
      <view className={`empty-state__icon-wrapper ${isError ? 'empty-state__icon-wrapper--error' : ''}`}>
        <text className="empty-state__icon">{icon}</text>
      </view>

      {/* Заголовок */}
      <text className={`empty-state__title ${isError ? 'empty-state__title--error' : ''}`}>
        {title}
      </text>

      {/* Подсказка (если есть) */}
      {hint && (
        <text className="empty-state__hint">{hint}</text>
      )}

      {/* Декоративные точки */}
      <view className="empty-state__dots">
        <view className="empty-state__dot empty-state__dot--active" />
        <view className="empty-state__dot" />
        <view className="empty-state__dot" />
      </view>
    </view>
  );
};

import React, { useState } from 'react';
import type { IMenuSearchProps } from './model.js';
import './style.css';

/**
 * Поле поиска по меню.
 * В Lynx нет <input> из HTML — используем нативный компонент input.
 */
export const MenuSearch = ({ value, onChange }: IMenuSearchProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <view className={`menu-search ${focused ? 'menu-search--focused' : ''}`}>
      {/* Иконка лупы */}
      <text className="menu-search__icon">🔍</text>

      {/* Нативный Lynx input */}
      <input
        className="menu-search__input"
        placeholder="Найти блюдо..."
        value={value}
        bindinput={(e: any) => onChange(e.detail?.value ?? '')}
        bindfocus={() => setFocused(true)}
        bindblur={() => setFocused(false)}
      />

      {/* Кнопка очистки — показывается только при наличии текста */}
      {value.length > 0 && (
        <view className="menu-search__clear" bindtap={() => onChange('')}>
          <text className="menu-search__clear-icon">✕</text>
        </view>
      )}
    </view>
  );
};

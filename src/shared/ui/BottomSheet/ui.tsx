import React from 'react';
import type { ReactNode } from 'react';
import './style.css';

interface IProps {
  /** Контроль видимости */
  isOpen: boolean;
  /** Колбэк закрытия */
  onClose: () => void;
  /** Контент внутри шторки */
  children: ReactNode;
}

/**
 * Универсальная Bottom Sheet — шторка с деталями снизу экрана.
 * Закрывается кликом по оверлею или по Handle-полоске.
 */
export const BottomSheet = ({ isOpen, onClose, children }: IProps) => {
  if (!isOpen) return null;

  return (
    <view className="bottom-sheet__root">
      {/* Затемнение фона */}
      <view className="bottom-sheet__backdrop" bindtap={onClose} />

      {/* Сама шторка */}
      <view className="bottom-sheet__sheet">
        {/* Полоска-«ручка» для визуального кю */}
        <view className="bottom-sheet__handle-area" bindtap={onClose}>
          <view className="bottom-sheet__handle" />
        </view>

        {/* Контент шторки */}
        <view className="bottom-sheet__content">
          {children}
        </view>
      </view>
    </view>
  );
};

import React, { useState, useCallback } from 'react';
import type { ISwipeableItemProps } from './model.js';
import './style.css';

export const SwipeableItem = ({ 
  children, 
  onSwipeAction, 
  actionText = 'Удалить', 
  actionColor = '#ff3b30' 
}: ISwipeableItemProps) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = useCallback((e: any) => {
    // В Lynx e.touches массив
    if (e.touches && e.touches.length > 0) {
      setStartX(e.touches[0].clientX);
    }
  }, []);

  const handleTouchEnd = useCallback((e: any) => {
    if (e.changedTouches && e.changedTouches.length > 0) {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      // Если свайпнули влево больше чем на 50px - открываем
      if (diff > 50 && !isSwiped) {
        setIsSwiped(true);
      } 
      // Если свайпнули вправо - закрываем
      else if (diff < -30 && isSwiped) {
        setIsSwiped(false);
      }
    }
  }, [startX, isSwiped]);

  const handleActionClick = useCallback(() => {
    setIsSwiped(false);
    onSwipeAction();
  }, [onSwipeAction]);

  return (
    <view className="swipeable">
      {/* Задний фон с кнопкой действия */}
      <view className="swipeable__action-bg" style={{ backgroundColor: actionColor }}>
        <view className="swipeable__action-btn" bindtap={handleActionClick}>
          <text className="swipeable__action-text">{actionText}</text>
        </view>
      </view>

      {/* Основной контент */}
      <view
        className={`swipeable__content ${isSwiped ? 'swipeable__content--swiped' : ''}`}
        bindtouchstart={handleTouchStart}
        bindtouchend={handleTouchEnd}
      >
        {children}
      </view>
    </view>
  );
};

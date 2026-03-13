import React from 'react';
import './style.css';

interface IProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  circle?: boolean;
  className?: string;
}

/**
 * Shared UI: Skeleton
 * Назначение: Отображение анимированного блока-заглушки во время загрузки данных.
 * Поддерживает кастомные размеры и форму (круг/квадрат).
 */
export const Skeleton = ({ 
  width = '100%', 
  height = '100%', 
  borderRadius = '8rpx', 
  circle = false,
  className = ''
}: IProps) => {
  const style = {
    width: typeof width === 'number' ? `${width}rpx` : width,
    height: typeof height === 'number' ? `${height}rpx` : height,
    borderRadius: circle ? '50%' : (typeof borderRadius === 'number' ? `${borderRadius}rpx` : borderRadius),
  };

  return (
    <view 
      className={`skeleton ${className}`} 
      style={style}
    >
      <view className="skeleton__shimmer" />
    </view>
  );
};

import type { ReactNode } from 'react';
import './style.css';

interface ICardProps {
  children: ReactNode;
  className?: string;
  bindtap?: () => void;
}

/**
 * Универсальный компонент карточки с премиальным дизайном.
 * Обеспечивает единые тени, закругления и отступы.
 */
export const Card = ({ children, className = '', bindtap }: ICardProps) => {
  return (
    <view 
      className={`ui-card ${className}`} 
      bindtap={bindtap}
    >
      {children}
    </view>
  );
};

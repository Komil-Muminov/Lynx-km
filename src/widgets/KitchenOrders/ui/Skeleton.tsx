import React from 'react';
import { Skeleton } from '@shared/ui/Skeleton/index.js';

/**
 * Скелетон для карточки заказа на кухне.
 * Повторяет структуру реальной карточки для плавного перехода.
 */
export const KitchenOrdersSkeleton = () => {
  return (
    <view className="kitchen-orders__scroll">
      {[1, 2, 3].map((i) => (
        <view key={i} className="kitchen-orders__card" style={{ opacity: 0.6 }}>
          <view className="kitchen-orders__card-header">
            <Skeleton width="100px" height="20px" borderRadius="4px" />
            <Skeleton width="80px" height="20px" borderRadius="10px" />
          </view>
          
          <Skeleton width="60px" height="14px" style={{ marginBottom: '12px' }} />
          
          <view className="kitchen-orders__items" style={{ gap: '8px' }}>
            <Skeleton width="90%" height="16px" />
            <Skeleton width="70%" height="16px" />
            <Skeleton width="80%" height="16px" />
          </view>
          
          <view className="kitchen-orders__actions">
            <Skeleton width="100%" height="48px" borderRadius="14px" />
          </view>
        </view>
      ))}
    </view>
  );
};

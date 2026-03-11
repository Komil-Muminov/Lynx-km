import React, { useState } from 'react';
import { useMutationQuery } from '@shared/api/hooks/index.js';
import { getEnvVar } from '@shared/config/index.js';
import { useHaptic } from '@shared/lib/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import type { IOrder } from '@entities/Order/index.js';
import { OrderDetailsModal } from './OrderDetailsModal.js';

interface IOrderCheckoutCardProps {
  order: IOrder;
  restaurantId: string;
}

export const OrderCheckoutCard = ({ order, restaurantId }: IOrderCheckoutCardProps) => {
  const queryClient = useQueryClient();
  const { trigger } = useHaptic();
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [tipsVal, setTipsVal] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const statusMutation = useMutationQuery();

  const finalPrice = Math.max(0, order.totalPrice - (order.totalPrice * (discountVal / 100))) + tipsVal;

  const handlePay = (e: any) => {
    // Останавливаем всплытие, чтобы не открывалась модалка при клике на кнопку
    if (e && e.stopPropagation) e.stopPropagation();
    
    statusMutation.mutate(
      {
        url: `${getEnvVar('API_URL')}/api/orders/${order._id}/status`,
        method: 'PUT',
        data: { status: 'paid', discount: discountVal, tips: tipsVal }
      },
      {
        onSuccess: () => {
          setIsPrinting(true);
          setTimeout(() => {
            trigger('success');
            queryClient.invalidateQueries({ queryKey: ['checkout-orders', restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['manager-stats', restaurantId] });
            queryClient.invalidateQueries({ queryKey: ['checkout-history', restaurantId] });
            setIsPrinting(false);
          }, 2000);
        }
      }
    );
  };

  return (
    <>
      <view 
        className={`checkout-card ${isPrinting ? 'checkout-card--printing' : ''}`}
        bindtap={() => setShowDetails(true)}
      >
        <view className="checkout-card__header">
          <view className="checkout-card__table-wrap">
            <text className="checkout-card__table-icon">🪑</text>
            <text className="checkout-card__table-text">Стол: {order.tableId}</text>
          </view>
          <view className={`checkout-card__status checkout-card__status--${order.status}`}>
            <text className="checkout-card__status-text">
              {order.status === 'ready' ? 'Ждет оплаты' : 
               order.status === 'paid' ? 'Оплачено' : 'В работе'}
            </text>
          </view>
        </view>

        <view className="checkout-card__items-summary">
          <text className="checkout-card__items-label">Сумма заказа:</text>
          <text className="checkout-card__items-price">{order.totalPrice} д.</text>
        </view>

        {order.status !== 'paid' && (
          <>
            <view className="checkout-card__modifiers">
              <view className="checkout-card__mod-item">
                <text className="checkout-card__mod-title">Скидка</text>
                <view className="checkout-card__mod-selector" catchtap={() => {}}>
                  <view className="checkout-card__mod-btn press-effect" bindtap={() => setDiscountVal(prev => Math.max(0, prev - 5))}>
                    <text className="checkout-card__mod-btn-icon">−</text>
                  </view>
                  <text className="checkout-card__mod-value">{discountVal}%</text>
                  <view className="checkout-card__mod-btn press-effect" bindtap={() => setDiscountVal(prev => Math.min(100, prev + 5))}>
                    <text className="checkout-card__mod-btn-icon">+</text>
                  </view>
                </view>
              </view>

              <view className="checkout-card__mod-item">
                <text className="checkout-card__mod-title">Чаевые</text>
                <view className="checkout-card__mod-selector" catchtap={() => {}}>
                  <view className="checkout-card__mod-btn press-effect" bindtap={() => setTipsVal(prev => Math.max(0, prev - 5))}>
                    <text className="checkout-card__mod-btn-icon">−</text>
                  </view>
                  <text className="checkout-card__mod-value">{tipsVal} д.</text>
                  <view className="checkout-card__mod-btn press-effect" bindtap={() => setTipsVal(prev => prev + 5)}>
                    <text className="checkout-card__mod-btn-icon">+</text>
                  </view>
                </view>
              </view>
            </view>

            <view className="checkout-card__total">
              <text className="checkout-card__total-label">Итого к оплате</text>
              <text className="checkout-card__total-amount">{Math.round(finalPrice)} д.</text>
            </view>

            <view 
              className={`checkout-card__pay-btn ${isPrinting ? 'checkout-card__pay-btn--printing' : 'press-effect'}`}
              bindtap={isPrinting ? undefined : handlePay}
            >
              <text className="checkout-card__pay-text">
                {isPrinting ? 'Печать чека...' : '💳 Оплатить заказ'}
              </text>
            </view>
          </>
        )}

        {isPrinting && (
          <view className="checkout-card__receipt-paper">
            <view className="checkout-card__receipt-line" />
            <view className="checkout-card__receipt-line checkout-card__receipt-line--short" />
          </view>
        )}
      </view>

      {showDetails && (
        <OrderDetailsModal order={order} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
};

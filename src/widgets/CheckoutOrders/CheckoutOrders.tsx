import React, { useState } from 'react';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import dayjs from 'dayjs';
import type { IOrder } from '@entities/Order/index.js';
import { useQueryClient } from '@tanstack/react-query';
import { getEnvVar } from '@shared/config/index.js';
import './CheckoutOrders.css';

interface IProps {
  restaurantId: string;
}

export const CheckoutOrders = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useGetQuery<IOrder[]>(
    ['checkout-orders', restaurantId],
    `http://localhost:5000/api/orders/restaurant/${restaurantId}`
  );

  const statusMutation = useMutationQuery();

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    statusMutation.mutate(
      {
        url: `http://localhost:5000/api/orders/${orderId}/status`,
        method: 'PUT',
        data: { status: newStatus }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['checkout-orders', restaurantId] });
        }
      }
    );
  };

  if (isLoading) return <text className="checkout-orders__loading">Загрузка кассы...</text>;

  return (
    <view className="checkout-orders">
      <text className="checkout-orders__title">Неоплаченные заказы</text>
      
      <scroll-view className="checkout-orders__scroll" scroll-y>
        {orders?.filter(o => o.status !== 'paid').map((order) => {
          const [discountVal, setDiscountVal] = useState<number>(0);
          const [tipsVal, setTipsVal] = useState<number>(0);
          const [isPrinting, setIsPrinting] = useState(false);

          const finalPrice = Math.max(0, order.totalPrice - (order.totalPrice * (discountVal / 100))) + tipsVal;

          const handlePay = () => {
             // Имитируем API вызов сразу, а анимацию крутим дольше для эффекта
             statusMutation.mutate(
              {
                url: `${getEnvVar('API_URL')}/api/orders/${order._id}/status`,
                method: 'PUT',
                data: { status: 'paid', discount: discountVal, tips: tipsVal }
              },
              {
                onSuccess: () => {
                  setIsPrinting(true); // Запускаем анимацию только после успеха
                  // Даем анимации проиграться перед тем как чек скроется
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['checkout-orders', restaurantId] });
                    setIsPrinting(false);
                  }, 1500);
                }
              }
            );
          };

          return (
            <view key={order._id} className={`checkout-orders__card ${isPrinting ? 'checkout-orders__card--printing' : ''}`}>
              <view className="checkout-orders__card-header">
                <text className="checkout-orders__table">Стол: {order.tableId}</text>
                <text className={`checkout-orders__status-label checkout-orders__status-label--${order.status}`}>
                  {order.status === 'ready' ? 'Ждет расчёта' : 'Ещё готовится'}
                </text>
              </view>
              
              <text className="checkout-orders__amount">Сумма заказа: {order.totalPrice} д.</text>
              
              <view className="checkout-orders__modifiers">
                 <view className="checkout-orders__mod-group">
                   <text className="checkout-orders__mod-label">Скидка (%)</text>
                   <view className="checkout-orders__mod-controls">
                     <view className="checkout-orders__mod-btn press-effect" bindtap={() => setDiscountVal(prev => Math.max(0, prev - 5))}>
                       <text className="checkout-orders__mod-btn-txt">−</text>
                     </view>
                     <text className="checkout-orders__mod-val">{discountVal}%</text>
                     <view className="checkout-orders__mod-btn press-effect" bindtap={() => setDiscountVal(prev => Math.min(100, prev + 5))}>
                       <text className="checkout-orders__mod-btn-txt">+</text>
                     </view>
                   </view>
                 </view>

                 <view className="checkout-orders__mod-group">
                   <text className="checkout-orders__mod-label">Чаевые (д.)</text>
                   <view className="checkout-orders__mod-controls">
                     <view className="checkout-orders__mod-btn press-effect" bindtap={() => setTipsVal(prev => Math.max(0, prev - 10))}>
                       <text className="checkout-orders__mod-btn-txt">−</text>
                     </view>
                     <text className="checkout-orders__mod-val">{tipsVal}</text>
                     <view className="checkout-orders__mod-btn press-effect" bindtap={() => setTipsVal(prev => prev + 10)}>
                       <text className="checkout-orders__mod-btn-txt">+</text>
                     </view>
                   </view>
                 </view>
              </view>

              <view className="checkout-orders__total-bar">
                 <text className="checkout-orders__total-label">К оплате:</text>
                 <text className="checkout-orders__total-val">{Math.round(finalPrice)} д.</text>
              </view>
              
              <view className="checkout-orders__actions">
                <view 
                  className={`checkout-orders__btn checkout-orders__btn--paid ${isPrinting ? 'checkout-orders__btn--printing' : 'press-effect'}`} 
                  bindtap={isPrinting ? undefined : handlePay}
                >
                  <text className="checkout-orders__btn-txt">
                    {isPrinting ? 'Печать чека...' : 'Оплатить счет'}
                  </text>
                </view>
              </view>

              {/* Улучшенная анимация псевдо-чека */}
              {isPrinting && (
                <view className="checkout-orders__receipt-anim">
                  <view className="checkout-orders__receipt-paper">
                    {/* Здесь в теории мини-лого ресторана и штрих-код */}
                  </view>
                </view>
              )}
            </view>
          );
        })}
        
        {orders?.filter(o => o.status !== 'paid').length === 0 && (
          <text className="checkout-orders__empty">Все заказы успешно оплачены! Расслабьтесь ☕</text>
        )}
      </scroll-view>
      
      <view className="checkout__summary">
        <text className="checkout__summary-txt">
          Успешных оплат за сегодня: {orders?.filter(o => o.status === 'paid').length || 0}
        </text>
      </view>
    </view>
  );
};

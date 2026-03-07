import React from 'react';
import dayjs from 'dayjs';
import { useGetQuery, useMutationQuery } from '@shared/api/hooks/index.js';
import { useQueryClient } from '@tanstack/react-query';
import type { ICallMsg } from '@entities/CallStaff/index.js';
import './ActiveCalls.css';

// Форматируем время относительно текущего момента
const timeAgo = (dateStr: string) => {
  const diff = dayjs().diff(dayjs(dateStr), 'second');
  if (diff < 60) return `${diff} сек назад`;
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  return `${Math.floor(diff / 60)} ч назад`;
};

interface IProps {
  restaurantId: string;
}

/**
 * Виджет: ActiveCalls
 * Назначение: Показывает активные вызовы от гостей (принести счет, подойти)
 * Периодически обновляет кэш через React Query (polling)
 */
export const ActiveCalls = ({ restaurantId }: IProps) => {
  const queryClient = useQueryClient();
  
  // Достаем вызовы из мок-API с периодическим обновлением раз в 15 секунд
  const { data: activeCalls, isLoading } = useGetQuery<ICallMsg[]>(
    ['active-calls', restaurantId],
    `/api/calls/active?restaurantId=${restaurantId}`,
    {},
    { 
      refetchInterval: 15000, // Полинг каждые 15 сек
      useMock: true 
    }
  );

  const resolveMutation = useMutationQuery();

  const handleResolve = (callId: string) => {
    resolveMutation.mutate(
      {
        url: `/api/calls/${callId}/resolve`,
        method: 'PUT',
      },
      {
        onSuccess: () => {
          // Инвалидируем кэш, чтобы свежие данные подтянулись моментально
          queryClient.invalidateQueries({ queryKey: ['active-calls', restaurantId] });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <view className="active-calls active-calls--loading">
        <text className="active-calls__txt">Загружаем вызовы...</text>
      </view>
    );
  }

  // Если выкли не нашлись (пустой массив)
  if (!activeCalls || activeCalls.length === 0) {
    return null; // Скрываем блок если нет вызовов
  }

  return (
    <view className="active-calls">
      <view className="active-calls__header">
        <text className="active-calls__title">Вызовы в зал 🔔</text>
        <view className="active-calls__badge">
          <text className="active-calls__badge-txt">{activeCalls.length}</text>
        </view>
      </view>
      
      <scroll-view className="active-calls__scroll" scroll-x>
        {activeCalls.map((call) => (
          <view key={call._id} className={`call-card call-card--${call.reason}`}>
            <view className="call-card__header">
              <text className="call-card__table">{call.tableId}</text>
              <text className="call-card__time">{timeAgo(call.createdAt)}</text>
            </view>
            <text className="call-card__reason">
              {call.reason === 'bill' ? '💳 Просит счет' : '🙋 Зовет официанта'}
            </text>
            
            <view 
              className="call-card__btn" 
              bindtap={() => handleResolve(call._id)}
            >
              <text className="call-card__btn-txt">Подошел</text>
            </view>
          </view>
        ))}
      </scroll-view>
    </view>
  );
};
